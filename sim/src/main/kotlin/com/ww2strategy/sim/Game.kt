package com.ww2strategy.sim

import java.util.PriorityQueue
import java.util.TreeMap
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

/**
 * The rules. One day at a time: the plan of history and the guarantees, the computer's orders,
 * supply, battles, marches, the economy, and then who has had enough.
 *
 * The computer and the player act through the same entry points -- [orderMove], [orderHalt],
 * [build], [cancelBuild], [declareWar], [takeDecision], [answerUltimatum]. A screen that writes
 * to [world] directly is a bug even when it produces the right state.
 */
class Game(val data: GameData, val world: World) {
    private val rules = data.rules
    private val n = data.n
    private val nc = data.countries.size
    private val warSet = HashSet<Int>(world.wars)
    private val divsAt: Array<ArrayList<Division>> = Array(n) { ArrayList() }
    private val zoneCache = HashMap<Int, Int>()
    private val depthCache = HashMap<Int, IntArray>()
    private val ai = Ai(this)

    /** Divisions lost for good, by country, since this object was made: for the headless report. */
    val lost = IntArray(nc)

    init {
        rebuildIndex()
    }

    // ------------------------------------------------------------------ reading the world

    fun cs(c: Int): CountryState = world.countries[c]
    val year: Int get() = Calendar.date(world.day).year
    val month: Int get() = Calendar.date(world.day).month
    fun divisionsIn(r: Int): List<Division> = divsAt[r]
    fun alive(c: Int): Boolean = cs(c).exists && !cs(c).capitulated
    fun atWar(a: Int, b: Int): Boolean = a != b && World.pair(a, b) in warSet
    fun atWarWithAnyone(c: Int): Boolean = (0 until nc).any { atWar(c, it) }
    fun allied(a: Int, b: Int): Boolean = a == b || (cs(a).faction != Faction.NEUTRAL && cs(a).faction == cs(b).faction)
    fun friendlyGround(c: Int, r: Int): Boolean = allied(c, world.controller[r])
    fun enemyGround(c: Int, r: Int): Boolean = atWar(c, world.controller[r])
    fun hostileIn(c: Int, r: Int): Boolean = divsAt[r].any { atWar(c, it.owner) }
    fun quality(c: Int): Double = data.countries[c].qualityIn(year)
    fun inLimitedWar(a: Int, b: Int): Boolean = world.limited.any { (it.by == a && it.on == b) || (it.by == b && it.on == a) }

    private fun rebuildIndex() {
        for (list in divsAt) list.clear()
        for (d in world.divisions) divsAt[d.region].add(d)
    }

    private fun log(kind: String, a: Int = -1, b: Int = -1, region: Int = -1) {
        world.log.add(LogEntry(world.day, kind, a, b, region))
    }

    /** A number in [0, 1) that depends on the seed, the day and what is asked, and on nothing else. */
    fun chance(a: Int, b: Int): Double {
        var x = world.seed + world.day * 0x9E3779B97F4A7C15uL.toLong() + a * 0xBF58476D1CE4E5B9uL.toLong() + b * 0x94D049BB133111EBuL.toLong()
        x = (x xor (x ushr 30)) * 0xBF58476D1CE4E5B9uL.toLong()
        x = (x xor (x ushr 27)) * 0x94D049BB133111EBuL.toLong()
        x = x xor (x ushr 31)
        return (x ushr 11).toDouble() / (1L shl 53).toDouble()
    }

    /** Victory points a state has lost to its enemies, as a share of what it owns. */
    fun lostVp(c: Int): Double {
        var all = 0
        var gone = 0
        for (r in 0 until n) if (world.owner[r] == c) {
            all += data.vp[r]
            if (!allied(c, world.controller[r])) gone += data.vp[r]
        }
        return if (all == 0) 1.0 else gone.toDouble() / all
    }

    /** The fighting weight of a state's whole army: for odds, ultimatums and the report. */
    fun armyPower(c: Int): Double =
        world.divisions.sumOf { if (it.owner == c) (data.unit[it.type.ordinal].fire + data.unit[it.type.ordinal].hold) * it.strength * quality(c) else 0.0 }

    fun divisionCount(c: Int): Int = world.divisions.count { it.owner == c }

    // ------------------------------------------------------------------ weather

    private fun weatherMove(r: Int): Double {
        if (!data.mud[r]) return 1.0
        val w = rules.weather
        return when (month) {
            in w.mudMonths -> w.mudMove
            in w.winterMonths -> w.winterMove
            else -> 1.0
        }
    }

    private fun weatherAttack(c: Int, r: Int): Double {
        if (!data.mud[r]) return 1.0
        val w = rules.weather
        return when {
            month in w.mudMonths -> w.mudAttack
            month in w.winterMonths && !data.countries[c].winterHardy -> w.winterAttack
            else -> 1.0
        }
    }

    // ------------------------------------------------------------------ the sea

    /** 0 nobody disputes it, 1 ours, 2 contested, 3 the enemy's -- for [c] and those it is at war with. */
    fun zoneStatus(c: Int, z: Int): Int = zoneCache.getOrPut(c * 100 + z) {
        var own = 0.0
        var enemy = 0.0
        // Who holds a coast in reach of this sea: by ship from further off than by air.
        val byShip = BooleanArray(nc)
        val byAir = BooleanArray(nc)
        for (r in data.navyCoast[z]) byShip[world.controller[r]] = true
        for (r in data.airCoast[z]) byAir[world.controller[r]] = true
        for (r in 0 until n) if (data.zone[r] == z) { byShip[world.controller[r]] = true; byAir[world.controller[r]] = true }
        for (k in 0 until nc) {
            if (!alive(k) || world.controller[data.capital[k]] != k) continue
            val mine = allied(c, k)
            if (!mine && !atWar(c, k)) continue
            val def = data.countries[k]
            // A fleet can lie in an ally's harbour; aircraft fly from one's own fields.
            var power = 0.0
            if ((0 until nc).any { byShip[it] && allied(k, it) }) power += data.presence[z][k] * def.navy
            if (byAir[k]) power += def.air * rules.sea.airWeight
            if (mine) own += power else enemy += power
        }
        when {
            enemy <= 0.0 -> 0
            own / enemy >= rules.sea.dominance -> 1
            own / enemy <= 1.0 / rules.sea.dominance -> 3
            else -> 2
        }
    }

    private fun worstZone(c: Int, route: Route): Int = route.zones.maxOf { zoneStatus(c, it) }

    /** Whether [c] may ship a division along [route]: never through the enemy's sea, and onto a held shore only through its own. */
    fun seaLegOpen(c: Int, route: Route): Boolean {
        val worst = worstZone(c, route)
        if (worst == 3) return false
        if (enemyGround(c, route.to) && worst == 2) return false
        return friendlyGround(c, route.to) || enemyGround(c, route.to)
    }

    // ------------------------------------------------------------------ paths and marches

    /** The way from one region to another through land [c] may cross, or null. Friendly ground is preferred to the enemy's. */
    fun findPath(c: Int, from: Int, to: Int): IntArray? {
        if (from == to) return IntArray(0)
        val cost = DoubleArray(n) { Double.MAX_VALUE }
        val prev = IntArray(n) { -1 }
        val open = PriorityQueue<Pair<Double, Int>>(compareBy<Pair<Double, Int>> { it.first }.thenBy { it.second })
        cost[from] = 0.0
        open.add(0.0 to from)
        while (open.isNotEmpty()) {
            val (at, r) = open.poll()
            if (at > cost[r]) continue
            if (r == to) break
            // Through the enemy's land one fights for every step: a path leads into it, not across it, unless it ends there.
            for (k in data.adj[r].indices) {
                val next = data.adj[r][k]
                val friendly = friendlyGround(c, next)
                if (!friendly && !enemyGround(c, next)) continue
                val step = data.adjKm[r][k] / 30.0 / data.terrain[next].move + if (friendly) 0.0 else 12.0
                if (at + step < cost[next]) { cost[next] = at + step; prev[next] = r; open.add(cost[next] to next) }
            }
            for (route in data.routes[r]) {
                if (!seaLegOpen(c, route)) continue
                val step = rules.movement.seaLoadDays + route.km / rules.movement.seaKmPerDay + 3.0 + if (friendlyGround(c, route.to)) 0.0 else 12.0
                if (at + step < cost[route.to]) { cost[route.to] = at + step; prev[route.to] = r; open.add(cost[route.to] to route.to) }
            }
        }
        if (prev[to] == -1) return null
        val path = ArrayList<Int>()
        var at = to
        while (at != from) { path.add(at); at = prev[at] }
        return path.reversed().toIntArray()
    }

    private fun beginLeg(d: Division) {
        val next = d.path[0]
        val k = data.adj[d.region].indexOf(next)
        d.progress = 0.0
        if (k < 0) {
            val route = data.routes[d.region].first { it.to == next }
            d.bySea = true
            d.legDays = rules.movement.seaLoadDays + route.km / rules.movement.seaKmPerDay
            return
        }
        d.bySea = false
        val u = data.unit[d.type.ordinal]
        var speed = u.speed * data.terrain[next].move * weatherMove(next)
        if (u.fuel > 0 && cs(d.owner).noFuel) speed *= rules.movement.noFuelSpeed
        if (friendlyGround(d.owner, next) && friendlyGround(d.owner, d.region)) speed *= rules.movement.friendlyRail
        var days = data.adjKm[d.region][k] / speed
        if (data.adjRiver[d.region][k]) days += rules.movement.riverDays
        if (data.adjStrait[d.region][k]) days += rules.movement.straitDays
        d.legDays = max(rules.movement.minDays, days)
    }

    private fun halt(d: Division) {
        d.path = IntArray(0)
        d.progress = 0.0
        d.bySea = false
    }

    private fun place(d: Division, r: Int) {
        divsAt[d.region].remove(d)
        d.region = r
        // Kept in the order of their numbers, as a loaded game has them: who stands where must not depend on who came first.
        val list = divsAt[r]
        var at = list.size
        while (at > 0 && list[at - 1].id > d.id) at--
        list.add(at, d)
        d.entrench = 0.0
    }

    private fun destroy(d: Division) {
        divsAt[d.region].remove(d)
        world.divisions.remove(d)
        lost[d.owner]++
    }

    private fun capture(r: Int, by: Int) {
        val owner = world.owner[r]
        world.controller[r] = if (owner != by && allied(by, owner) && alive(owner)) owner else by
        if (data.vp[r] >= 8 || data.capital.contains(r)) log("CAPTURE", world.controller[r], owner, r)
        zoneCache.clear()
    }

    private fun march() {
        for (d in world.divisions.toList()) {
            if (d.path.isEmpty()) continue
            val next = d.path[0]
            if (!friendlyGround(d.owner, next) && !enemyGround(d.owner, next)) { halt(d); continue }
            if (d.bySea) {
                val route = data.routes[d.region].firstOrNull { it.to == next }
                if (route == null || !seaLegOpen(d.owner, route)) { halt(d); continue }
            }
            d.activeDay = world.day
            d.progress = min(d.progress + 1.0, d.legDays)
            if (hostileIn(d.owner, next) || d.progress < d.legDays) continue
            if (d.bySea) {
                val route = data.routes[d.region].first { it.to == next }
                if (worstZone(d.owner, route) == 2) d.strength *= 1.0 - rules.sea.contestedLoss
            }
            place(d, next)
            d.path = d.path.copyOfRange(1, d.path.size)
            d.bySea = false
            if (enemyGround(d.owner, next)) capture(next, d.owner)
            if (d.path.isNotEmpty()) beginLeg(d)
        }
    }

    /** How many regions lie between each region and the nearest land that was [c]'s side's own at the start. */
    private fun depth(c: Int): IntArray = depthCache.getOrPut(blocKey(c)) {
        val hops = IntArray(n) { -1 }
        val queue = ArrayDeque<Int>()
        for (r in 0 until n) if (allied(c, data.startOwner[r]) && friendlyGround(c, r)) { hops[r] = 0; queue.add(r) }
        while (queue.isNotEmpty()) {
            val at = queue.removeFirst()
            for (next in data.adj[at]) if (hops[next] < 0 && (friendlyGround(c, next) || enemyGround(c, next))) { hops[next] = hops[at] + 1; queue.add(next) }
        }
        hops
    }

    private fun reach(c: Int, r: Int): Double {
        val hops = depth(c)[r]
        if (hops <= 1) return 1.0
        return 1.0 - min(rules.supply.depthPenaltyMax, rules.supply.depthPenaltyPerRegion * (hops - 1))
    }

    // ------------------------------------------------------------------ battles

    private fun surprise(c: Int, other: Int): Double {
        val key = World.pair(c, other)
        val began = world.warStart[key] ?: return 1.0
        return if (world.warOpener[key] == c && world.day - began < rules.combat.surpriseDays) rules.combat.surprisePower else 1.0
    }

    /** What one day of a battle does: the share of its organisation each side's line loses, and who stood in the line. */
    class Clash(val attackers: List<Division>, val defenders: List<Division>, val attackerHits: DoubleArray, val defenderHits: DoubleArray) {
        /** Hits a day on the average division of each line. */
        val onAttackers: Double get() = if (attackers.isEmpty()) 0.0 else attackerHits.sum() / attackers.size
        val onDefenders: Double get() = if (defenders.isEmpty()) 0.0 else defenderHits.sum() / defenders.size
    }

    private fun frontOf(d: Division): Double = data.unit[d.type.ordinal].front * (0.5 + 0.5 * d.size)

    /** The divisions the frontage has room for, the freshest first. The last may stand a little past it. */
    private fun line(all: List<Division>, room: Double, order: Comparator<Division>, landing: (Division) -> Boolean): Pair<List<Division>, Double> {
        val c = rules.combat
        val out = ArrayList<Division>()
        var used = 0.0
        var beach = 0.0
        for (d in all.sortedWith(order)) {
            val front = frontOf(d)
            if (used + front > room * (1.0 + c.overflowMax)) continue
            if (landing(d)) { if (beach + front > c.landingFront) continue; beach += front }
            out.add(d)
            used += front
            if (used >= room) break
        }
        return out to maxOf(0.0, used - room) / room
    }

    /** How much of his fire and drive an attacker of [target] keeps: ground, crossing, works, weather, supply, surprise, the way home. */
    private fun attackerShare(d: Division, target: Int, defender: Int, flanks: Int): Double {
        val c = rules.combat
        val u = data.unit[d.type.ordinal]
        var p = quality(d.owner) * data.terrain[target].attackOf(d.type)
        val k = data.adj[d.region].indexOf(target)
        if (k < 0) p *= c.landing else {
            if (data.adjRiver[d.region][k]) p *= c.riverCrossing
            if (data.adjStrait[d.region][k]) p *= c.straitCrossing
        }
        // Works face the way they were built, and each further direction of attack turns one level of them, never the last.
        if (data.fort[target] > 0 && allied(defender, data.startOwner[target])) {
            val levels = maxOf(1, data.fort[target] - (flanks - 1))
            p *= maxOf(c.fortMinFire, 1.0 - c.fortPerLevel * levels)
        }
        if (!d.supplied) p *= c.noSupplyPower
        if (u.fuel > 0 && cs(d.owner).noFuel) p *= c.noFuelPower
        return p * weatherAttack(d.owner, target) * surprise(d.owner, defender) * reach(d.owner, target)
    }

    private fun defenderShare(d: Division, attacker: Int, cutOff: Boolean): Double {
        val c = rules.combat
        var p = quality(d.owner) * (1.0 + d.entrench)
        if (!d.supplied) p *= c.noSupplyPower
        if (cutOff) p *= c.encircled
        return p * surprise(d.owner, attacker)
    }

    /** The fire of [a] that [t] draws: against its men and against its armour, and less where the guns cannot go through its plate. */
    private fun fireOn(a: Division, t: Division): Double {
        val c = rules.combat
        val ua = data.unit[a.type.ordinal]
        val ut = data.unit[t.type.ordinal]
        var fire = ua.fire * (1.0 - ut.armoured) + ua.antiTank * ut.armoured
        if (ut.plate > ua.pierce) {
            fire *= when {
                ua.pierce >= c.pierceGood * ut.plate -> c.pierceGoodFire
                ua.pierce >= c.pierceHalf * ut.plate -> c.pierceHalfFire
                else -> c.pierceNoneFire
            }
        }
        return fire * a.strength
    }

    /** Hits a day on each division of [targets] from [shooters]. [share] scales a shooter's fire, [cover] is what a target can take under cover. */
    private fun volley(shooters: List<Division>, targets: List<Division>, share: (Division) -> Double, cover: (Division) -> Double, sidePenalty: Double): DoubleArray {
        val c = rules.combat
        val incoming = DoubleArray(targets.size)
        if (shooters.isEmpty() || targets.isEmpty()) return incoming
        val fronts = DoubleArray(targets.size) { frontOf(targets[it]) }
        val all = fronts.sum()
        var weakest = 0
        for (i in targets.indices) if (targets[i].org < targets[weakest].org) weakest = i
        for (a in shooters) {
            val keep = share(a) * sidePenalty
            for (i in targets.indices) {
                val part = (1.0 - c.focus) * fronts[i] / all + if (i == weakest) c.focus else 0.0
                incoming[i] += fireOn(a, targets[i]) * keep * part
            }
        }
        // A division no gun in the enemy's line can pierce shakes him more.
        val best = targets.maxOf { data.unit[it.type.ordinal].pierce }
        val shock = if (shooters.any { data.unit[it.type.ordinal].plate > best }) {
            val plated = shooters.count { data.unit[it.type.ordinal].plate > best }.toDouble() / shooters.size
            1.0 + (c.unpiercedShock - 1.0) * plated
        } else 1.0
        return DoubleArray(targets.size) { i ->
            val held = minOf(incoming[i], cover(targets[i]))
            (held * c.hitHeld + (incoming[i] - held) * c.hitOpen) * shock
        }
    }

    /** One day of the battle for [target] between [candidates] attacking it and those who hold it. Changes nothing. */
    fun clash(target: Int, candidates: List<Division>): Clash? {
        if (candidates.isEmpty()) return null
        val c = rules.combat
        val side = candidates[0].owner
        val holding = divsAt[target].filter { atWar(side, it.owner) }
        if (holding.isEmpty()) return null
        val flanks = candidates.map { it.region }.distinct().size
        val ground = data.terrain[target].frontage
        val room = ground * (1.0 + c.flankFrontage * minOf(2, flanks - 1))
        val order = compareByDescending<Division> { it.org }.thenBy { it.id }
        val (attackers, over) = line(candidates.filter { atWar(it.owner, holding[0].owner) }, room, order) { data.adj[it.region].indexOf(target) < 0 }
        val (defenders, _) = line(holding, ground, order) { false }
        if (attackers.isEmpty() || defenders.isEmpty()) return null
        val crowd = maxOf(0, candidates.size - (c.stack + c.stackPerFlank * minOf(2, flanks - 1)))
        val attackPenalty = (1.0 - over) * maxOf(0.5, 1.0 - c.stackPenalty * crowd)
        val cutOff = data.adj[target].none { friendlyGround(holding[0].owner, it) && !hostileIn(holding[0].owner, it) }
        val defender = defenders[0].owner
        val works = if (allied(defender, data.startOwner[target])) 1.0 + c.fortCover * maxOf(0, data.fort[target] - (flanks - 1).coerceAtMost(maxOf(0, data.fort[target] - 1))) else 1.0
        val onDefenders = volley(attackers, defenders, { attackerShare(it, target, defender, flanks) },
            { data.unit[it.type.ordinal].hold * it.strength * defenderShare(it, side, cutOff) * data.terrain[target].defense * works }, attackPenalty)
        val onAttackers = volley(defenders, attackers, { defenderShare(it, side, cutOff) },
            { data.unit[it.type.ordinal].drive * it.strength * attackerShare(it, target, defender, flanks) }, 1.0)
        return Clash(attackers, defenders, onAttackers, onDefenders)
    }

    private fun retreat(d: Division, underAttack: Set<Int>) {
        var best = -1
        var bestScore = Double.NEGATIVE_INFINITY
        for (next in data.adj[d.region]) {
            if (!friendlyGround(d.owner, next) || hostileIn(d.owner, next)) continue
            var score = -data.adj[next].count { enemyGround(d.owner, it) }.toDouble()
            if (next in underAttack) score -= 10
            if (world.controller[next] == d.owner) score += 0.5
            score += data.vp[next] * 0.01
            if (score > bestScore) { bestScore = score; best = next }
        }
        if (best == -1) { destroy(d); return }
        place(d, best)
        halt(d)
        d.regroupUntil = world.day + rules.combat.regroupDays
    }

    private fun fight() {
        val c = rules.combat
        val attacks = TreeMap<Int, ArrayList<Division>>()
        for (d in world.divisions) {
            if (d.path.isEmpty() || d.org < c.attackMinOrg || world.day < d.regroupUntil) continue
            if (hostileIn(d.owner, d.path[0])) attacks.getOrPut(d.path[0]) { ArrayList() }.add(d)
        }
        for ((target, all) in attacks) {
            val day = clash(target, all) ?: continue
            val luck = (chance(target, 7) * 2 - 1) * c.dice
            world.battleDay[target] = world.day
            fun wear(d: Division, hits: Double) {
                // A hit costs a small formation more of itself than a large one.
                d.org = max(0.0, d.org - hits * c.orgPerHit / d.size)
                d.strength -= hits * c.strengthPerHit
                d.foughtDay = world.day
                d.activeDay = world.day
            }
            for ((i, d) in day.defenders.withIndex()) wear(d, day.defenderHits[i] * (1.0 + luck))
            for ((i, d) in day.attackers.withIndex()) wear(d, day.attackerHits[i] * (1.0 - luck))
            for (d in day.defenders) {
                if (d.strength < 0.05 * d.size) destroy(d) else if (d.org <= c.breakOrg) retreat(d, attacks.keys)
            }
            for (d in day.attackers) {
                if (d.strength < 0.05 * d.size) destroy(d)
                else if (d.org <= c.breakOrg) { halt(d); d.regroupUntil = world.day + c.regroupDays }
            }
        }
    }

    // ------------------------------------------------------------------ supply

    private fun blocKey(c: Int): Int = if (cs(c).faction == Faction.NEUTRAL) 100 + c else cs(c).faction.ordinal

    /** The regions a division of [c] can be fed in: joined by friendly land to a capital of its side or to a port its side's ships can reach. */
    fun suppliedRegions(c: Int): BooleanArray {
        val ok = BooleanArray(n)
        val queue = ArrayDeque<Int>()
        fun source(r: Int) { if (!ok[r]) { ok[r] = true; queue.add(r) } }
        for (m in 0 until nc) if (alive(m) && allied(c, m) && friendlyGround(c, data.capital[m])) source(data.capital[m])
        for (r in 0 until n) if (data.port[r] && friendlyGround(c, r) && zoneStatus(c, data.zone[r]) != 3) source(r)
        while (queue.isNotEmpty()) {
            val at = queue.removeFirst()
            for (next in data.adj[at]) if (!ok[next] && friendlyGround(c, next)) { ok[next] = true; queue.add(next) }
        }
        return ok
    }

    private fun supply() {
        val s = rules.supply
        val reach = HashMap<Int, BooleanArray>()
        for (d in world.divisions.toList()) {
            if (!atWarWithAnyone(d.owner)) { d.supplied = true; continue }
            d.supplied = reach.getOrPut(blocKey(d.owner)) { suppliedRegions(d.owner) }[d.region]
            if (d.supplied) continue
            d.org = max(0.0, d.org - s.orgLossPerDay)
            d.strength -= s.strengthLossPerDay * d.size
            if (d.strength < 0.1 * d.size) destroy(d)
        }
    }

    // ------------------------------------------------------------------ the economy

    private fun warYears(c: Int): Double = if (cs(c).warSince < 0) 0.0 else (world.day - cs(c).warSince) / 365.0

    fun industry(c: Int): Double {
        val e = rules.economy
        var sum = 0.0
        for (r in 0 until n) if (world.controller[r] == c) {
            sum += data.factories[r] * if (world.owner[r] == c) 1.0 else rules.supply.occupationYield
        }
        val pace = if (atWarWithAnyone(c)) min(e.warEconomyMax, 1.0 + e.warEconomyPerYear * warYears(c)) else e.peaceEconomy
        return sum * pace
    }

    fun fuelIncome(c: Int): Double {
        var sum = 0.0
        for (r in 0 until n) if (world.controller[r] == c && data.oil[r] > 0) {
            sum += data.oil[r] * if (world.owner[r] == c) 1.0 else rules.supply.occupationYield
        }
        sum *= rules.economy.fuelPerOilPerDay
        if (world.controller[data.capital[c]] == c) sum += data.countries[c].overseasFuel
        for (deal in data.scenario.oilDeals) {
            val to = data.country(deal.to)
            val from = data.country(deal.from)
            if (to != c || !alive(from) || atWar(from, to)) continue
            if (deal.start.isNotEmpty() && world.day < Calendar.day(deal.start)) continue
            sum += deal.perDay
        }
        return sum
    }

    /** Where a new division appears: the capital, or the home region with the most factories still held. */
    fun deployRegion(c: Int): Int {
        if (world.controller[data.capital[c]] == c) return data.capital[c]
        return (0 until n).filter { world.controller[it] == c && world.owner[it] == c }.maxByOrNull { data.factories[it] } ?: -1
    }

    private fun spawn(c: Int, type: UnitType, r: Int) {
        val d = Division(world.nextDivision++, c, type, 1.0, 1.0, rules.economy.newDivisionOrg, r)
        world.divisions.add(d)
        divsAt[r].add(d)
    }

    private fun economy() {
        val e = rules.economy
        val s = rules.supply
        val firstOfMonth = Calendar.date(world.day).day == 1
        val mine = Array(nc) { ArrayList<Division>() }
        for (d in world.divisions) mine[d.owner].add(d)
        for (c in 0 until nc) {
            val state = cs(c)
            if (!alive(c)) continue
            var budget = industry(c)
            state.icNow = budget
            // Rest, digging in and replacements for whoever is out of battle and fed.
            var forReplacements = budget * 0.4
            var fuelUsed = 0.0
            for (d in mine[c]) {
                val u = data.unit[d.type.ordinal]
                fuelUsed += u.fuel * if (d.activeDay == world.day) 1.0 else 0.2
                if (!d.supplied || d.foughtDay == world.day) continue
                // There is no rest where the battle is: a division waiting its turn in a region under attack does not recover.
                if (world.battleDay[d.region] != world.day) d.org = min(1.0, d.org + if (d.moving) s.orgGainMovingPerDay else s.orgGainPerDay)
                if (!d.moving) d.entrench = min(rules.combat.entrenchMax, d.entrench + rules.combat.entrenchPerDay)
                if (d.strength < d.size) {
                    val more = min(s.reinforcePerDay * d.size, d.size - d.strength)
                    val cost = more * u.cost * s.reinforceCostShare
                    val men = more * u.manpower
                    if (cost <= forReplacements && men <= state.manpower) {
                        d.strength += more
                        forReplacements -= cost
                        budget -= cost
                        state.manpower -= men
                    }
                }
            }
            // Production: the lines in order.
            val iterator = state.queue.iterator()
            val deployAt = deployRegion(c)
            while (iterator.hasNext()) {
                val line = iterator.next()
                val u = data.unit[line.type.ordinal]
                val price = u.cost * data.countries[c].divisionCost
                val give = min(budget, price - line.done)
                line.done += give
                budget -= give
                if (line.done >= price - 1e-9 && state.manpower >= u.manpower && deployAt >= 0) {
                    state.manpower -= u.manpower
                    spawn(c, line.type, deployAt)
                    iterator.remove()
                }
                if (budget <= 0.0) break
            }
            // Fuel.
            val income = fuelIncome(c)
            state.fuelIncome = income
            state.fuel = (state.fuel + income - fuelUsed).coerceIn(0.0, max(income, 5.0) * e.fuelStockDays)
            state.noFuel = state.fuel <= 0.0 && fuelUsed > income
            if (firstOfMonth) {
                var people = 0.0
                for (r in 0 until n) if (world.owner[r] == c && world.controller[r] == c) people += data.people[r]
                state.manpower += people * e.manpowerPerMillionPerMonth * data.countries[c].mobilisation * if (atWarWithAnyone(c)) 1.0 else e.peaceManpowerShare
            }
        }
    }

    // ------------------------------------------------------------------ orders: the entry points

    /** Send divisions of [c] to [target]. Returns how many went. */
    fun orderMove(c: Int, ids: Collection<Int>, target: Int): Int {
        var sent = 0
        val wanted = ids.toHashSet()
        for (d in world.divisions) {
            if (d.owner != c || d.id !in wanted) continue
            if (d.region == target) { halt(d); continue }
            val path = findPath(c, d.region, target) ?: continue
            d.path = path
            beginLeg(d)
            sent++
        }
        return sent
    }

    fun orderHalt(c: Int, ids: Collection<Int>) {
        val wanted = ids.toHashSet()
        for (d in world.divisions) if (d.owner == c && d.id in wanted) halt(d)
    }

    fun build(c: Int, type: UnitType): Boolean {
        val state = cs(c)
        if (!alive(c) || state.queue.size >= rules.economy.productionLines) return false
        state.queue.add(ProductionLine(type))
        return true
    }

    fun cancelBuild(c: Int, index: Int): Boolean {
        val state = cs(c)
        if (index !in state.queue.indices) return false
        state.queue.removeAt(index)
        return true
    }

    /** Whether [by] may declare war on [on] at all. */
    fun canDeclareWar(by: Int, on: Int): Boolean =
        by != on && alive(by) && alive(on) && !atWar(by, on) && !allied(by, on)

    /** A full declaration of war: alliances and guarantees are drawn in. */
    fun declareWar(by: Int, on: Int): Boolean {
        if (!canDeclareWar(by, on)) return false
        world.pacts.remove(World.pair(by, on))
        openWar(by, on, limited = false)
        return true
    }

    // ------------------------------------------------------------------ wars, alliances, peace

    private fun setWar(a: Int, b: Int, opener: Int) {
        if (a == b || atWar(a, b) || !alive(a) || !alive(b)) return
        val key = World.pair(a, b)
        warSet.add(key)
        world.wars.add(key)
        world.warStart[key] = world.day
        world.warOpener[key] = opener
        for (c in intArrayOf(a, b)) if (cs(c).warSince < 0) cs(c).warSince = world.day
        if (opener == b) log("WAR", b, a) else log("WAR", a, b)
        zoneCache.clear()
    }

    private fun endWar(a: Int, b: Int) {
        val key = World.pair(a, b)
        if (!warSet.remove(key)) return
        world.wars.remove(key)
        zoneCache.clear()
    }

    private fun members(f: Faction): List<Int> = if (f == Faction.NEUTRAL) emptyList() else (0 until nc).filter { alive(it) && cs(it).faction == f }

    /** The faction already at war with [f]'s members, if there is one: the side a neutral falls to when [f] attacks it. */
    private fun opposing(f: Faction): Faction {
        if (f == Faction.NEUTRAL) return Faction.NEUTRAL
        val foes = members(f)
        for (g in Faction.entries) {
            if (g == Faction.NEUTRAL || g == f) continue
            if (members(g).any { m -> foes.any { atWar(m, it) && !inLimitedWar(m, it) } }) return g
        }
        return Faction.NEUTRAL
    }

    private fun joinFaction(c: Int, f: Faction) {
        if (cs(c).faction == f || f == Faction.NEUTRAL) return
        // Whoever its new friends fight, it fights -- but not their local wars.
        val foes = (0 until nc).filter { x -> alive(x) && members(f).any { atWar(it, x) && !inLimitedWar(it, x) } }
        cs(c).faction = f
        log("JOIN", c, f.ordinal)
        for (x in foes) if (!allied(c, x)) setWar(c, x, c)
        zoneCache.clear()
    }

    private fun openWar(by: Int, on: Int, limited: Boolean) {
        setWar(by, on, by)
        if (limited) return
        val attackers = members(cs(by).faction)
        // A neutral that is attacked falls to the side already fighting its attacker.
        if (cs(on).faction == Faction.NEUTRAL) {
            val side = opposing(cs(by).faction)
            if (side != Faction.NEUTRAL) joinFaction(on, side)
        }
        val defenders = members(cs(on).faction)
        for (m in defenders) for (a in attackers + by) setWar(a, m, by)
        for (a in attackers) setWar(a, on, by)
        // A war that widens opens a new campaign: the side that widened it has the first weeks' surprise
        // against everyone it now fights there (10 May 1940 was a surprise to France too).
        for (m in defenders + on) if (atWar(by, m)) {
            world.warStart[World.pair(by, m)] = world.day
            world.warOpener[World.pair(by, m)] = by
        }
        for (g in data.scenario.guarantees) {
            val guarantor = data.country(g.by)
            if (data.country(g.of) != on || data.country(g.against) != by || !alive(guarantor) || atWar(guarantor, by)) continue
            world.guarantees.add(PendingGuarantee(world.day + g.delayDays, guarantor, on, by))
        }
    }

    private fun honourGuarantees() {
        val due = world.guarantees.filter { it.day <= world.day }
        world.guarantees.removeAll(due)
        for (g in due) {
            if (!alive(g.by) || !alive(g.of) || !atWar(g.of, g.against)) continue
            if (!atWar(g.by, g.against)) openWar(g.by, g.against, limited = false)
            if (cs(g.of).faction == Faction.NEUTRAL) joinFaction(g.of, cs(g.by).faction)
        }
    }

    /** Divisions standing on land that is no longer theirs to stand on go home. */
    private fun sendHome(c: Int) {
        val home = deployRegion(c)
        for (d in world.divisions.toList()) {
            if (d.owner != c || friendlyGround(c, d.region) || enemyGround(c, d.region)) continue
            if (home < 0) destroy(d) else { place(d, home); halt(d) }
        }
    }

    private fun handOver(regions: IntArray, to: Int) {
        for (r in regions) { world.owner[r] = to; world.controller[r] = to }
        zoneCache.clear()
    }

    private fun closeLimitedWars() {
        val d = rules.diplomacy
        for (w in world.limited.toList()) {
            val held = w.regions.count { world.controller[it] == w.by }
            val won = held >= d.limitedWarGoalShare * w.regions.size
            val over = !alive(w.on) || !alive(w.by) || world.day - w.startDay > d.limitedWarMaxDays
            if (!won && !over) continue
            world.limited.remove(w)
            if (!alive(w.by)) continue
            // The land fought for goes over; everything else taken on either side goes back.
            handOver(if (won || !alive(w.on)) w.regions.filter { world.controller[it] == w.by || world.controller[it] == w.on || !atWar(w.by, world.controller[it]) }.toIntArray()
                     else w.regions.filter { world.controller[it] == w.by }.toIntArray(), w.by)
            for (r in 0 until n) {
                if (world.owner[r] == w.on && world.controller[r] == w.by) world.controller[r] = w.on
                if (world.owner[r] == w.by && world.controller[r] == w.on) world.controller[r] = w.by
            }
            endWar(w.by, w.on)
            log("PEACE", w.by, w.on)
            sendHome(w.by)
            sendHome(w.on)
        }
    }

    private fun capitulate(c: Int) {
        val victor = world.controller[data.capital[c]].takeIf { atWar(c, it) }
            ?: (0 until nc).filter { atWar(c, it) }.maxByOrNull { k -> (0 until n).count { world.owner[it] == c && world.controller[it] == k } }
            ?: return
        log("CAPITULATE", c, victor)
        // Land a neighbour is fighting a local war for goes to him, whoever stands on it (the line of 28 September 1939).
        for (w in world.limited.toList()) if (w.on == c) {
            handOver(w.regions.filter { world.owner[it] == c }.toIntArray(), w.by)
            world.limited.remove(w)
            endWar(w.by, c)
            for (d in world.divisions.toList()) if (d.owner != w.by && !allied(d.owner, w.by) && d.region in w.regions && d.owner != c) {
                val home = deployRegion(d.owner)
                if (home >= 0) { place(d, home); halt(d) }
            }
        }
        val outcome = data.scenario.outcomes[data.countries[c].tag]
        val state = cs(c)
        var keeper = victor
        if (outcome != null && outcome.kind == "armistice" && data.country(outcome.to) == victor) {
            val heir = data.country(outcome.state)
            val heirState = cs(heir)
            heirState.exists = true
            heirState.capitulated = false
            heirState.faction = Faction.NEUTRAL
            heirState.manpower = state.manpower * 0.3
            val kept = outcome.regions.map { data.region(it) }.filter { world.controller[it] == c }.toHashSet()
            for (r in kept) { world.owner[r] = heir; world.controller[r] = heir }
            for (d in world.divisions) if (d.owner == c && d.region in kept) { d.owner = heir; d.path = IntArray(0) }
            log("ARMISTICE", heir, victor)
        } else if (outcome != null && outcome.kind == "ally" && alive(data.country(outcome.state)) && allied(c, data.country(outcome.state))) {
            keeper = data.country(outcome.state)
        }
        for (d in world.divisions.toList()) if (d.owner == c) { divsAt[d.region].remove(d); world.divisions.remove(d) }
        for (r in 0 until n) if (world.controller[r] == c) world.controller[r] = keeper
        state.capitulated = true
        state.queue.clear()
        for (k in 0 until nc) endWar(c, k)
        world.guarantees.removeAll { it.of == c || it.by == c }
        for (k in 0 until nc) if (alive(k)) sendHome(k)
        zoneCache.clear()
    }

    private fun checkCapitulations() {
        for (c in 0 until nc) {
            if (!alive(c) || !atWarWithAnyone(c)) continue
            val share = data.countries[c].capitulation.takeIf { it > 0 } ?: rules.diplomacy.capitulationDefault
            val lostShare = lostVp(c)
            val capitalLost = !friendlyGround(c, data.capital[c])
            if (!((capitalLost && lostShare >= share) || lostShare >= 0.97 || (capitalLost && divisionCount(c) == 0))) continue
            // A state beaten in a local war alone makes peace on the other's terms; it is not conquered (Finland, March 1940).
            val local = world.limited.filter { it.on == c }
            if (local.isNotEmpty() && (0 until nc).all { !atWar(c, it) || local.any { w -> w.by == it } }) {
                for (w in local) {
                    world.limited.remove(w)
                    handOver(w.regions.filter { world.owner[it] == c }.toIntArray(), w.by)
                    for (r in 0 until n) if (world.owner[r] == c && world.controller[r] == w.by) world.controller[r] = c
                    endWar(w.by, c)
                    log("PEACE", w.by, c)
                    sendHome(w.by)
                    sendHome(c)
                }
                continue
            }
            capitulate(c)
        }
    }

    private fun checkVictory() {
        if (world.winner != Faction.NEUTRAL || world.day - data.startDay < rules.diplomacy.victoryCheckFromDay) return
        fun majors(f: String) = (data.scenario.majors[f] ?: emptyList()).map { data.country(it) }
        val axis = majors("AXIS").filter { cs(it).faction == Faction.AXIS || cs(it).capitulated }
        val others = majors("ALLIES") + majors("COMINTERN")
        if (axis.isNotEmpty() && axis.all { cs(it).capitulated }) {
            world.winner = if (cs(data.country("ENG")).capitulated) Faction.COMINTERN else Faction.ALLIES
            log("VICTORY", world.winner.ordinal)
        } else if (others.all { cs(it).capitulated }) {
            world.winner = Faction.AXIS
            log("VICTORY", world.winner.ordinal)
        }
    }

    // ------------------------------------------------------------------ the plan of history

    private fun holds(w: WhenDef, by: Int): Boolean {
        if (w.atWar.size == 2 && !atWar(data.country(w.atWar[0]), data.country(w.atWar[1]))) return false
        if (w.notAtWar.size == 2 && atWar(data.country(w.notAtWar[0]), data.country(w.notAtWar[1]))) return false
        w.lostVp?.let { if (lostVp(data.country(it.of)) < it.share && alive(data.country(it.of))) return false }
        w.controls?.let { if (world.controller[data.region(it.region)] != data.country(it.who)) return false }
        if (w.capitulated.isNotEmpty() && !cs(data.country(w.capitulated)).capitulated) return false
        if (w.notWar && atWarWithAnyone(by)) return false
        return true
    }

    /** The land a plan is about: the regions it names, and all that lies in the `lands` it names (state of 1939 / state of today). */
    private fun planRegions(p: PlanDef): List<Int> {
        val out = p.regions.map { data.region(it) }.toMutableList()
        if (p.lands.isNotEmpty()) for (r in 0 until n) {
            if (data.countries[data.startOwner[r]].tag + "/" + data.regions[r].today in p.lands && r !in out) out.add(r)
        }
        return out
    }

    private fun ready(p: PlanDef): Boolean {
        if (p.id in world.donePlans || world.day < Calendar.day(p.date)) return false
        val by = data.country(p.by)
        if (!alive(by)) return false
        if (p.on.isNotEmpty()) {
            val on = data.country(p.on)
            if (!alive(on) || allied(by, on)) return false
            if (p.kind != "cede" && atWar(by, on)) return false
        }
        return holds(p.`when`, by)
    }

    /** The states [c]'s plan means to go to war with within the staging time: it masses against them beforehand. */
    fun intended(c: Int): List<Int> = data.scenario.plan.list.filter {
        it.on.isNotEmpty() && it.kind != "cede" && it.id !in world.donePlans && data.country(it.by) == c &&
            world.day >= Calendar.day(it.date) - rules.ai.stagingDays && alive(data.country(it.on)) && !atWar(c, data.country(it.on)) &&
            (it.`when`.atWar.size != 2 || atWar(data.country(it.`when`.atWar[0]), data.country(it.`when`.atWar[1])))
    }.map { data.country(it.on) }

    /** Whether the computer playing [c] holds its hand against [other] for now (the Sitzkrieg): until the day named, unless it has lost land to him. */
    fun standsStill(c: Int, other: Int): Boolean = data.scenario.standstill.any {
        data.country(it.of) == c && world.day < Calendar.day(it.until) && it.against.any { tag -> data.country(tag) == other }
    } && (0 until n).none { world.owner[it] == c && atWar(c, world.controller[it]) }

    /** What the human player may decide today, from the plan of history. */
    fun decisions(c: Int): List<PlanDef> = data.scenario.plan.list.filter { data.country(it.by) == c && ready(it) }

    /** The player takes a decision of the plan. */
    fun takeDecision(c: Int, id: String): Boolean {
        val plan = decisions(c).firstOrNull { it.id == id } ?: return false
        execute(plan)
        return true
    }

    private fun yields(by: Int, on: Int): Boolean =
        armyPower(by) >= rules.diplomacy.ultimatumRatio * armyPower(on) && (0 until nc).none { allied(on, it) && it != on && atWar(it, by) }

    private fun accept(p: PlanDef) {
        val by = data.country(p.by)
        val on = data.country(p.on)
        if (p.annex) {
            handOver((0 until n).filter { world.owner[it] == on }.toIntArray(), by)
            for (d in world.divisions.toList()) if (d.owner == on) { divsAt[d.region].remove(d); world.divisions.remove(d) }
            cs(on).capitulated = true
            for (k in 0 until nc) endWar(on, k)
            log("ANNEX", by, on)
        } else {
            handOver(planRegions(p).filter { world.owner[it] == on }.toIntArray(), by)
            log("CEDE", on, by)
            sendHome(on)
        }
    }

    private fun refuse(p: PlanDef) {
        val by = data.country(p.by)
        val on = data.country(p.on)
        val goals = if (p.annex) (0 until n).filter { world.owner[it] == on }.toIntArray() else planRegions(p).toIntArray()
        world.limited.add(LimitedWar(p.id, by, on, goals, world.day))
        openWar(by, on, limited = true)
    }

    /** The human player answers an ultimatum put to his state. */
    fun answerUltimatum(c: Int, id: String, yes: Boolean): Boolean {
        val pending = world.ultimatums.firstOrNull { it.plan == id && it.on == c } ?: return false
        world.ultimatums.remove(pending)
        val plan = data.scenario.plan.list.first { it.id == id }
        if (yes) accept(plan) else refuse(plan)
        return true
    }

    private fun execute(p: PlanDef) {
        world.donePlans.add(p.id)
        val by = data.country(p.by)
        when (p.kind) {
            "war" -> {
                val on = data.country(p.on)
                if (p.breaksPact) world.pacts.remove(World.pair(by, on))
                openWar(by, on, limited = false)
            }
            "limited" -> {
                val on = data.country(p.on)
                world.limited.add(LimitedWar(p.id, by, on, planRegions(p).toIntArray(), world.day))
                openWar(by, on, limited = true)
            }
            "ultimatum" -> {
                val on = data.country(p.on)
                log("ULTIMATUM", by, on)
                if (on == world.player) world.ultimatums.add(PendingUltimatum(p.id, by, on))
                else if (yields(by, on)) accept(p) else refuse(p)
            }
            "join" -> joinFaction(by, Faction.valueOf(p.faction))
            "cede" -> {
                val on = data.country(p.on)
                handOver(planRegions(p).filter { world.controller[it] == by }.toIntArray(), on)
                log("CEDE", by, on)
                sendHome(by)
            }
            else -> throw DataError("plan '${p.id}' has unknown kind '${p.kind}'")
        }
    }

    private fun history() {
        for (p in data.scenario.plan.list) {
            if (data.country(p.by) == world.player || !ready(p)) continue
            execute(p)
        }
    }

    // ------------------------------------------------------------------ one day

    fun tick() {
        world.day++
        zoneCache.clear()
        depthCache.clear()
        history()
        honourGuarantees()
        for (c in 0 until nc) {
            if (!alive(c) || !cs(c).ai || cs(c).passive) continue
            if ((world.day + c) % rules.ai.thinkEveryDays == 0) ai.think(c)
        }
        supply()
        fight()
        march()
        economy()
        closeLimitedWars()
        checkCapitulations()
        checkVictory()
    }

    companion object {
        /** A new campaign from the scenario. [player] is a tag, or null for a war the computer fights alone. */
        fun start(data: GameData, seed: Long, player: String?): Game {
            val sc = data.scenario
            val states = data.countries.map { CountryState(exists = !it.absent) }
            val world = World(
                day = data.startDay, seed = seed, owner = data.startOwner.copyOf(), controller = data.startOwner.copyOf(),
                countries = states, battleDay = IntArray(data.n) { -1 },
            )
            for ((faction, tags) in sc.factions) for (tag in tags) states[data.country(tag)].faction = Faction.valueOf(faction)
            for (tag in sc.passive) states[data.country(tag)].passive = true
            for (p in sc.pacts) world.pacts.add(World.pair(data.country(p.a), data.country(p.b)))
            for (u in sc.units.list) {
                val owner = data.country(u.of)
                for (k in 0 until u.n) {
                    world.divisions.add(Division(world.nextDivision++, owner, u.type, u.size, u.size * u.strength, u.org, data.region(u.at[k % u.at.size])))
                }
            }
            if (player != null) {
                world.player = data.country(player)
                states[world.player].ai = false
            }
            val game = Game(data, world)
            for (w in sc.wars) game.setWar(data.country(w.a), data.country(w.b), data.country(w.a))
            for (g in sc.guarantees) {
                val by = data.country(g.by); val of = data.country(g.of); val against = data.country(g.against)
                if (game.atWar(of, against)) world.guarantees.add(PendingGuarantee(world.day + g.delayDays, by, of, against))
            }
            world.log.clear()
            for (c in data.countries.indices) {
                val people = (0 until data.n).sumOf { if (data.startOwner[it] == c) data.people[it] else 0.0 }
                states[c].manpower = people * data.countries[c].mobilisation * data.rules.economy.manpowerPerMillionPerMonth * data.rules.economy.startManpowerMonths *
                    if (game.atWarWithAnyone(c)) 1.0 else 0.6
                states[c].fuel = game.fuelIncome(c) * data.rules.economy.fuelStartDays
                states[c].icNow = game.industry(c)
                states[c].fuelIncome = game.fuelIncome(c)
            }
            return game
        }

        fun save(world: World): String = GameJson.encodeToString(World.serializer(), world)

        fun load(data: GameData, text: String): Game = Game(data, GameJson.decodeFromString(World.serializer(), text))
    }
}

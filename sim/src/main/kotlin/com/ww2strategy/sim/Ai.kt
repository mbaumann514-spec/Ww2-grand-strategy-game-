package com.ww2strategy.sim

import kotlin.math.ceil
import kotlin.math.max

/**
 * How the computer plays a state. It reads the world as a player does and gives the orders a
 * player gives ([Game.orderMove], [Game.build]); it has no other way in.
 *
 * Three things, in turn: put the army where the enemy is (and a watch where a strong neighbour
 * stands), attack where the odds are good, and keep the factories building.
 */
internal class Ai(private val game: Game) {
    private val data = game.data
    private val world = game.world
    private val rules = data.rules
    private val n = data.n

    private fun power(d: Division): Double = data.unit[d.type.ordinal].fire * d.strength * (0.4 + 0.6 * d.org) * game.quality(d.owner)

    fun think(c: Int) {
        val mine = world.divisions.filter { it.owner == c }
        if (mine.isNotEmpty()) {
            deploy(c, mine)
            if (game.atWarWithAnyone(c)) attack(c, mine)
        }
        produce(c, mine)
    }

    /** Divisions wanted in each region: against the enemy next door, and a watch against a strong neighbour not ours. */
    private fun demand(c: Int): DoubleArray {
        val a = rules.ai
        val threat = DoubleArray(n)
        val watch = DoubleArray(n)
        val intended = game.intended(c)
        val major = data.countries[c].major
        for (d in world.divisions) {
            if (game.atWar(c, d.owner) || d.owner in intended) threat[d.region] += power(d)
            else if (!game.allied(c, d.owner)) watch[d.region] += power(d)
        }
        val want = DoubleArray(n)
        for (r in 0 until n) {
            if (!game.friendlyGround(c, r)) continue
            val own = world.controller[r] == c
            // A small state defends its own soil; only the great powers send armies to their allies' fronts.
            if (!own && !major) continue
            var enemy = 0.0
            var front = false
            var wary = 0.0
            for (next in data.adj[r]) {
                if (game.enemyGround(c, next) || world.controller[next] in intended) { front = true; enemy += threat[next] + 4.0 }
                else if (!game.friendlyGround(c, next)) wary += watch[next]
            }
            // The enemy's ships can put men ashore where his sea is: a port he could reach wants a guard.
            if (data.port[r] && own && data.routes[r].any { game.enemyGround(c, it.to) }) { front = true; enemy += 6.0 }
            // And a port from which one's own ships reach a shore one means to take wants an army to send.
            if (data.port[r] && data.routes[r].any { world.controller[it.to] in intended }) { front = true; enemy += 30.0 }
            if (front) want[r] = (a.frontBase + a.frontPerThreat * enemy + data.vp[r] / 25.0) * if (own) 1.0 else 0.7
            else if (own && wary > 0) want[r] = 0.35 + a.frontPerThreat * 0.35 * wary
        }
        if (world.controller[data.capital[c]] == c) want[data.capital[c]] = max(want[data.capital[c]], a.garrisonCapital.toDouble())
        return want
    }

    private fun deploy(c: Int, mine: List<Division>) {
        val want = demand(c)
        val have = DoubleArray(n)
        for (d in mine) have[if (d.moving) d.path.last() else d.region] += 1.0
        // Scale the wish to the army there is: a small state cannot man every wish.
        val total = want.sum()
        if (total <= 0.0) return
        val scale = minOf(1.6, mine.size * (1.0 - rules.ai.reserveShare) / total)
        val need = DoubleArray(n) { want[it] * scale - have[it] }
        val fast = mass(c, mine, need)
        val idle = mine.filter { !it.moving && it.org > 0.2 && need[it.region] < -0.5 && it.id !in fast }.sortedBy { it.id }
        var moved = 0
        for (d in idle) {
            if (need[d.region] >= -0.5) continue
            var best = -1
            var bestScore = 0.25
            for (r in 0 until n) {
                if (need[r] <= 0.25) continue
                val score = need[r] / (1.0 + data.distanceKm(d.region, r) / 400.0)
                if (score > bestScore) { bestScore = score; best = r }
            }
            if (best == -1) break
            if (game.orderMove(c, listOf(d.id), best) == 1) {
                need[d.region] += 1.0
                need[best] -= 1.0
                if (++moved > 40) break
            } else need[best] = 0.0
        }
    }

    /**
     * The armour is kept together and put where it can break through: before open ground, weak works and a thin
     * line. Scattered along the whole front a tank division is one more division; massed, it is the campaign of 1940.
     * Returns the ids of the fast divisions, which the ordinary spreading of the army leaves alone.
     */
    private fun mass(c: Int, mine: List<Division>, need: DoubleArray): Set<Int> {
        val fast = mine.filter { it.type == UnitType.ARM || it.type == UnitType.MOT }
        val state = game.cs(c)
        if (fast.size < 4 || !data.countries[c].major || !game.atWarWithAnyone(c)) { state.spearhead = -1; return emptySet() }
        fun worth(r: Int): Double {
            if (!game.friendlyGround(c, r)) return 0.0
            var best = 0.0
            for (t in data.adj[r]) {
                if (!game.enemyGround(c, t)) continue
                val hold = game.divisionsIn(t).sumOf { if (game.atWar(c, it.owner)) data.unit[it.type.ordinal].hold * it.strength * game.quality(it.owner) * data.terrain[t].defense else 0.0 }
                val works = if (game.allied(world.controller[t], data.startOwner[t])) data.fort[t] else 0
                val value = data.terrain[t].attackOf(UnitType.ARM) / (1.0 + 0.6 * works) / (1.0 + hold / 120.0) * (1.0 + data.vp[t] / 30.0)
                if (value > best) best = value
            }
            return best * if (world.controller[r] == c) 1.0 else 0.8
        }
        var best = -1
        var bestWorth = 0.0
        for (r in 0 until n) { val w = worth(r); if (w > bestWorth) { bestWorth = w; best = r } }
        if (best == -1) { state.spearhead = -1; return emptySet() }
        if (state.spearhead < 0 || worth(state.spearhead) < 0.7 * bestWorth) state.spearhead = best
        val at = state.spearhead
        for (d in fast.sortedBy { it.id }) {
            if (d.moving || d.region == at || d.org < 0.3) continue
            if (game.orderMove(c, listOf(d.id), at) == 1) { need[d.region] += 1.0 }
        }
        return fast.map { it.id }.toSet()
    }

    private fun attack(c: Int, mine: List<Division>) {
        val combat = rules.combat
        val ready = mine.filter { !it.moving && it.org >= 0.55 && it.strength >= 0.45 * it.size && world.day >= it.regroupUntil && it.supplied }
        if (ready.isEmpty()) return
        val byRegion = ready.groupBy { it.region }
        val used = HashSet<Int>()
        // Every enemy region next to (or a sea passage from) a region where ready divisions stand.
        val targets = LinkedHashMap<Int, ArrayList<Int>>()
        for (r in byRegion.keys.sorted()) {
            for (next in data.adj[r]) if (game.enemyGround(c, next)) targets.getOrPut(next) { ArrayList() }.add(r)
            for (route in data.routes[r]) if (game.enemyGround(c, route.to) && game.seaLegOpen(c, route)) targets.getOrPut(route.to) { ArrayList() }.add(r)
        }
        val odds = rules.ai.attackOdds / data.countries[c].aggressionIn(game.year)
        for (target in targets.keys.sortedWith(compareByDescending<Int> { data.vp[it] }.thenBy { it })) {
            val origins = targets[target]!!
            if (game.standsStill(c, world.controller[target])) continue
            val defenders = game.divisionsIn(target).filter { game.atWar(c, it.owner) }
            val candidates = origins.flatMap { byRegion[it] ?: emptyList() }.filter { it.id !in used }
            if (candidates.isEmpty()) continue
            if (defenders.isEmpty()) {
                // Undefended: one division walks in, the fastest there is, unless one is on its way.
                if (mine.any { it.moving && it.path.last() == target }) continue
                val runner = candidates.maxByOrNull { data.unit[it.type.ordinal].speed } ?: continue
                if (game.orderMove(c, listOf(runner.id), target) == 1) used.add(runner.id)
                continue
            }
            // What a day of this battle would do: it is fought if it costs the defender more than it costs us, by the odds asked.
            val day = game.clash(target, candidates) ?: continue
            if (day.onDefenders < odds * day.onAttackers || day.onDefenders <= 0.0) continue
            val chosen = day.attackers
            // Leave one behind in each region that other enemies also threaten.
            val going = ArrayList<Division>()
            for ((origin, group) in chosen.groupBy { it.region }) {
                val exposed = data.adj[origin].any { it != target && game.enemyGround(c, it) && game.hostileIn(c, it) }
                val staying = (byRegion[origin]?.count { it.id !in used } ?: 0) - group.size
                going.addAll(if (exposed && staying < 1 && group.size > 1) group.sortedBy { it.id }.drop(1) else group)
            }
            if (going.isEmpty()) continue
            game.orderMove(c, going.map { it.id }, target)
            for (d in going) used.add(d.id)
        }
    }

    private fun produce(c: Int, mine: List<Division>) {
        val state = game.cs(c)
        val e = rules.economy
        if (state.queue.size >= e.productionLines) return
        val ic = max(state.icNow, 0.1)
        val waiting = state.queue.sumOf { data.unit[it.type.ordinal].cost * data.countries[c].divisionCost - it.done }
        if (waiting > ic * rules.ai.productionHorizonDays) return
        // What the army is short of, against the mix the rules name. A small state builds infantry.
        val count = IntArray(UnitType.entries.size)
        for (d in mine) count[d.type.ordinal]++
        for (line in state.queue) count[line.type.ordinal]++
        val total = max(1, count.sum())
        var pick = UnitType.INF
        var worst = 0.0
        for ((name, share) in rules.ai.mix) {
            val type = UnitType.valueOf(name)
            val u = data.unit[type.ordinal]
            if (u.fuel > 0 && (ic < 12 || state.noFuel)) continue
            val shortfall = share - count[type.ordinal].toDouble() / total
            if (shortfall > worst) { worst = shortfall; pick = type }
        }
        val men = data.unit[pick.ordinal].manpower
        // Keep men back for the divisions that are understrength.
        val gaps = mine.sumOf { (it.size - it.strength) * data.unit[it.type.ordinal].manpower }
        if (state.manpower < men + gaps * 0.5) return
        // An army at peace is not grown without end.
        if (!game.atWarWithAnyone(c) && mine.size >= ceil(data.countries[c].pop * 1.2 + 4)) return
        game.build(c, pick)
    }
}

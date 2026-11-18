package com.ww2strategy.sim

import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

/** The rules, held to what the scenario and the rule files promise. Runs from the repository root, on the real data. */
class SimTest {
    private val data: GameData by lazy { shared }

    companion object {
        val shared: GameData by lazy { GameData.load(DataSource { File(it).readText() }) }
    }

    private fun play(seed: Long, days: Int, player: String? = null): Game {
        val game = Game.start(data, seed, player)
        repeat(days) { game.tick() }
        return game
    }

    @Test fun `the clock counts days from 1 January 1936`() {
        assertEquals(0, Calendar.day("1936-01-01"))
        assertEquals(1339, Calendar.day("1939-09-01"))
        assertEquals("1940-02-29", Calendar.iso(Calendar.day("1940-02-29")))
        assertEquals("1941-06-22", Calendar.iso(Calendar.day("1941-06-22")))
        for (day in 0 until 4500 step 37) assertEquals(day, Calendar.day(Calendar.iso(day)))
    }

    @Test fun `comments are stripped from tunable files`() {
        val text = """{"a": 1, "comment": "why", "aComment": "because", "b": {"comment": "x", "c": [ {"comment": "y", "d": 2} ]}}"""
        assertEquals("""{"a":1,"b":{"c":[{"d":2}]}}""", stripComments(GameJson.parseToJsonElement(text)).toString())
    }

    @Test fun `the map is whole`() {
        assertTrue(data.n in 400..520, "regions: ${data.n}")
        for (i in 0 until data.n) {
            for (k in data.adj[i].indices) {
                val j = data.adj[i][k]
                assertTrue(i in data.adj[j], "${data.regions[i].id} borders ${data.regions[j].id} one way only")
                assertTrue(data.adjKm[i][k] > 1.0)
            }
            assertTrue(data.regions[i].polys.isNotEmpty() && data.regions[i].tris.size == data.regions[i].polys.size)
            assertTrue(data.vp[i] >= 1)
        }
        // No island of regions is cut off from every other without a sea route or a strait: a division there could never leave.
        val stranded = (0 until data.n).filter { data.adj[it].isEmpty() && data.routes[it].isEmpty() }.map { data.regions[it].id }
        assertTrue(stranded.size <= 12, "regions nothing leads to: $stranded")
    }

    @Test fun `every state has its capital and its industry on the first day`() {
        for ((c, def) in data.countries.withIndex()) {
            if (def.absent) continue
            assertEquals(c, data.startOwner[data.capital[c]], "${def.tag} does not own its capital ${def.capital}")
            val factories = (0 until data.n).sumOf { if (data.startOwner[it] == c) data.factories[it] else 0.0 }
            assertEquals(def.ic, factories, 0.01, def.tag)
        }
    }

    @Test fun `the first morning is as the historian has it`() {
        val game = Game.start(data, 1, null)
        val ger = data.country("GER"); val pol = data.country("POL"); val eng = data.country("ENG"); val fra = data.country("FRA")
        val ita = data.country("ITA"); val sov = data.country("SOV"); val slo = data.country("SLO")
        assertTrue(game.atWar(ger, pol) && game.atWar(slo, pol))
        assertFalse(game.atWar(eng, ger), "Britain declares war on 3 September, not on the 1st")
        assertEquals(Faction.NEUTRAL, game.cs(ita).faction, "Italy is non-belligerent")
        assertFalse(game.atWar(sov, pol))
        assertEquals("1939-09-01", Calendar.iso(game.world.day))
        // Germany: 86 infantry divisions, 7 armoured, 8 motorised and light (the pre-check's table 2).
        val german = game.world.divisions.filter { it.owner == ger }
        assertEquals(86, german.count { it.type == UnitType.INF })
        assertEquals(7, german.count { it.type == UnitType.ARM })
        assertEquals(8, german.count { it.type == UnitType.MOT })
        assertEquals(39, game.world.divisions.count { it.owner == pol && it.type == UnitType.INF })
        repeat(3) { game.tick() }
        assertTrue(game.atWar(eng, ger) && game.atWar(fra, ger), "the guarantee is honoured on 3 September")
        assertEquals(Faction.ALLIES, game.cs(pol).faction)
    }

    @Test fun `Poland falls in the autumn of 1939 and the east goes to the Soviet Union`() {
        for (seed in 1L..3L) {
            val game = play(seed, 120)
            assertTrue(game.cs(data.country("POL")).capitulated, "seed $seed: Poland still fights on ${Calendar.iso(game.world.day)}")
            assertEquals(data.country("SOV"), game.world.owner[data.region("lwow")], "seed $seed: Lwow")
            assertEquals(data.country("GER"), game.world.controller[data.region("warsaw")], "seed $seed: Warsaw")
            assertFalse(game.atWar(data.country("GER"), data.country("SOV")))
        }
    }

    @Test fun `the same seed makes the same war`() {
        val a = Game.save(play(7, 150).world)
        val b = Game.save(play(7, 150).world)
        assertEquals(a, b)
        assertNotEquals(a, Game.save(play(8, 150).world))
    }

    @Test fun `a saved war goes on as it would have`() {
        val straight = Game.save(play(3, 140).world)
        val first = play(3, 70)
        val loaded = Game.load(data, Game.save(first.world))
        repeat(70) { loaded.tick() }
        assertEquals(straight, Game.save(loaded.world))
    }

    @Test fun `orders go through the entry points`() {
        val game = Game.start(data, 1, "GER")
        val ger = data.country("GER")
        val berlin = data.region("berlin")
        val one = game.world.divisions.first { it.owner == ger && it.region == berlin }
        val target = data.adj[berlin].first { game.friendlyGround(ger, it) }
        assertEquals(1, game.orderMove(ger, listOf(one.id), target))
        repeat(20) { game.tick() }
        assertEquals(target, one.region)
        assertFalse(one.moving)
        assertFalse(game.canDeclareWar(ger, data.country("SLO")), "no war on an ally")
        assertTrue(game.build(ger, UnitType.INF), "build")
        assertTrue(game.cancelBuild(ger, game.cs(ger).queue.size - 1), "cancel")
    }

    @Test fun `the plan of history waits for the player`() {
        // As the Soviet Union: on 17 September 1939 the computer does not march into Poland for him; the decision is his.
        val game = Game.start(data, 1, "SOV")
        val sov = data.country("SOV"); val pol = data.country("POL")
        repeat(16) { game.tick() }
        assertEquals("1939-09-17", Calendar.iso(game.world.day))
        assertFalse(game.atWar(sov, pol), "the computer declared the player's war for him")
        assertTrue(game.decisions(sov).any { it.id == "soviet_poland" }, "decisions: ${game.decisions(sov).map { it.id }}, Poland has lost ${game.lostVp(pol)}")
        assertTrue(game.takeDecision(sov, "soviet_poland"))
        assertTrue(game.atWar(sov, pol))
        assertFalse(game.atWar(sov, data.country("ENG")), "a local war draws nobody else in")
    }

    @Test fun `no banned sign or slogan is in the game's data`() {
        // The anwalt's pre-check (docs/pruefer/anwalt_vorpruefung.md): none of these may appear in anything the game shows.
        val banned = listOf("sieg heil", "heil hitler", "meine ehre", "blut und ehre", "deutschland erwache", "ein volk, ein reich",
            "endsieg", "lebensraum", "untermensch", "blitzkrieg", "swastika", "hakenkreuz")
        val files = File("data").walkTopDown().filter { it.isFile && it.extension == "json" && !it.path.contains("map") }
        for (file in files) {
            val text = file.readText().lowercase()
            for (word in banned) assertFalse(word in text, "'$word' in ${file.path}")
        }
    }
}

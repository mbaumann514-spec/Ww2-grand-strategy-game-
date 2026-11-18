package com.ww2strategy.sim.tools

import com.ww2strategy.sim.Calendar
import com.ww2strategy.sim.DataSource
import com.ww2strategy.sim.Faction
import com.ww2strategy.sim.Game
import com.ww2strategy.sim.GameData
import java.io.File

/**
 * The war with no screen attached: the balance instrument.
 *
 *   ./gradlew :sim:headless --args="--years 6 --seed 1 [--player GER] [--quiet]"
 *
 * It prints what happened as it happens, a table of the armies each new year, and how long a
 * simulated day took. Read for: a war that does not move, states that never fall or fall at
 * once, armies that grow without end, and the microseconds a day costs.
 */
object Headless {
    @JvmStatic
    fun main(args: Array<String>) {
        fun arg(name: String, default: String): String = args.indexOf(name).let { if (it >= 0 && it + 1 < args.size) args[it + 1] else default }
        val years = arg("--years", "6").toDouble()
        val seed = arg("--seed", "1").toLong()
        val quiet = "--quiet" in args
        val data = GameData.load(DataSource { File(it).readText() })
        val game = Game.start(data, seed, null)
        val world = game.world
        val tag = { c: Int -> if (c < 0) "-" else data.countries[c].tag }
        val days = (years * 365.25).toInt()
        var logged = 0
        val started = System.nanoTime()
        var lastYear = game.year
        fun table() {
            println("    " + Calendar.iso(world.day) + "  divisions (lost so far) / factory-days a day / manpower in thousands")
            for (c in data.countries.indices) {
                val n = game.divisionCount(c)
                if (n == 0 && game.lost[c] == 0) continue
                if (!data.countries[c].major && !game.atWarWithAnyone(c) && game.lost[c] == 0) continue
                println("      %s %-9s %4d (%4d) %7.1f %8.0f  lost land %3.0f%%%s".format(
                    tag(c), world.countries[c].faction.name.lowercase(), n, game.lost[c], game.industry(c), world.countries[c].manpower,
                    game.lostVp(c) * 100, if (world.countries[c].capitulated) "  CAPITULATED" else ""))
            }
        }
        if (!quiet) table()
        for (i in 0 until days) {
            game.tick()
            while (logged < world.log.size) {
                val e = world.log[logged++]
                if (quiet && e.kind == "CAPTURE") continue
                val what = when (e.kind) {
                    "WAR" -> "${tag(e.a)} goes to war with ${tag(e.b)}"
                    "PEACE" -> "${tag(e.a)} and ${tag(e.b)} make peace"
                    "CAPTURE" -> "${tag(e.a)} takes ${data.regions[e.region].name}" + if (e.b >= 0 && e.b != e.a) " (${tag(e.b)})" else ""
                    "CAPITULATE" -> "${tag(e.a)} CAPITULATES to ${tag(e.b)}"
                    "ARMISTICE" -> "${tag(e.a)} is set up by armistice with ${tag(e.b)}"
                    "JOIN" -> "${tag(e.a)} joins ${Faction.entries[e.b].name}"
                    "ANNEX" -> "${tag(e.a)} annexes ${tag(e.b)}"
                    "CEDE" -> "${tag(e.a)} cedes land to ${tag(e.b)}"
                    "ULTIMATUM" -> "${tag(e.a)} sends ${tag(e.b)} an ultimatum"
                    "VICTORY" -> "VICTORY: ${Faction.entries[e.a].name}"
                    else -> e.kind
                }
                println(Calendar.iso(e.day) + "  " + what)
            }
            if (game.year != lastYear) { lastYear = game.year; if (!quiet) table() }
            if (world.winner != Faction.NEUTRAL) break
        }
        table()
        val micros = (System.nanoTime() - started) / 1000.0 / (world.day - data.startDay)
        println("%d days, %.0f microseconds a day (a frame is 16,667), %d divisions on the map, winner: %s".format(
            world.day - data.startDay, micros, world.divisions.size, world.winner.name))
    }
}

package com.ww2strategy.sim

import kotlinx.serialization.Serializable

/*
 * Everything that changes during a campaign, and nothing else: this is what a save holds.
 * Same seed, same orders, same world -- on every device. Nothing here depends on the frame
 * rate, on the order of a hash map or on a random generator two callers share.
 */

@Serializable
class Division(
    val id: Int,
    var owner: Int,
    val type: UnitType,
    /** How large against a full division: a cavalry brigade is 0.45. Strength never passes it. */
    val size: Double,
    var strength: Double,
    var org: Double,
    var region: Int,
    /** The regions still to walk, the next one first. Empty: it stands. */
    var path: IntArray = IntArray(0),
    var progress: Double = 0.0,
    var legDays: Double = 0.0,
    var bySea: Boolean = false,
    var entrench: Double = 0.0,
    var regroupUntil: Int = 0,
    var supplied: Boolean = true,
    /** The last day it fought or marched, for fuel and rest. */
    var activeDay: Int = -1,
    var foughtDay: Int = -1,
) {
    val moving: Boolean get() = path.isNotEmpty()
}

@Serializable
class ProductionLine(val type: UnitType, var done: Double = 0.0)

@Serializable
class CountryState(
    var faction: Faction = Faction.NEUTRAL,
    var exists: Boolean = true,
    var capitulated: Boolean = false,
    var manpower: Double = 0.0,
    var fuel: Double = 0.0,
    var noFuel: Boolean = false,
    val queue: MutableList<ProductionLine> = mutableListOf(),
    var warSince: Int = -1,
    var ai: Boolean = true,
    var passive: Boolean = false,
    /** Factory-days made yesterday, for the interface. */
    var icNow: Double = 0.0,
    var fuelIncome: Double = 0.0,
    /** Where the computer masses this state's armour, or -1. Saved, so a loaded game goes on as it would have. */
    var spearhead: Int = -1,
)

/** A local war for named land: nobody else is drawn in, and it ends when the land is held. */
@Serializable
class LimitedWar(val plan: String, val by: Int, val on: Int, val regions: IntArray, val startDay: Int)

@Serializable
class PendingGuarantee(val day: Int, val by: Int, val of: Int, val against: Int)

/** An ultimatum the human player has to answer. */
@Serializable
class PendingUltimatum(val plan: String, val by: Int, val on: Int)

@Serializable
class LogEntry(val day: Int, val kind: String, val a: Int = -1, val b: Int = -1, val region: Int = -1)

@Serializable
class World(
    var day: Int,
    val seed: Long,
    val owner: IntArray,
    val controller: IntArray,
    val divisions: MutableList<Division> = mutableListOf(),
    var nextDivision: Int = 1,
    val countries: List<CountryState>,
    /** Pairs at war, as lo * 1000 + hi. */
    val wars: MutableList<Int> = mutableListOf(),
    val warStart: MutableMap<Int, Int> = mutableMapOf(),
    /** Who opened each war, for the first weeks' surprise. */
    val warOpener: MutableMap<Int, Int> = mutableMapOf(),
    val pacts: MutableList<Int> = mutableListOf(),
    val limited: MutableList<LimitedWar> = mutableListOf(),
    val donePlans: MutableList<String> = mutableListOf(),
    val guarantees: MutableList<PendingGuarantee> = mutableListOf(),
    val ultimatums: MutableList<PendingUltimatum> = mutableListOf(),
    val log: MutableList<LogEntry> = mutableListOf(),
    /** The last day a battle was fought for each region, for the interface. */
    val battleDay: IntArray,
    var winner: Faction = Faction.NEUTRAL,
    var player: Int = -1,
) {
    companion object {
        fun pair(a: Int, b: Int): Int = if (a < b) a * 1000 + b else b * 1000 + a
    }
}

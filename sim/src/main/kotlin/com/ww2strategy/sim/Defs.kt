package com.ww2strategy.sim

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.decodeFromJsonElement

/*
 * What the game reads from data/: the map, the rules, the states, the scenario, the seas.
 *
 * Every number the player feels lives in those commented JSON files. A missing file or an
 * unknown region id is an error, never a silent default: a scenario that names a town the
 * map does not have fails when it is loaded, not in the middle of a campaign.
 */

/** Where the files come from: the repository on a desk, the APK's assets on a phone. */
fun interface DataSource {
    fun read(path: String): String
}

val GameJson: Json = Json { ignoreUnknownKeys = true; isLenient = true }

/** `comment` and `*Comment` keys are the reasoning beside a value, for the reader; the loader drops them. */
fun stripComments(element: JsonElement): JsonElement = when (element) {
    is JsonObject -> JsonObject(
        element.filterKeys { it != "comment" && !it.endsWith("Comment") }.mapValues { stripComments(it.value) },
    )
    is JsonArray -> JsonArray(element.map(::stripComments))
    else -> element
}

inline fun <reified T> loadTunable(source: DataSource, path: String): T =
    GameJson.decodeFromJsonElement(stripComments(GameJson.parseToJsonElement(source.read(path))))

enum class UnitType { INF, ARM, MOT, CAV, MTN, GAR }

enum class Faction { NEUTRAL, AXIS, ALLIES, COMINTERN }

// ---------------------------------------------------------------- the map (GENERATED, tools/karte)

@Serializable
class LinkDef(val to: String, val km: Int, val river: Boolean = false)

@Serializable
class RegionDef(
    val id: String, val name: String, val owner: String,
    /** The town, in tenths of a kilometre from the map's south-west corner. */
    val city: IntArray, val lon: Double, val lat: Double,
    val area: Int, val coastal: Boolean, val urban: Int,
    val terrain: Map<String, Double>, val links: List<LinkDef>,
    val polys: List<IntArray>, val tris: List<IntArray>,
)

@Serializable
class BorderDef(val a: Int, val b: Int, val kind: String, val pts: IntArray)

@Serializable
class LakeDef(val name: String = "", val pts: IntArray, val tris: IntArray)

@Serializable
class RiverDef(val rank: Int, val pts: IntArray)

@Serializable
class GroundDef(
    val cell: Int, val left: Double, val top: Double, val width: Int, val height: Int,
    val code: String, val palette: List<String>, val rows: List<String>,
)

@Serializable
class MapDef(
    val width: Int, val height: Int, val regions: List<RegionDef>, val borders: List<BorderDef>,
    val lakes: List<LakeDef>, val rivers: List<RiverDef>, val ground: GroundDef,
)

// ---------------------------------------------------------------- data/rules.json

@Serializable
class UnitDef(val attack: Double, val defense: Double, val speed: Double, val cost: Double, val manpower: Double, val fuel: Double)

@Serializable
class TerrainDef(val move: Double, val defense: Double, val attack: Map<String, Double>) {
    fun attackOf(type: UnitType): Double = attack[type.name] ?: attack["all"] ?: 1.0
}

@Serializable
class CombatRules(
    val width: Int, val widthPerExtraFlank: Int, val orgLossPerDay: Double, val ratioExponent: Double,
    val minRatio: Double, val maxRatio: Double, val attackerWear: Double, val strengthPerOrg: Double,
    val breakOrg: Double, val attackMinOrg: Double, val regroupDays: Int, val riverCrossing: Double,
    val straitCrossing: Double, val landing: Double, val landingWidth: Int, val fortPerLevel: Double,
    val entrenchPerDay: Double, val entrenchMax: Double, val noSupplyPower: Double, val noFuelPower: Double,
    val dice: Double, val surpriseDays: Int, val surprisePower: Double,
)

@Serializable
class MovementRules(
    val friendlyRail: Double, val riverDays: Double, val straitDays: Double, val seaKmPerDay: Double,
    val seaLoadDays: Double, val retreatSpeed: Double, val minDays: Double, val noFuelSpeed: Double,
)

@Serializable
class WeatherRules(
    val mudEastOfLon: Double, val mudNorthOfLat: Double, val mudMonths: List<Int>, val mudMove: Double,
    val mudAttack: Double, val winterMonths: List<Int>, val winterMove: Double, val winterAttack: Double,
)

@Serializable
class SupplyRules(
    val orgLossPerDay: Double, val strengthLossPerDay: Double, val orgGainPerDay: Double,
    val orgGainMovingPerDay: Double, val reinforcePerDay: Double, val reinforceCostShare: Double,
    val depthPenaltyPerRegion: Double, val depthPenaltyMax: Double,
    val occupationYield: Double,
)

@Serializable
class EconomyRules(
    val manpowerPerMillionPerMonth: Double, val peaceManpowerShare: Double, val startManpowerMonths: Double,
    val fuelPerOilPerDay: Double, val fuelStockDays: Double, val fuelStartDays: Double, val productionLines: Int,
    val newDivisionOrg: Double, val warEconomyPerYear: Double, val warEconomyMax: Double, val peaceEconomy: Double,
)

@Serializable
class SeaRules(
    val navyReachKm: Double, val airReachKm: Double, val airWeight: Double, val dominance: Double,
    val contestedLoss: Double,
)

@Serializable
class DiplomacyRules(
    val capitulationDefault: Double, val limitedWarMaxDays: Int, val limitedWarGoalShare: Double,
    val ultimatumRatio: Double, val victoryCheckFromDay: Int,
)

@Serializable
class AiRules(
    val thinkEveryDays: Int, val attackOdds: Double, val stagingDays: Int, val frontBase: Double, val frontPerThreat: Double,
    val garrisonCapital: Int, val reserveShare: Double, val productionHorizonDays: Double, val mix: Map<String, Double>,
)

@Serializable
class Rules(
    val units: Map<String, UnitDef>, val terrain: Map<String, TerrainDef>, val combat: CombatRules,
    val movement: MovementRules, val weather: WeatherRules, val supply: SupplyRules, val economy: EconomyRules,
    val sea: SeaRules, val diplomacy: DiplomacyRules, val ai: AiRules,
)

// ---------------------------------------------------------------- data/countries.json

@Serializable
class CountryDef(
    val tag: String, val name: String, val colour: String, val capital: String, val ic: Double, val pop: Double,
    val navy: Double = 0.0, val air: Double = 0.0, val major: Boolean = false, val aggression: Map<String, Double> = emptyMap(),
    val mobilisation: Double = 1.0, val divisionCost: Double = 1.0,
    val overseasFuel: Double = 0.0, val capitulation: Double = -1.0, val quality: Map<String, Double> = emptyMap(),
    val winterHardy: Boolean = false, val absent: Boolean = false,
) {
    private fun inYear(table: Map<String, Double>, year: Int): Double =
        table.entries.filter { it.key.toInt() <= year }.maxByOrNull { it.key.toInt() }?.value
            ?: table.entries.minByOrNull { it.key.toInt() }?.value ?: 1.0

    /** How well the army fights for its numbers in [year]: the last entry at or before it. */
    fun qualityIn(year: Int): Double = inYear(quality, year)

    /** How readily its generals attack in [year]. */
    fun aggressionIn(year: Int): Double = inYear(aggression, year)
}

@Serializable
class CountriesFile(val countries: List<CountryDef>)

// ---------------------------------------------------------------- data/scenarios/<id>/scenario.json

@Serializable
class WarDef(val a: String, val b: String)

@Serializable
class GuaranteeDef(val by: String, val of: String, val against: String, val delayDays: Int = 2)

@Serializable
class OilDealDef(val from: String, val to: String, val perDay: Double, val start: String = "")

@Serializable
class DeployDef(
    val of: String, val type: UnitType, val n: Int, val at: List<String>,
    val size: Double = 1.0, val strength: Double = 1.0, val org: Double = 0.8,
)

@Serializable
class UnitsDef(val list: List<DeployDef>)

@Serializable
class LostVpCond(val of: String, val share: Double)

@Serializable
class ControlsCond(val who: String, val region: String)

@Serializable
class WhenDef(
    val atWar: List<String> = emptyList(), val notAtWar: List<String> = emptyList(), val lostVp: LostVpCond? = null,
    val controls: ControlsCond? = null, val capitulated: String = "", val notWar: Boolean = false,
)

@Serializable
class PlanDef(
    val id: String, val kind: String, val by: String, val on: String = "", val faction: String = "", val date: String,
    val regions: List<String> = emptyList(), val annex: Boolean = false, val breaksPact: Boolean = false,
    val `when`: WhenDef = WhenDef(),
)

@Serializable
class PlanFile(val list: List<PlanDef>)

@Serializable
class OutcomeDef(val kind: String, val to: String = "", val state: String = "", val regions: List<String> = emptyList())

@Serializable
class ScenarioDef(
    val id: String, val name: String, val start: String, val end: String,
    val factions: Map<String, List<String>>, val majors: Map<String, List<String>>,
    val wars: List<WarDef>, val pacts: List<WarDef> = emptyList(), val guarantees: List<GuaranteeDef> = emptyList(),
    val passive: List<String> = emptyList(), val oilDeals: List<OilDealDef> = emptyList(),
    val oil: Map<String, Double>, val forts: Map<String, Int>, val industry: Map<String, Double>,
    val victory: Map<String, Int>, val units: UnitsDef, val plan: PlanFile, val outcomes: Map<String, OutcomeDef> = emptyMap(),
)

// ---------------------------------------------------------------- data/sea.json

@Serializable
class ZoneDef(val id: String, val name: String, val lon: Double, val lat: Double, val presence: Map<String, Double>)

@Serializable
class StraitDef(val a: String, val b: String)

@Serializable
class RouteDef(val a: String, val b: String, val zones: List<String>)

@Serializable
class SeaDef(val zones: List<ZoneDef>, val straits: List<StraitDef>, val routes: List<RouteDef>)

class DataError(message: String) : RuntimeException(message)

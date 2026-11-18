package com.ww2strategy.sim

import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

/** One clock: days since 1 January 1936. Year, month and day are derived from it and from nothing else. */
object Calendar {
    private const val EPOCH_YEAR = 1936
    private val MONTH_DAYS = intArrayOf(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)

    private fun leap(year: Int) = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)

    class Date(val year: Int, val month: Int, val day: Int)

    fun date(day: Int): Date {
        var left = day
        var year = EPOCH_YEAR
        while (left >= (if (leap(year)) 366 else 365)) {
            left -= if (leap(year)) 366 else 365
            year++
        }
        var month = 0
        while (true) {
            val length = MONTH_DAYS[month] + if (month == 1 && leap(year)) 1 else 0
            if (left < length) break
            left -= length
            month++
        }
        return Date(year, month + 1, left + 1)
    }

    /** "1939-09-01" to a day. */
    fun day(iso: String): Int {
        val (y, m, d) = iso.split("-").map { it.toInt() }
        var days = 0
        for (year in EPOCH_YEAR until y) days += if (leap(year)) 366 else 365
        for (month in 0 until m - 1) days += MONTH_DAYS[month] + if (month == 1 && leap(y)) 1 else 0
        return days + d - 1
    }

    fun iso(day: Int): String = date(day).let { "%04d-%02d-%02d".format(it.year, it.month, it.day) }
}

/** A passage by ship between two ports. */
class Route(val to: Int, val zones: IntArray, val km: Double)

/**
 * Everything that does not change during a campaign: the files of data/, and what follows
 * from them once -- who borders whom, how far it is, where the factories stand.
 */
class GameData(
    val map: MapDef, val rules: Rules, val countries: List<CountryDef>, val scenario: ScenarioDef, val sea: SeaDef,
) {
    val regions: List<RegionDef> = map.regions
    val n: Int = regions.size
    val regionIndex: Map<String, Int> = regions.withIndex().associate { it.value.id to it.index }
    val tagIndex: Map<String, Int> = countries.withIndex().associate { it.value.tag to it.index }

    fun region(id: String): Int = regionIndex[id] ?: throw DataError("no region '$id' on the map")
    fun country(tag: String): Int = tagIndex[tag] ?: throw DataError("no country '$tag' in countries.json")

    val startDay: Int = Calendar.day(scenario.start)
    val endDay: Int = Calendar.day(scenario.end)

    /** Land neighbours and narrows, in a fixed order. */
    val adj: Array<IntArray>
    val adjKm: Array<DoubleArray>
    val adjRiver: Array<BooleanArray>
    val adjStrait: Array<BooleanArray>
    val routes: Array<List<Route>>

    val terrainName: Array<String>
    val terrain: Array<TerrainDef>
    val fort = IntArray(n)
    val oil = DoubleArray(n)
    val vp = IntArray(n)
    val factories = DoubleArray(n)

    /** Millions of people, the share of its first owner's population that lives here. */
    val people = DoubleArray(n)
    val zone = IntArray(n) { -1 }
    val port = BooleanArray(n)
    val mud = BooleanArray(n)
    val startOwner = IntArray(n)
    val capital: IntArray = IntArray(countries.size) { region(countries[it].capital) }
    val unit: Array<UnitDef> = Array(UnitType.entries.size) {
        rules.units[UnitType.entries[it].name] ?: throw DataError("rules.json has no unit ${UnitType.entries[it]}")
    }
    val zoneIndex: Map<String, Int> = sea.zones.withIndex().associate { it.value.id to it.index }

    /** The coastal regions from which a fleet, and those from which aircraft, reach each sea zone. */
    val navyCoast: Array<IntArray> = Array(sea.zones.size) { z -> coastWithin(z, rules.sea.navyReachKm) }
    val airCoast: Array<IntArray> = Array(sea.zones.size) { z -> coastWithin(z, rules.sea.airReachKm) }

    private fun coastWithin(z: Int, km: Double): IntArray = regions.indices.filter {
        regions[it].coastal && haversine(regions[it].lon, regions[it].lat, sea.zones[z].lon, sea.zones[z].lat) <= km
    }.toIntArray()

    /** presence[zone][country] */
    val presence: Array<DoubleArray> = Array(sea.zones.size) { z ->
        DoubleArray(countries.size).also { row ->
            for ((tag, value) in sea.zones[z].presence) row[country(tag)] = value
        }
    }

    init {
        for (i in 0 until n) startOwner[i] = country(regions[i].owner)

        val neighbours = Array(n) { ArrayList<Int>() }
        val kms = Array(n) { ArrayList<Double>() }
        val rivers = Array(n) { ArrayList<Boolean>() }
        val straits = Array(n) { ArrayList<Boolean>() }
        fun link(a: Int, b: Int, river: Boolean, strait: Boolean) {
            if (b in neighbours[a]) return
            neighbours[a].add(b)
            kms[a].add(distanceKm(a, b))
            rivers[a].add(river)
            straits[a].add(strait)
        }
        for (i in 0 until n) for (l in regions[i].links) {
            val j = region(l.to)
            link(i, j, l.river, false)
            link(j, i, l.river, false)
        }
        for (s in sea.straits) {
            val a = region(s.a)
            val b = region(s.b)
            link(a, b, false, true)
            link(b, a, false, true)
        }
        adj = Array(n) { neighbours[it].toIntArray() }
        adjKm = Array(n) { kms[it].toDoubleArray() }
        adjRiver = Array(n) { rivers[it].toBooleanArray() }
        adjStrait = Array(n) { straits[it].toBooleanArray() }

        val routeLists = Array(n) { ArrayList<Route>() }
        for (r in sea.routes) {
            val a = region(r.a)
            val b = region(r.b)
            val zones = IntArray(r.zones.size) { zoneIndex[r.zones[it]] ?: throw DataError("no sea zone '${r.zones[it]}'") }
            routeLists[a].add(Route(b, zones, distanceKm(a, b)))
            routeLists[b].add(Route(a, zones, distanceKm(a, b)))
        }
        routes = Array(n) { routeLists[it] }

        terrainName = Array(n) { i -> regions[i].terrain.maxByOrNull { it.value }?.key ?: "plains" }
        terrain = Array(n) { rules.terrain[terrainName[it]] ?: throw DataError("rules.json has no terrain '${terrainName[it]}'") }

        for ((id, level) in scenario.forts) fort[region(id)] = level
        for ((id, value) in scenario.oil) oil[region(id)] = value
        val routeEnds = HashSet<Int>()
        for (r in sea.routes) { routeEnds.add(region(r.a)); routeEnds.add(region(r.b)) }
        for (i in 0 until n) {
            val r = regions[i]
            mud[i] = r.lon > rules.weather.mudEastOfLon || r.lat > rules.weather.mudNorthOfLat
            if (r.coastal) {
                zone[i] = sea.zones.indices.minByOrNull { haversine(r.lon, r.lat, sea.zones[it].lon, sea.zones[it].lat) } ?: -1
                port[i] = r.urban >= PORT_TOWN || i in routeEnds
            }
        }
        spreadIndustry()
    }

    fun distanceKm(a: Int, b: Int): Double = haversine(regions[a].lon, regions[a].lat, regions[b].lon, regions[b].lat)

    /**
     * Factories, people and victory points, from each state's totals and the weight of its regions' towns.
     * The towns' sizes are today's (Natural Earth), used only as weights within one state: which of its
     * regions were the populous ones has changed far less than how populous. (filled in)
     */
    private fun spreadIndustry() {
        val overseas = scenario.industry["overseas"] ?: 0.05
        for (c in countries.indices) {
            val mine = (0 until n).filter { startOwner[it] == c }
            if (mine.isEmpty()) continue
            // The home country: what hangs together with the capital by land.
            val home = HashSet<Int>()
            val queue = ArrayDeque<Int>()
            if (startOwner[capital[c]] == c) { home.add(capital[c]); queue.add(capital[c]) }
            while (queue.isNotEmpty()) {
                val at = queue.removeFirst()
                for (next in adj[at]) if (startOwner[next] == c && home.add(next)) queue.add(next)
            }
            val industryWeight = DoubleArray(n)
            val peopleWeight = DoubleArray(n)
            for (i in mine) {
                val town = maxOf(regions[i].urban, 20).toDouble()
                val named = scenario.industry[regions[i].id]
                val far = if (i in home) 1.0 else overseas
                industryWeight[i] = town.pow(0.9) * (named ?: far)
                peopleWeight[i] = town.pow(0.6) * if (i in home || named != null) 1.0 else overseas
            }
            val industryTotal = mine.sumOf { industryWeight[it] }
            val peopleTotal = mine.sumOf { peopleWeight[it] }
            val def = countries[c]
            val points = 20 + 8 * def.ic.pow(0.55)
            for (i in mine) {
                factories[i] = def.ic * industryWeight[i] / industryTotal
                people[i] = def.pop * peopleWeight[i] / peopleTotal
                vp[i] = maxOf(1, (points * 0.75 * peopleWeight[i] / peopleTotal).roundToInt())
            }
            if (startOwner[capital[c]] == c) vp[capital[c]] += (points * 0.25).roundToInt()
        }
        for ((id, extra) in scenario.victory) vp[region(id)] += extra
    }

    companion object {
        /** A coastal town of this many thousand (today's figure, as a weight) is a port. */
        const val PORT_TOWN = 150

        fun haversine(lon1: Double, lat1: Double, lon2: Double, lat2: Double): Double {
            val p1 = Math.toRadians(lat1)
            val p2 = Math.toRadians(lat2)
            val dp = p2 - p1
            val dl = Math.toRadians(lon2 - lon1)
            val h = sin(dp / 2).pow(2) + cos(p1) * cos(p2) * sin(dl / 2).pow(2)
            return 2 * 6371.0 * asin(sqrt(h))
        }

        fun load(source: DataSource, scenarioId: String = "1939"): GameData = GameData(
            map = GameJson.decodeFromString(MapDef.serializer(), source.read("data/map/europe_1939.json")),
            rules = loadTunable(source, "data/rules.json"),
            countries = loadTunable<CountriesFile>(source, "data/countries.json").countries,
            scenario = loadTunable(source, "data/scenarios/$scenarioId/scenario.json"),
            sea = loadTunable(source, "data/sea.json"),
        )
    }
}

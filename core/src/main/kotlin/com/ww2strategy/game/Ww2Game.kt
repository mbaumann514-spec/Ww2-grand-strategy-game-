package com.ww2strategy.game

import com.badlogic.gdx.ApplicationAdapter
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.Input
import com.badlogic.gdx.InputAdapter
import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.utils.Align
import com.ww2strategy.sim.Calendar
import com.ww2strategy.sim.DataSource
import com.ww2strategy.sim.Division
import com.ww2strategy.sim.Faction
import com.ww2strategy.sim.Game
import com.ww2strategy.sim.GameData
import com.ww2strategy.sim.UnitType
import kotlin.math.hypot
import kotlin.math.roundToInt

/**
 * The game a player holds: the title page, the map of the war, and the pages over it.
 *
 * Upright, for one hand. Whatever the player does goes through the entry points of [Game];
 * this class reads the world and never writes to it.
 */
class Ww2Game(private val options: Options = Options()) : ApplicationAdapter() {

    /** What a launcher may ask for: the harness sets these, a phone leaves them alone. */
    class Options {
        var language: String? = null
        var density: Float? = null
        var country: String? = null
        var seed: Long = 1
        /** The harness plays without touching the player's saved war. */
        var noSave = false
        /** Called at the end of every frame, with the frame's number. */
        var onFrame: ((Ww2Game, Int) -> Unit)? = null
    }

    enum class Screen { TITLE, ABOUT, SOURCES, CAMPAIGN }
    enum class Panel { NONE, PRODUCTION, DIPLOMACY, MENU }

    lateinit var data: GameData
        private set
    lateinit var ui: Ui
        private set
    lateinit var map: MapView
        private set
    var game: Game? = null
        private set
    var screen = Screen.TITLE
    var panel = Panel.NONE
    var selected = -1
    var paused = true
    var speed = 1

    private val source = DataSource { Gdx.files.internal(it).readString("UTF-8") }
    private var chosen = 0
    private var marching = false
    private var fastOnly = false
    private var askWar = -1
    private var clock = 0f
    private var frame = 0
    private var scroll = 0f
    private var logSeen = 0
    private class Notice(val text: String, var left: Float, val colour: Color)
    private val notices = ArrayList<Notice>()
    private var lastController: IntArray? = null
    private var lastDecisions = 0
    private var showStart = false
    private var returnTo = Screen.TITLE

    private fun note(text: String, colour: Color = Palette.ink, seconds: Float = 7f) {
        notices.add(Notice(text, seconds, colour))
        while (notices.size > 5) notices.removeAt(0)
    }
    private var hint = ""
    private var hintTime = 0f
    private var hintX = 0f
    private var hintY = 0f
    private var endShown = false
    private var density = 1f
    val lastTargets = ArrayList<Ui.Target>()

    // touches
    private val downX = FloatArray(2)
    private val downY = FloatArray(2)
    private val lastX = FloatArray(2)
    private val lastY = FloatArray(2)
    private val held = BooleanArray(2)
    private var moved = false
    private var downAt = 0L
    private var holdFired = false

    private val playable = listOf("GER", "ENG", "FRA", "SOV", "ITA", "POL", "ROM", "HUN", "YUG", "GRE", "TUR", "SPA", "SWE", "FIN", "NOR", "BEL", "HOL", "BUL")
    private val speeds = floatArrayOf(0.5f, 1.5f, 4f, 10f)

    override fun create() {
        data = GameData.load(source)
        density = options.density ?: Gdx.graphics.density.coerceAtLeast(1f)
        Texts.load(source, options.language ?: java.util.Locale.getDefault().language)
        ui = Ui()
        map = MapView(data)
        resize(Gdx.graphics.width, Gdx.graphics.height)
        Gdx.input.setCatchKey(Input.Keys.BACK, true)
        Gdx.input.inputProcessor = Touches()
        options.country?.let { start(it) }
    }

    override fun resize(width: Int, height: Int) {
        if (width == 0 || height == 0) return
        ui.resize(width, height, density)
        map.resize(width, height)
    }

    fun countryName(c: Int): String {
        val key = "country." + data.countries[c].tag
        return if (Texts.has(key)) Texts.t(key) else data.countries[c].name
    }

    // ------------------------------------------------------------------ campaigns and saves

    private fun saveFile() = Gdx.files.local("saves/campaign.json")

    fun start(tag: String) {
        enter(Game.start(data, options.seed, tag))
    }

    private fun enter(g: Game) {
        game = g
        screen = Screen.CAMPAIGN
        panel = Panel.NONE
        selected = -1
        paused = true
        marching = false
        endShown = false
        logSeen = g.world.log.size
        notices.clear()
        lastController = g.world.controller.copyOf()
        lastDecisions = 0
        showStart = g.world.day == data.startDay
        val me = g.world.player
        map.lookAtRegion(data.capital[me], 1.0f)
    }

    /** Written beside the old save and then put in its place, so a save cut short loses nothing. */
    fun save() {
        val g = game ?: return
        if (options.noSave) return
        try {
            val tmp = Gdx.files.local("saves/campaign.tmp")
            tmp.writeString(Game.save(g.world), false, "UTF-8")
            tmp.moveTo(saveFile())
        } catch (e: Exception) {
            Gdx.app.error("save", "could not save", e)
        }
    }

    private fun load(): Boolean = try {
        enter(Game.load(data, saveFile().readString("UTF-8")))
        true
    } catch (e: Exception) {
        Gdx.app.error("save", "could not load", e)
        false
    }

    override fun pause() {
        if (screen == Screen.CAMPAIGN) save()
    }

    /** For the harness: let [days] pass at once. */
    fun advance(days: Int) {
        val g = game ?: return
        repeat(days) { g.tick() }
    }

    // ------------------------------------------------------------------ a frame

    override fun render() {
        val dt = Gdx.graphics.deltaTime.coerceAtMost(0.1f)
        val g = game
        if (screen == Screen.CAMPAIGN && g != null && !paused && panel == Panel.NONE && g.world.ultimatums.isEmpty()) {
            clock += dt * speeds[speed]
            var ticks = 0
            while (clock >= 1f && ticks < 3) { g.tick(); clock -= 1f; ticks++ }
            if (clock > 3f) clock = 0f
        }
        Gdx.gl.glClearColor(Palette.panel.r, Palette.panel.g, Palette.panel.b, 1f)
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT)
        if (screen == Screen.CAMPAIGN && g != null) map.draw(ui.shapes, g.world.controller, selected)
        ui.begin()
        when (screen) {
            Screen.TITLE -> title()
            Screen.ABOUT -> page("about", 5)
            Screen.SOURCES -> page("sources", 4)
            Screen.CAMPAIGN -> if (g != null) campaign(g, dt)
        }
        if (hintTime > 0f) {
            hintTime -= dt
            val w = minOf(ui.width - 24 * ui.dp, 300 * ui.dp)
            val x = (hintX - w / 2).coerceIn(12 * ui.dp, ui.width - w - 12 * ui.dp)
            ui.flush()
            val h = ui.paragraph(hint, x + 8 * ui.dp, hintY - 14 * ui.dp, w - 16 * ui.dp, Palette.ink, 0.9f)
            ui.rect(x, hintY - 22 * ui.dp - h, w, h + 16 * ui.dp, Palette.line, 0.95f)
            ui.frame(x, hintY - 22 * ui.dp - h, w, h + 16 * ui.dp, Palette.accent)
        }
        ui.end()
        ui.tapX = -1f
        lastTargets.clear()
        lastTargets.addAll(ui.targets)
        frame++
        options.onFrame?.invoke(this, frame)
    }

    // ------------------------------------------------------------------ the title page

    private fun title() {
        val dp = ui.dp
        val w = ui.width
        var y = ui.height - 40 * dp
        ui.text(Texts.t("title"), 0f, y, Palette.accent, 3f, Align.center, w)
        y -= ui.lineHeight(3f) + 2 * dp
        ui.text(Texts.t("subtitle") + "  ·  " + Texts.t("title.working"), 0f, y, Palette.dim, 1f, Align.center, w)
        y -= ui.lineHeight() + 22 * dp
        ui.text(Texts.t("choose"), 0f, y, Palette.ink, 1.2f, Align.center, w)
        y -= ui.lineHeight(1.2f) + 10 * dp
        val bw = (w - 36 * dp) / 2
        val bh = 48 * dp
        // The foot is fixed: Begin above the three small buttons. The list takes the rows there is room for, the great powers first.
        val saved = saveFile().exists()
        val footTop = 14 * dp + 48 * dp + 10 * dp + 56 * dp + (if (saved) 54 * dp else 0f) + 10 * dp
        val rows = (((y - footTop) / (bh + 6 * dp)).toInt()).coerceIn(2, (playable.size + 1) / 2)
        val shown = playable.take(rows * 2)
        if (chosen >= shown.size) chosen = 0
        for ((i, tag) in shown.withIndex()) {
            val c = data.country(tag)
            val x = 12 * dp + (i % 2) * (bw + 12 * dp)
            val by = y - bh - (i / 2) * (bh + 6 * dp)
            if (ui.button("country:$tag", x, by, bw, bh, "", hot = i == chosen)) chosen = i
            ui.rect(x + 6 * dp, by + 8 * dp, 10 * dp, bh - 16 * dp, Color.valueOf(data.countries[c].colour))
            ui.text(countryName(c), x + 22 * dp, by + bh / 2 + ui.mid(0.85f), Palette.ink, 0.85f)
        }
        var fy = 14 * dp + 48 * dp + 10 * dp
        if (saved) { if (ui.button("continue", 12 * dp, fy, w - 24 * dp, 48 * dp, Texts.t("continue"), scale = 0.85f)) load(); fy += 54 * dp }
        if (ui.button("play", 12 * dp, fy, w - 24 * dp, 56 * dp, Texts.t("play") + ": " + countryName(data.country(shown[chosen])), hot = true)) start(shown[chosen])
        val third = (w - 36 * dp) / 3
        if (ui.button("about", 12 * dp, 14 * dp, third, 48 * dp, Texts.t("about.button"), scale = 0.75f)) { returnTo = Screen.TITLE; screen = Screen.ABOUT; scroll = 0f }
        if (ui.button("sources", 18 * dp + third, 14 * dp, third, 48 * dp, Texts.t("sources.button"), scale = 0.75f)) { returnTo = Screen.TITLE; screen = Screen.SOURCES; scroll = 0f }
        if (ui.button("language", 24 * dp + 2 * third, 14 * dp, third, 48 * dp, Texts.t("language"), scale = 0.75f)) Texts.load(source, if (Texts.language == "de") "en" else "de")
    }

    private val licenceText: String by lazy {
        listOf("apache-2.0.txt", "ofl-jersey-10.txt", "ofl-jacquard-12.txt", "boost-1.0.txt").joinToString("\n\n") {
            try { source.read("data/licences/$it") } catch (e: Exception) { "" }
        }
    }

    /** A page of paragraphs that scrolls under a finger. */
    private fun page(key: String, paragraphs: Int) {
        val dp = ui.dp
        val w = ui.width - 32 * dp
        var y = ui.height - 24 * dp + scroll
        y -= ui.paragraph(Texts.t("$key.title"), 16 * dp, y, w, Palette.accent, 1.3f) + 10 * dp
        for (i in 1..paragraphs) y -= ui.paragraph(Texts.t("$key.$i"), 16 * dp, y, w) + 12 * dp
        if (key == "sources") {
            // Long texts are drawn a block at a time, and only the blocks on the screen.
            for (block in licenceText.split("\n\n")) {
                if (block.isBlank()) continue
                if (y < -400 * dp) break
                val h = ui.paragraph(block.replace("\n", " ").replace(Regex(" +"), " ").trim(), 16 * dp, y, w, Palette.dim, 0.75f)
                y -= h + 8 * dp
            }
        }
        val content = ui.height - 24 * dp + scroll - y
        maxScroll = (content - (ui.height - 120 * dp)).coerceAtLeast(0f)
        ui.flush()
        ui.rect(0f, 0f, ui.width, 76 * dp, Palette.panel)
        if (ui.button("back", 12 * dp, 14 * dp, ui.width - 24 * dp, 48 * dp, Texts.t("back"))) back()
    }

    private var maxScroll = 0f

    // ------------------------------------------------------------------ the campaign

    private fun myDivisions(g: Game, r: Int): List<Division> =
        g.divisionsIn(r).filter { it.owner == g.world.player && (!fastOnly || it.type == UnitType.ARM || it.type == UnitType.MOT || it.type == UnitType.CAV) }

    private fun campaign(g: Game, dt: Float) {
        val dp = ui.dp
        val w = ui.width
        val h = ui.height
        val me = g.world.player
        val state = g.cs(me)
        val over = g.world.winner != Faction.NEUTRAL || g.cs(me).capitulated
        val popupOpen = g.world.ultimatums.isNotEmpty() || askWar >= 0 || (over && !endShown) || showStart
        val modal = panel != Panel.NONE || popupOpen
        map.drawOver(ui, g, me, selected) { countryName(it) }
        ui.flush()

        // New entries of the world's log become notices under the top bar.
        while (logSeen < g.world.log.size) {
            val e = g.world.log[logSeen++]
            if (e.kind == "CAPTURE" && e.a != me && e.b != me) continue
            if (e.kind == "VICTORY") continue
            // A war is news when it is the player's or a great power's; the rest would fill the screen on a day alliances are drawn in.
            if (e.kind == "WAR" && e.a != me && e.b != me && !(data.countries[e.a].major && data.countries[e.b].major)) continue
            if (e.kind == "WAR" && (g.cs(e.a).passive || g.cs(e.b).passive)) continue
            val a = if (e.a >= 0 && e.kind != "VICTORY") countryName(e.a) else ""
            val b = if (e.kind == "JOIN") Texts.t("faction." + Faction.entries[e.b].name) else if (e.b >= 0) countryName(e.b) else ""
            note(Texts.t("log." + e.kind, a, b, if (e.region >= 0) data.regions[e.region].name else ""))
        }
        // What changed hands: the player's own land lost is an alarm, land he took a word of success.
        lastController?.let { before ->
            for (r in 0 until data.n) {
                val now = g.world.controller[r]
                if (now == before[r]) continue
                if (g.world.owner[r] == me && before[r] == me && g.atWar(me, now)) note(Texts.t("alarm.lost", countryName(now), data.regions[r].name), Palette.bad, 12f)
                else if (now == me && g.world.owner[r] != me) note(Texts.t("alarm.won", data.regions[r].name), Palette.good)
                before[r] = now
            }
        }
        val waiting = g.decisions(me).size
        if (waiting > lastDecisions) note(Texts.t("alarm.decision"), Palette.accent, 10f)
        lastDecisions = waiting

        // ---- the top bar
        val top = 104 * dp
        ui.rect(0f, h - top, w, top, Palette.panel)
        ui.rect(0f, h - top, w, dp, Palette.accent)
        ui.rect(10 * dp, h - 34 * dp, 12 * dp, 22 * dp, Color.valueOf(data.countries[me].colour))
        ui.frame(10 * dp, h - 34 * dp, 12 * dp, 22 * dp, Palette.ink)
        ui.text(countryName(me), 28 * dp, h - 12 * dp, Palette.ink, 1.05f)
        val date = Calendar.date(g.world.day)
        val dateText = if (Texts.language == "de") "${date.day}. ${date.month}. ${date.year}" else "${date.day} ${MONTHS[date.month - 1]} ${date.year}"
        ui.text(dateText, 0f, h - 12 * dp, Palette.accent, 1.05f, Align.right, w - 10 * dp)
        ui.hold(w - 150 * dp, h - 40 * dp, 150 * dp, 40 * dp, "hold.date")
        val rowY = h - top + 6 * dp
        val cell = (w - 20 * dp - 2 * 54 * dp) / 3
        stat(10 * dp, rowY, cell, "ic", state.icNow.roundToInt().toString(), "hold.ic")
        stat(10 * dp + cell, rowY, cell, "men", state.manpower.roundToInt().toString(), "hold.men")
        stat(10 * dp + 2 * cell, rowY, cell, "fuel", state.fuel.roundToInt().toString(), "hold.fuel", if (state.noFuel) Palette.bad else Palette.ink)
        ui.inert = modal
        if (ui.button("pause", w - 10 * dp - 102 * dp, rowY, 48 * dp, 48 * dp, "")) paused = !paused
        icon("pause".takeIf { !paused } ?: "play", w - 10 * dp - 102 * dp, rowY, 48 * dp, Palette.ink)
        if (ui.button("speed", w - 10 * dp - 48 * dp, rowY, 48 * dp, 48 * dp, "x" + (speed + 1))) speed = (speed + 1) % speeds.size
        ui.hold(w - 10 * dp - 102 * dp, rowY, 102 * dp, 48 * dp, "hold.speed")

        // ---- notices
        var ny = h - top - 6 * dp
        val it = notices.iterator()
        while (it.hasNext()) {
            val n = it.next()
            val alpha = (n.left / 1.5f).coerceIn(0f, 1f)
            val tw = minOf(ui.textWidth(n.text, 0.8f), w - 28 * dp)
            val th = ui.paragraphHeight(n.text, w - 28 * dp, 0.8f)
            ui.rect(8 * dp, ny - th - 4 * dp, tw + 12 * dp, th + 6 * dp, Palette.line, 0.78f * alpha)
            ui.paragraph(n.text, 14 * dp, ny - 3 * dp, w - 28 * dp, Color(n.colour).apply { a = alpha }, 0.8f)
            ny -= th + 8 * dp
            n.left -= dt
            if (n.left <= 0f) it.remove()
        }
        if (paused) ui.text(Texts.t("paused"), 0f, h - 12 * dp - ui.lineHeight(1.05f), Palette.dim, 0.75f, Align.right, w - 10 * dp)

        // ---- the bottom tabs
        ui.inert = popupOpen
        val tabH = 56 * dp
        ui.rect(0f, 0f, w, tabH + 8 * dp, Palette.panel)
        val tw3 = (w - 32 * dp) / 3
        if (ui.button("tab.production", 8 * dp, 4 * dp, tw3, tabH, Texts.t("tab.production"), hot = panel == Panel.PRODUCTION)) toggle(Panel.PRODUCTION)
        if (ui.button("tab.diplomacy", 16 * dp + tw3, 4 * dp, tw3, tabH, Texts.t("tab.diplomacy"), hot = panel == Panel.DIPLOMACY || g.decisions(me).isNotEmpty())) toggle(Panel.DIPLOMACY)
        if (ui.button("tab.menu", 24 * dp + 2 * tw3, 4 * dp, tw3, tabH, Texts.t("tab.menu"), hot = panel == Panel.MENU)) toggle(Panel.MENU)
        ui.block(0f, 0f, w, tabH + 8 * dp)
        ui.block(0f, h - top, w, top)

        // ---- the region's sheet
        ui.inert = modal
        var sheetTop = tabH + 8 * dp
        if (selected >= 0 && !modal) sheetTop = sheet(g, me, tabH + 8 * dp)
        ui.inert = popupOpen
        ui.flush()

        // ---- pages over the map
        val px = 8 * dp
        val py = tabH + 14 * dp
        val pw = w - 16 * dp
        val ph = h - top - tabH - 22 * dp
        when (panel) {
            Panel.PRODUCTION -> production(g, me, px, py, pw, ph)
            Panel.DIPLOMACY -> diplomacy(g, me, px, py, pw, ph)
            Panel.MENU -> menu(px, py, pw, ph)
            Panel.NONE -> {}
        }
        ui.inert = false
        if (askWar >= 0) confirmWar(g, me)
        g.world.ultimatums.firstOrNull { it.on == me }?.let { u ->
            popup(Texts.t("ultimatum.title"), Texts.t("ultimatum.text", countryName(u.by)), "ultimatum.yes", "ultimatum.no") { yes -> g.answerUltimatum(me, u.plan, yes) }
        }
        if (showStart) {
            val foes = data.countries.indices.filter { g.atWar(me, it) }.joinToString(", ") { countryName(it) }
            val first = if (foes.isEmpty()) Texts.t("start.peace") else Texts.t("start.war", foes)
            popup(Texts.t("start.title"), first + " " + Texts.t("start.text"), "start.ok", "about.button") { yes ->
                showStart = false
                if (!yes) { returnTo = Screen.CAMPAIGN; screen = Screen.ABOUT; scroll = 0f }
            }
        }
        if (over && !endShown) {
            paused = true
            val text = if (g.cs(me).capitulated && g.world.winner == Faction.NEUTRAL) Texts.t("end.defeat") else Texts.t("end." + g.world.winner.name)
            popup(Texts.t("end.title"), text, "end.goon", "menu.title") { yes -> endShown = true; if (!yes) { save(); screen = Screen.TITLE } }
        }

        // ---- a tap that nothing took goes to the map
        if (ui.tapX >= 0 && !modal && ui.tapY > sheetTop && ui.tapY < h - top) {
            val r = map.regionAt(ui.tapX, h - ui.tapY)
            if (marching && selected >= 0 && r >= 0) {
                val went = g.orderMove(me, myDivisions(g, selected).map { it.id }, r)
                if (went == 0 && r != selected) note(Texts.t("march.noway"), Palette.bad)
                marching = false
            } else {
                selected = if (r == selected) -1 else r
                marching = false
            }
            ui.tapX = -1f
        }
    }

    private fun toggle(p: Panel) {
        panel = if (panel == p) Panel.NONE else p
        askWar = -1
        scroll = 0f
    }

    private fun stat(x: Float, y: Float, w: Float, kind: String, value: String, hold: String, colour: Color = Palette.ink) {
        val dp = ui.dp
        icon(kind, x, y + 6 * dp, 36 * dp, Palette.accent)
        ui.text(value, x + 38 * dp, y + 24 * dp + ui.mid(), colour, 1f)
        ui.hold(x, y, w, 48 * dp, hold)
    }

    /** The few signs of the top bar, drawn from rectangles and triangles. */
    private fun icon(kind: String, x: Float, y: Float, s: Float, c: Color) {
        val u = s / 12f
        ui.shapes.color = c
        when (kind) {
            "ic" -> { // a factory: a shed with a saw roof and a chimney
                ui.shapes.rect(x + 2 * u, y + 2 * u, 8 * u, 4 * u)
                ui.shapes.triangle(x + 2 * u, y + 6 * u, x + 5 * u, y + 6 * u, x + 2 * u, y + 8.5f * u)
                ui.shapes.triangle(x + 5 * u, y + 6 * u, x + 8 * u, y + 6 * u, x + 5 * u, y + 8.5f * u)
                ui.shapes.rect(x + 8.5f * u, y + 6 * u, 1.5f * u, 4 * u)
            }
            "men" -> { // a steel helmet over a head
                ui.shapes.rect(x + 1.5f * u, y + 4 * u, 9 * u, 1.4f * u)
                ui.shapes.arc(x + 6 * u, y + 5.2f * u, 3.6f * u, 0f, 180f, 14)
            }
            "fuel" -> { // a drop
                ui.shapes.circle(x + 6 * u, y + 5 * u, 2.6f * u, 14)
                ui.shapes.triangle(x + 3.7f * u, y + 6.2f * u, x + 8.3f * u, y + 6.2f * u, x + 6 * u, y + 10.5f * u)
            }
            "pause" -> { ui.shapes.rect(x + 3.5f * u, y + 3 * u, 1.8f * u, 6 * u); ui.shapes.rect(x + 6.7f * u, y + 3 * u, 1.8f * u, 6 * u) }
            "play" -> ui.shapes.triangle(x + 4 * u, y + 3 * u, x + 4 * u, y + 9 * u, x + 9 * u, y + 6 * u)
        }
    }

    /** What stands in the selected region and what can be ordered there. Returns the sheet's top edge. */
    private fun sheet(g: Game, me: Int, bottom: Float): Float {
        val dp = ui.dp
        val w = ui.width
        val r = data.regions[selected]
        val mine = myDivisions(g, selected)
        val all = g.divisionsIn(selected)
        val owners = minOf(2, all.map { it.owner }.distinct().size)
        val sheetH = 20 * dp + ui.lineHeight(1.15f) + (2 + owners) * (ui.lineHeight(0.8f) + 4 * dp) + 8 * dp +
            if (all.any { it.owner == me }) 58 * dp else 0f
        val y = bottom
        ui.rect(0f, y, w, sheetH, Palette.panel)
        ui.rect(0f, y + sheetH - dp, w, dp, Palette.accent)
        var ty = y + sheetH - 10 * dp
        val owner = g.world.owner[selected]
        val holder = g.world.controller[selected]
        ui.rect(12 * dp, ty - 20 * dp, 10 * dp, 20 * dp, Color.valueOf(data.countries[holder].colour))
        ui.text(r.name, 28 * dp, ty, Palette.ink, 1.15f)
        if (ui.button("sheet.close", w - 56 * dp, y + sheetH - 52 * dp, 48 * dp, 48 * dp, "x")) { selected = -1; marching = false }
        ty -= ui.lineHeight(1.15f) + 4 * dp
        val whose = if (holder == owner) countryName(owner) else countryName(owner) + ", " + Texts.t("held.by", countryName(holder))
        val fought = g.world.battleDay[selected] >= g.world.day - 1
        ui.text(if (fought) Texts.t("sheet.battle") else whose + "  ·  " + Texts.t("terrain." + data.terrainName[selected]), 12 * dp, ty, if (fought) Palette.bad else Palette.dim, 0.8f)
        ty -= ui.lineHeight(0.8f) + 4 * dp
        val facts = ArrayList<String>()
        facts.add(Texts.t("factories", "%.1f".format(data.factories[selected])))
        facts.add(Texts.t("points", data.vp[selected]))
        if (data.fort[selected] > 0) facts.add(Texts.t("works", data.fort[selected]))
        if (data.oil[selected] > 0) facts.add(Texts.t("oil", data.oil[selected].roundToInt()))
        ui.text(facts.joinToString("   "), 12 * dp, ty, Palette.ink, 0.8f)
        ui.hold(0f, ty - ui.lineHeight(0.8f) - 6 * dp, w - 60 * dp, ui.lineHeight(0.8f) + 12 * dp, "hold.facts")
        ty -= ui.lineHeight(0.8f) + 8 * dp
        if (all.isNotEmpty()) {
            // Who stands here: one line a state, its arms counted.
            for ((owner2, group) in all.groupBy { it.owner }.entries.take(2)) {
                val counts = UnitType.entries.mapNotNull { t -> group.count { it.type == t }.takeIf { it > 0 }?.let { "$it ${Texts.t("unit." + t.name)}" } }
                val whole = (group.sumOf { it.strength } / group.sumOf { it.size } * 100).roundToInt()
                val ready = (group.sumOf { it.org } / group.size * 100).roundToInt()
                ui.rect(12 * dp, ty - 16 * dp, 8 * dp, 16 * dp, Color.valueOf(data.countries[owner2].colour))
                ui.text(counts.joinToString(", ") + "  ·  " + Texts.t("sheet.state", whole, ready), 26 * dp, ty, if (owner2 == me) Palette.ink else Palette.dim, 0.8f)
                ty -= ui.lineHeight(0.8f) + 4 * dp
            }
        }
        if (g.divisionsIn(selected).any { it.owner == me }) {
            val bw = (w - 48 * dp) / 4
            val by = y + 6 * dp
            if (ui.button("sheet.all", 12 * dp, by, bw, 48 * dp, Texts.t("all"), hot = !fastOnly, scale = 0.85f)) fastOnly = false
            if (ui.button("sheet.fast", 20 * dp + bw, by, bw, 48 * dp, Texts.t("fast"), hot = fastOnly, scale = 0.85f)) fastOnly = true
            if (ui.button("sheet.march", 28 * dp + 2 * bw, by, bw, 48 * dp, Texts.t("march"), hot = marching, enabled = mine.isNotEmpty(), scale = 0.85f)) marching = !marching
            if (ui.button("sheet.halt", 36 * dp + 3 * bw, by, bw, 48 * dp, Texts.t("halt"), enabled = mine.isNotEmpty(), scale = 0.85f)) { g.orderHalt(me, mine.map { it.id }); marching = false }
            if (marching) ui.text(Texts.t("march.hint"), 0f, y + sheetH + ui.lineHeight() + 6 * dp, Palette.accent, 1f, Align.center, w)
        }
        ui.block(0f, y, w, sheetH)
        return y + sheetH
    }

    private fun production(g: Game, me: Int, x: Float, y: Float, w: Float, h: Float) {
        val dp = ui.dp
        val state = g.cs(me)
        ui.panel(x, y, w, h)
        var ty = y + h - 12 * dp
        ui.text(Texts.t("production.title"), x + 12 * dp, ty, Palette.accent, 1.3f)
        ty -= ui.lineHeight(1.3f) + 2 * dp
        ui.text(Texts.t("production.rate", state.icNow.roundToInt()), x + 12 * dp, ty, Palette.dim, 0.85f)
        ty -= ui.lineHeight(0.85f) + 10 * dp
        ui.text(Texts.t("production.queue"), x + 12 * dp, ty, Palette.ink, 1f)
        ty -= ui.lineHeight() + 4 * dp
        if (state.queue.isEmpty()) { ui.text(Texts.t("production.empty"), x + 12 * dp, ty, Palette.dim, 0.85f); ty -= ui.lineHeight(0.85f) + 6 * dp }
        for ((i, line) in state.queue.withIndex()) {
            val cost = data.unit[line.type.ordinal].cost * data.countries[me].divisionCost
            val done = (line.done / cost).toFloat().coerceIn(0f, 1f)
            val rowH = 48 * dp
            ui.rect(x + 12 * dp, ty - rowH, w - 84 * dp, rowH, Palette.panelLight)
            ui.rect(x + 12 * dp, ty - rowH, (w - 84 * dp) * done, 5 * dp, Palette.good)
            ui.text(Texts.t("unit." + line.type.name), x + 20 * dp, ty - 10 * dp, Palette.ink, 0.9f)
            ui.text(if (done >= 1f) Texts.t("production.wait") else "${(done * 100).roundToInt()}%", x + 12 * dp, ty - 10 * dp, Palette.dim, 0.85f, Align.right, w - 92 * dp)
            if (ui.button("queue.cancel:$i", x + w - 60 * dp, ty - rowH, 48 * dp, rowH, "x")) g.cancelBuild(me, i)
            ty -= rowH + 4 * dp
        }
        ty -= 8 * dp
        ui.text(Texts.t("production.add"), x + 12 * dp, ty, Palette.ink, 1f)
        ty -= ui.lineHeight() + 4 * dp
        val full = state.queue.size >= data.rules.economy.productionLines
        // Two to a row, so that six lines in progress and six kinds to raise fit a small phone; a held finger tells the price.
        val half = (w - 32 * dp) / 2
        for ((i, type) in UnitType.entries.withIndex()) {
            val u = data.unit[type.ordinal]
            val cost = u.cost * data.countries[me].divisionCost
            val days = (cost / state.icNow.coerceAtLeast(0.1)).roundToInt()
            val bx = x + 12 * dp + (i % 2) * (half + 8 * dp)
            val by = ty - 48 * dp - (i / 2) * 52 * dp
            if (ui.button("build:" + type.name, bx, by, half, 48 * dp, Texts.t("unit." + type.name) + "  " + Texts.t("production.days", days), enabled = !full, scale = 0.75f)) g.build(me, type)
            ui.holdText(bx, by, half, 48 * dp, Texts.t("hold.build", u.manpower.roundToInt(), cost.roundToInt()))
        }
        ty -= ((UnitType.entries.size + 1) / 2) * 52 * dp
        if (full) ui.text(Texts.t("production.full"), x + 12 * dp, ty, Palette.bad, 0.85f)
        ui.block(x, y, w, h)
    }

    private fun diplomacy(g: Game, me: Int, x: Float, y: Float, w: Float, h: Float) {
        val dp = ui.dp
        ui.panel(x, y, w, h)
        var ty = y + h - 12 * dp
        ui.text(Texts.t("diplomacy.decisions"), x + 12 * dp, ty, Palette.accent, 1.2f)
        ty -= ui.lineHeight(1.2f) + 6 * dp
        val decisions = g.decisions(me)
        if (decisions.isEmpty()) { ui.text(Texts.t("diplomacy.none"), x + 12 * dp, ty, Palette.dim, 0.85f); ty -= ui.lineHeight(0.85f) + 8 * dp }
        for (plan in decisions.take(4)) {
            if (ui.button("decide:" + plan.id, x + 12 * dp, ty - 48 * dp, w - 24 * dp, 48 * dp, Texts.t("plan." + plan.id), hot = true, scale = 0.85f)) g.takeDecision(me, plan.id)
            ty -= 54 * dp
        }
        ty -= 6 * dp
        ui.text(Texts.t("diplomacy.title"), x + 12 * dp, ty, Palette.accent, 1.2f)
        ty -= ui.lineHeight(1.2f) + 6 * dp
        // The states that matter to the player first: enemies, friends, then the rest by their armies.
        val others = data.countries.indices.filter { it != me && g.alive(it) }
            .sortedWith(compareBy<Int> { if (g.atWar(me, it)) 0 else if (g.allied(me, it)) 1 else 2 }.thenByDescending { g.divisionCount(it) })
        val rowH = 54 * dp
        for (c in others) {
            if (ty - rowH < y + 8 * dp) break
            ui.rect(x + 12 * dp, ty - rowH + 8 * dp, 8 * dp, rowH - 16 * dp, Color.valueOf(data.countries[c].colour))
            val status = if (g.atWar(me, c)) Texts.t("diplomacy.war") else if (g.allied(me, c)) Texts.t("diplomacy.ally") else Texts.t("faction." + g.cs(c).faction.name)
            ui.text(countryName(c), x + 26 * dp, ty - 6 * dp, Palette.ink, 0.85f)
            ui.text(status + "  ·  " + (if (g.divisionCount(c) == 1) Texts.t("division") else Texts.t("divisions", g.divisionCount(c))), x + 26 * dp, ty - 6 * dp - ui.lineHeight(0.85f), if (g.atWar(me, c)) Palette.bad else Palette.dim, 0.7f)
            if (g.canDeclareWar(me, c) && ui.button("war:" + data.countries[c].tag, x + w - 132 * dp, ty - rowH + 3 * dp, 120 * dp, 48 * dp, Texts.t("diplomacy.declare"), scale = 0.7f)) askWar = c
            ty -= rowH
        }
        ui.block(x, y, w, h)
    }

    private fun confirmWar(g: Game, me: Int) {
        popup(Texts.t("diplomacy.declare"), Texts.t("diplomacy.sure", countryName(askWar)), "yes", "no") { yes ->
            if (yes) g.declareWar(me, askWar)
            askWar = -1
        }
    }

    private fun menu(x: Float, y: Float, w: Float, h: Float) {
        val dp = ui.dp
        ui.panel(x, y, w, h)
        var ty = y + h - 16 * dp
        if (ui.button("menu.save", x + 12 * dp, ty - 56 * dp, w - 24 * dp, 56 * dp, Texts.t("menu.save"))) { save(); screen = Screen.TITLE }
        ty -= 64 * dp
        if (ui.button("menu.about", x + 12 * dp, ty - 56 * dp, w - 24 * dp, 56 * dp, Texts.t("about.button"))) { save(); returnTo = Screen.CAMPAIGN; screen = Screen.ABOUT; scroll = 0f }
        ty -= 64 * dp
        if (ui.button("menu.language", x + 12 * dp, ty - 56 * dp, w - 24 * dp, 56 * dp, Texts.t("language"))) Texts.load(source, if (Texts.language == "de") "en" else "de")
        ui.block(x, y, w, h)
    }

    private fun popup(title: String, text: String, yes: String, no: String, answer: (Boolean) -> Unit) {
        val dp = ui.dp
        ui.flush()
        ui.rect(0f, 0f, ui.width, ui.height, Palette.line, 0.55f)
        val w = ui.width - 40 * dp
        val x = 20 * dp
        val th = ui.paragraphHeight(text, w - 28 * dp)
        val h = th + 150 * dp
        val y = (ui.height - h) / 2
        ui.panel(x, y, w, h)
        ui.text(title, x + 14 * dp, y + h - 14 * dp, Palette.accent, 1.3f)
        ui.paragraph(text, x + 14 * dp, y + h - 22 * dp - ui.lineHeight(1.3f), w - 28 * dp)
        val bw = (w - 42 * dp) / 2
        if (ui.button("popup.yes", x + 14 * dp, y + 14 * dp, bw, 52 * dp, Texts.t(yes), hot = true, scale = 0.85f)) answer(true)
        if (ui.button("popup.no", x + 28 * dp + bw, y + 14 * dp, bw, 52 * dp, Texts.t(no), scale = 0.85f)) answer(false)
        ui.block(0f, 0f, ui.width, ui.height)
    }

    /** The back key and Escape: close what is open, then leave the campaign. */
    fun back() {
        when {
            screen == Screen.ABOUT || screen == Screen.SOURCES -> screen = if (returnTo == Screen.CAMPAIGN && game != null) Screen.CAMPAIGN else Screen.TITLE
            screen == Screen.TITLE -> {}
            askWar >= 0 -> askWar = -1
            panel != Panel.NONE -> panel = Panel.NONE
            marching -> marching = false
            selected >= 0 -> selected = -1
            else -> { save(); screen = Screen.TITLE }
        }
    }

    /** For the harness: a tap at screen pixels, y down as touches come. */
    fun tap(x: Float, y: Float) {
        ui.tapX = x
        ui.tapY = ui.height - y
    }

    private fun holdAt(x: Float, yUp: Float) {
        val place = ui.holds.lastOrNull { ui.inside(x, yUp, it.x, it.y, it.w, it.h) } ?: lastHolds.lastOrNull { ui.inside(x, yUp, it.x, it.y, it.w, it.h) } ?: return
        hint = place.text
        hintTime = 3.5f
        hintX = x
        hintY = yUp - 30 * ui.dp
        if (hintY < 160 * ui.dp) hintY = yUp + 120 * ui.dp
    }

    private val lastHolds = ArrayList<Ui.Hold>()

    fun hold(x: Float, y: Float) {
        lastHolds.clear(); lastHolds.addAll(ui.holds)
        holdAt(x, ui.height - y)
    }

    private inner class Touches : InputAdapter() {
        override fun touchDown(x: Int, y: Int, pointer: Int, button: Int): Boolean {
            if (pointer > 1) return false
            held[pointer] = true
            downX[pointer] = x.toFloat(); downY[pointer] = y.toFloat()
            lastX[pointer] = x.toFloat(); lastY[pointer] = y.toFloat()
            if (pointer == 0) { moved = false; downAt = System.currentTimeMillis(); holdFired = false }
            else moved = true
            return true
        }

        override fun touchDragged(x: Int, y: Int, pointer: Int): Boolean {
            if (pointer > 1 || !held[pointer]) return false
            val fx = x.toFloat(); val fy = y.toFloat()
            if (held[0] && held[1]) {
                val other = 1 - pointer
                val before = hypot(lastX[pointer] - lastX[other], lastY[pointer] - lastY[other])
                val after = hypot(fx - lastX[other], fy - lastY[other])
                if (screen == Screen.CAMPAIGN && after > 1f && before > 1f) map.zoomAt(before / after, (fx + lastX[other]) / 2, (fy + lastY[other]) / 2)
                moved = true
            } else {
                if (hypot(fx - downX[pointer], fy - downY[pointer]) > 10 * ui.dp) moved = true
                if (moved) {
                    if (screen == Screen.CAMPAIGN && panel == Panel.NONE) map.pan(fx - lastX[pointer], fy - lastY[pointer])
                    else scroll = (scroll + (lastY[pointer] - fy)).coerceIn(0f, maxScroll)
                } else if (!holdFired && System.currentTimeMillis() - downAt > 450) { holdFired = true; hold(fx, fy) }
            }
            lastX[pointer] = fx; lastY[pointer] = fy
            return true
        }

        override fun touchUp(x: Int, y: Int, pointer: Int, button: Int): Boolean {
            if (pointer > 1) return false
            held[pointer] = false
            if (pointer == 0 && !moved && !holdFired) {
                if (System.currentTimeMillis() - downAt > 450) hold(x.toFloat(), y.toFloat()) else tap(x.toFloat(), y.toFloat())
            }
            return true
        }

        override fun scrolled(amountX: Float, amountY: Float): Boolean {
            if (screen == Screen.CAMPAIGN && panel == Panel.NONE) map.zoomAt(if (amountY > 0) 1.15f else 1 / 1.15f, Gdx.input.x.toFloat(), Gdx.input.y.toFloat())
            else scroll = (scroll + amountY * 40 * ui.dp).coerceIn(0f, maxScroll)
            return true
        }

        override fun keyDown(keycode: Int): Boolean {
            when (keycode) {
                Input.Keys.BACK, Input.Keys.ESCAPE -> back()
                Input.Keys.SPACE -> paused = !paused
                Input.Keys.NUM_1, Input.Keys.NUM_2, Input.Keys.NUM_3, Input.Keys.NUM_4 -> speed = keycode - Input.Keys.NUM_1
                else -> return false
            }
            return true
        }
    }

    override fun dispose() {
        ui.dispose()
        map.dispose()
    }

    private companion object {
        val MONTHS = arrayOf("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")
    }
}

package com.ww2strategy.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.Mesh
import com.badlogic.gdx.graphics.OrthographicCamera
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.VertexAttribute
import com.badlogic.gdx.graphics.VertexAttributes
import com.badlogic.gdx.graphics.glutils.ShaderProgram
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Vector3
import com.ww2strategy.sim.Division
import com.ww2strategy.sim.Game
import com.ww2strategy.sim.GameData
import com.ww2strategy.sim.UnitType
import kotlin.math.max
import kotlin.math.min

/**
 * The map: the ground as a texture laid under the land, each region tinted with the colour of
 * whoever holds it, borders, rivers, towns and the armies as military map symbols. All of it is
 * drawn in code from data/map/europe_1939.json; there is no image file.
 *
 * World units are kilometres, x east and y north. The camera's zoom is kilometres to a pixel.
 */
class MapView(private val data: GameData) {
    val camera = OrthographicCamera()
    private val worldW = data.map.width / 10f
    private val worldH = data.map.height / 10f
    private val n = data.n

    private val land: Mesh
    private val lakes: Mesh
    private val landVertices: FloatArray
    private val first = IntArray(n)
    private val count = IntArray(n)
    private val shader: ShaderProgram
    private val ground: Texture
    private val groundBox = FloatArray(4)
    private val colours: Array<Color> = Array(data.countries.size) { Color.valueOf(data.countries[it].colour) }
    private val shown = IntArray(n) { -2 }

    private val cityX = FloatArray(n) { data.regions[it].city[0] / 10f }
    private val cityY = FloatArray(n) { data.regions[it].city[1] / 10f }
    private val box = Array(n) { FloatArray(4) }
    private val borderPts: Array<FloatArray> = Array(data.map.borders.size) { i -> FloatArray(data.map.borders[i].pts.size) { data.map.borders[i].pts[it] / 10f } }
    private val borderBox = Array(data.map.borders.size) { FloatArray(4) }
    private val riverPts: Array<FloatArray> = Array(data.map.rivers.size) { i -> FloatArray(data.map.rivers[i].pts.size) { data.map.rivers[i].pts[it] / 10f } }
    private val tmp = Vector3()

    var minZoom = 0.25f
    var maxZoom = 8f

    init {
        // The land: every region's triangles, one colour a region, three floats a corner.
        var corners = 0
        for (r in data.regions) for (t in r.tris) corners += t.size
        landVertices = FloatArray(corners * 3)
        var at = 0
        for ((i, r) in data.regions.withIndex()) {
            first[i] = at / 3
            var x0 = Float.MAX_VALUE; var y0 = Float.MAX_VALUE; var x1 = -Float.MAX_VALUE; var y1 = -Float.MAX_VALUE
            for (p in r.polys.indices) {
                val pts = r.polys[p]
                for (index in r.tris[p]) {
                    val x = pts[index * 2] / 10f
                    val y = pts[index * 2 + 1] / 10f
                    landVertices[at++] = x; landVertices[at++] = y; landVertices[at++] = 0f
                    x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y)
                }
            }
            count[i] = at / 3 - first[i]
            box[i][0] = x0; box[i][1] = y0; box[i][2] = x1; box[i][3] = y1
        }
        land = Mesh(false, corners, 0, VertexAttribute(VertexAttributes.Usage.Position, 2, "a_position"), VertexAttribute.ColorPacked())
        var lakeCorners = 0
        for (l in data.map.lakes) lakeCorners += l.tris.size
        val lakeVertices = FloatArray(lakeCorners * 3)
        at = 0
        val water = Color(Palette.sea).apply { a = 1f }.toFloatBits()
        for (l in data.map.lakes) for (index in l.tris) {
            lakeVertices[at++] = l.pts[index * 2] / 10f; lakeVertices[at++] = l.pts[index * 2 + 1] / 10f; lakeVertices[at++] = water
        }
        lakes = Mesh(true, max(3, lakeCorners), 0, VertexAttribute(VertexAttributes.Usage.Position, 2, "a_position"), VertexAttribute.ColorPacked())
        lakes.setVertices(lakeVertices)
        for ((i, b) in borderPts.withIndex()) bounds(b, borderBox[i])

        ShaderProgram.pedantic = false
        shader = ShaderProgram(VERTEX, FRAGMENT)
        if (!shader.isCompiled) throw IllegalStateException("map shader: " + shader.log)

        // The ground: Natural Earth II reduced to twelve colours on an 8 km grid, one pixel a cell.
        val g = data.map.ground
        val bytes = ByteArray(g.width * g.height * 3)
        val palette = g.palette.map { Color.valueOf(it) }
        for ((y, row) in g.rows.withIndex()) {
            var x = 0
            var i = 0
            while (i < row.length) {
                val letter = g.code.indexOf(row[i]); i++
                var j = i
                while (j < row.length && row[j].isDigit()) j++
                val run = if (j > i) row.substring(i, j).toInt() else 1
                i = j
                val c = palette[max(0, letter - 1)]
                repeat(run) {
                    if (x < g.width) {
                        val o = (y * g.width + x) * 3
                        bytes[o] = (c.r * 255).toInt().toByte(); bytes[o + 1] = (c.g * 255).toInt().toByte(); bytes[o + 2] = (c.b * 255).toInt().toByte()
                        x++
                    }
                }
            }
        }
        ground = Upload.texture(g.width, g.height, bytes, Pixmap.Format.RGB888)
        ground.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear)
        groundBox[0] = g.left.toFloat(); groundBox[1] = g.top.toFloat()
        groundBox[2] = 1f / (g.width * g.cell); groundBox[3] = 1f / (g.height * g.cell)
    }

    private fun bounds(pts: FloatArray, out: FloatArray) {
        out[0] = Float.MAX_VALUE; out[1] = Float.MAX_VALUE; out[2] = -Float.MAX_VALUE; out[3] = -Float.MAX_VALUE
        var i = 0
        while (i < pts.size) {
            out[0] = min(out[0], pts[i]); out[1] = min(out[1], pts[i + 1]); out[2] = max(out[2], pts[i]); out[3] = max(out[3], pts[i + 1])
            i += 2
        }
    }

    fun resize(w: Int, h: Int) {
        val x = camera.position.x
        val y = camera.position.y
        val zoom = camera.zoom
        camera.setToOrtho(false, w.toFloat(), h.toFloat())
        // setToOrtho moves the camera to the middle of the viewport: put it back where it looked.
        camera.position.set(x, y, 0f)
        camera.zoom = zoom
        maxZoom = min(worldW / w, worldH / h)
        clamp()
    }

    fun lookAt(x: Float, y: Float, zoom: Float) {
        camera.position.set(x, y, 0f)
        camera.zoom = zoom
        clamp()
    }

    fun lookAtRegion(r: Int, zoom: Float) = lookAt(cityX[r], cityY[r], zoom)

    fun clamp() {
        camera.zoom = camera.zoom.coerceIn(minZoom, maxZoom)
        val halfW = camera.viewportWidth * camera.zoom / 2
        val halfH = camera.viewportHeight * camera.zoom / 2
        camera.position.x = if (halfW * 2 >= worldW) worldW / 2 else camera.position.x.coerceIn(halfW, worldW - halfW)
        camera.position.y = if (halfH * 2 >= worldH) worldH / 2 else camera.position.y.coerceIn(halfH, worldH - halfH)
        camera.update()
    }

    fun pan(dxPixels: Float, dyPixels: Float) {
        camera.position.x -= dxPixels * camera.zoom
        camera.position.y += dyPixels * camera.zoom
        clamp()
    }

    /** Zoom by [factor] keeping the world point under the screen point (sx, sy) where it is. */
    fun zoomAt(factor: Float, sx: Float, sy: Float) {
        tmp.set(sx, sy, 0f); camera.unproject(tmp)
        val wx = tmp.x; val wy = tmp.y
        camera.zoom = (camera.zoom * factor).coerceIn(minZoom, maxZoom)
        camera.update()
        tmp.set(sx, sy, 0f); camera.unproject(tmp)
        camera.position.x += wx - tmp.x
        camera.position.y += wy - tmp.y
        clamp()
    }

    /** Screen pixels (y down, as touches come) to the region there, or -1 for the sea. */
    fun regionAt(sx: Float, sy: Float): Int {
        tmp.set(sx, sy, 0f); camera.unproject(tmp)
        val x = tmp.x; val y = tmp.y
        // A place too small to hit (Gibraltar, Malta) is taken by its town.
        var near = -1
        var nearest = 26f * camera.zoom
        for (i in 0 until n) if (data.regions[i].area < 2500) {
            val d = kotlin.math.hypot(cityX[i] - x, cityY[i] - y)
            if (d < nearest) { nearest = d; near = i }
        }
        if (near >= 0) return near
        for (i in 0 until n) {
            val b = box[i]
            if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue
            var v = first[i] * 3
            repeat(count[i] / 3) {
                if (inTriangle(x, y, landVertices[v], landVertices[v + 1], landVertices[v + 3], landVertices[v + 4], landVertices[v + 6], landVertices[v + 7])) return i
                v += 9
            }
        }
        return -1
    }

    private fun inTriangle(px: Float, py: Float, ax: Float, ay: Float, bx: Float, by: Float, cx: Float, cy: Float): Boolean {
        val d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by)
        val d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy)
        val d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay)
        val neg = d1 < 0 || d2 < 0 || d3 < 0
        val pos = d1 > 0 || d2 > 0 || d3 > 0
        return !(neg && pos)
    }

    fun screenX(r: Int): Float { tmp.set(cityX[r], cityY[r], 0f); camera.project(tmp); return tmp.x }
    fun screenY(r: Int): Float { tmp.set(cityX[r], cityY[r], 0f); camera.project(tmp); return tmp.y }

    private fun recolour(controller: IntArray, selected: Int) {
        var dirty = false
        for (i in 0 until n) {
            val key = controller[i] * 2 + if (i == selected) 1 else 0
            if (shown[i] == key) continue
            shown[i] = key
            dirty = true
            val c = colours[controller[i]]
            val bits = if (i == selected) Color.toFloatBits(min(1f, c.r + 0.08f), min(1f, c.g + 0.08f), min(1f, c.b + 0.08f), 0.7f)
                       else Color.toFloatBits(c.r, c.g, c.b, 0.62f)
            var v = first[i] * 3 + 2
            repeat(count[i]) { landVertices[v] = bits; v += 3 }
        }
        if (dirty) land.setVertices(landVertices)
    }

    private fun visible(b: FloatArray, x0: Float, y0: Float, x1: Float, y1: Float) = b[2] >= x0 && b[0] <= x1 && b[3] >= y0 && b[1] <= y1

    private fun line(shapes: ShapeRenderer, pts: FloatArray, width: Float) {
        var i = 0
        while (i + 3 < pts.size) {
            shapes.rectLine(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], width)
            i += 2
        }
    }

    /** The land, the water and the lines. [controller] is who holds each region. */
    fun draw(shapes: ShapeRenderer, controller: IntArray, selected: Int) {
        recolour(controller, selected)
        val gl = Gdx.gl
        gl.glClearColor(Palette.sea.r, Palette.sea.g, Palette.sea.b, 1f)
        gl.glClear(GL20.GL_COLOR_BUFFER_BIT)
        gl.glDisable(GL20.GL_BLEND)
        ground.bind(0)
        shader.bind()
        shader.setUniformMatrix("u_proj", camera.combined)
        shader.setUniformi("u_tex", 0)
        shader.setUniformf("u_ground", groundBox[0], groundBox[1], groundBox[2], groundBox[3])
        shader.setUniformf("u_flat", 0f)
        land.render(shader, GL20.GL_TRIANGLES)
        shader.setUniformf("u_flat", 1f)
        lakes.render(shader, GL20.GL_TRIANGLES)

        val zoom = camera.zoom
        val halfW = camera.viewportWidth * zoom / 2
        val halfH = camera.viewportHeight * zoom / 2
        val x0 = camera.position.x - halfW; val x1 = camera.position.x + halfW
        val y0 = camera.position.y - halfH; val y1 = camera.position.y + halfH
        gl.glEnable(GL20.GL_BLEND)
        gl.glBlendFunc(GL20.GL_SRC_ALPHA, GL20.GL_ONE_MINUS_SRC_ALPHA)
        shapes.projectionMatrix = camera.combined
        shapes.begin(ShapeRenderer.ShapeType.Filled)
        shapes.setColor(0.36f, 0.48f, 0.58f, 0.9f)
        for ((i, r) in data.map.rivers.withIndex()) {
            if (r.rank > (if (zoom < 2.5f) 6 else 3)) continue
            line(shapes, riverPts[i], zoom * if (r.rank <= 2) 2.2f else 1.4f)
        }
        for ((i, b) in data.map.borders.withIndex()) {
            if (!visible(borderBox[i], x0, y0, x1, y1)) continue
            if (selected >= 0 && (b.a == selected || b.b == selected)) {
                shapes.setColor(0.11f, 0.1f, 0.09f, 1f); line(shapes, borderPts[i], zoom * 4.2f)
                shapes.setColor(Palette.accent.r, Palette.accent.g, Palette.accent.b, 1f); line(shapes, borderPts[i], zoom * 2.2f)
                continue
            }
            when {
                b.kind == "coast" -> { shapes.setColor(0.16f, 0.2f, 0.24f, 0.8f); line(shapes, borderPts[i], zoom * 1.1f) }
                b.kind == "edge" -> continue
                controller[b.a] != controller[b.b] -> { shapes.setColor(0.09f, 0.08f, 0.07f, 0.95f); line(shapes, borderPts[i], zoom * 2.6f) }
                else -> { if (zoom > 2.4f) continue; shapes.setColor(0.12f, 0.11f, 0.1f, 0.42f); line(shapes, borderPts[i], zoom * 1.0f) }
            }
        }
        shapes.end()
    }

    /** One army on the map: a stack of one state's divisions in one region. */
    class Stack(val region: Int, val owner: Int, var n: Int = 0, var strength: Float = 0f, var size: Float = 0f, var moving: Boolean = false) {
        val types = IntArray(UnitType.entries.size)
        val main: UnitType get() = UnitType.entries[types.indices.maxByOrNull { types[it] } ?: 0]
    }

    /** Towns, names and the armies, drawn in screen pixels over the map. */
    private var ownTag = -1

    fun drawOver(ui: Ui, game: Game, player: Int, selected: Int) {
        ownTag = player
        val zoom = camera.zoom
        val world = game.world
        val dp = ui.dp
        val w = ui.width; val h = ui.height
        // Orders: where the player's marching divisions are going.
        ui.shapes.setColor(Palette.accent.r, Palette.accent.g, Palette.accent.b, 0.9f)
        val drawn = HashSet<Long>()
        val labels = ArrayList<FloatArray>()
        // First where the armies' signs will stand, so that no name is written under one.
        for (r in 0 until n) {
            val here = game.divisionsIn(r)
            if (here.isEmpty()) continue
            val sx = screenX(r); val sy = screenY(r)
            if (sx < -60 * dp || sx > w + 60 * dp || sy < -60 * dp || sy > h + 60 * dp) continue
            val owners = minOf(3, here.map { it.owner }.distinct().size)
            val half = when { zoom > 4.6f -> 8f * dp; zoom > 1.15f -> owners * 13f * dp; else -> owners * 21f * dp }
            labels.add(floatArrayOf(sx - half, sy + 4 * dp, sx + half, sy + (if (zoom > 1.15f) 28f else 38f) * dp))
        }
        for (d in world.divisions) {
            if (d.owner != player || d.path.isEmpty()) continue
            val to = d.path[0]
            if (!drawn.add(d.region.toLong() * 1000 + to)) continue
            arrow(ui, screenX(d.region), screenY(d.region), screenX(to), screenY(to), 3f * dp)
        }
        for (r in 0 until n) {
            val sx = screenX(r); val sy = screenY(r)
            if (sx < -60 * dp || sx > w + 60 * dp || sy < -60 * dp || sy > h + 60 * dp) continue
            val capital = data.capital.indexOf(r) >= 0
            // The town.
            if (zoom < 4.5f || capital) {
                val s = (if (capital) 4.5f else 3f) * dp
                ui.rect(sx - s, sy - s, s * 2, s * 2, Palette.line)
                ui.rect(sx - s + dp, sy - s + dp, s * 2 - 2 * dp, s * 2 - 2 * dp, if (capital) Palette.accent else Palette.paper)
            }
            if (world.battleDay[r] >= world.day - 1) burst(ui, sx, sy + 16 * dp, 9f * dp)
            if (zoom < 1.7f || (capital && zoom < 3.2f)) {
                // A name is written only where no name stands yet: two names on top of each other read as neither.
                val half = ui.textWidth(data.regions[r].name, 0.7f) / 2 + 3 * dp
                val box = floatArrayOf(sx - half, sy - 9 * dp - ui.lineHeight(0.7f), sx + half, sy - 5 * dp)
                if (labels.none { it[0] < box[2] && box[0] < it[2] && it[1] < box[3] && box[1] < it[3] }) {
                    labels.add(box)
                    ui.text(data.regions[r].name, sx - 100 * dp, sy - 7 * dp, Color(Palette.line).apply { a = 0.8f }, 0.7f, com.badlogic.gdx.utils.Align.center, 200 * dp)
                }
            }
            val here = game.divisionsIn(r)
            if (here.isEmpty()) continue
            if (zoom > 4.6f) {
                // From far off an army is a dot in its colour.
                val c = colours[here[0].owner]
                val s = min(7f, 2.5f + here.size * 0.35f) * dp
                ui.rect(sx - s - dp, sy + 6 * dp - dp, 2 * s + 2 * dp, 2 * s + 2 * dp, Palette.line)
                ui.rect(sx - s, sy + 6 * dp, 2 * s, 2 * s, c)
                continue
            }
            val stacks = stacksOf(here, player)
            if (zoom > 1.15f) {
                // From the middle distance: a small tag in the state's colour with the number of divisions.
                val cw = 24f * dp; val ch = 17f * dp
                var x = sx - (stacks.size * (cw + 2 * dp) - 2 * dp) / 2
                for (s in stacks) {
                    val own = s.owner == player
                    val c = if (own) Palette.ink else colours[s.owner]
                    ui.rect(x - dp, sy + 7 * dp - dp, cw + 2 * dp, ch + 2 * dp, if (r == selected && own) Palette.accent else Palette.line)
                    ui.rect(x, sy + 7 * dp, cw, ch, c)
                    if (own) ui.rect(x, sy + 7 * dp, 4 * dp, ch, colours[s.owner])
                    val ink = if (c.r * 0.3f + c.g * 0.59f + c.b * 0.11f > 0.55f) Palette.line else Palette.ink
                    ui.text(s.n.toString(), x, sy + 7 * dp + ch / 2 + ui.mid(0.8f), ink, 0.8f, com.badlogic.gdx.utils.Align.center, cw)
                    x += cw + 2 * dp
                }
                continue
            }
            val cw = 38f * dp; val ch = 26f * dp
            var x = sx - (stacks.size * (cw + 3 * dp) - 3 * dp) / 2
            for (s in stacks) {
                counter(ui, x, sy + 9 * dp, cw, ch, s, r == selected && s.owner == player)
                x += cw + 3 * dp
            }
        }
    }

    private fun stacksOf(here: List<Division>, player: Int): List<Stack> {
        val stacks = ArrayList<Stack>()
        for (d in here) {
            val s = stacks.firstOrNull { it.owner == d.owner } ?: Stack(d.region, d.owner).also { stacks.add(it) }
            s.n++; s.strength += d.strength.toFloat(); s.size += d.size.toFloat(); s.types[d.type.ordinal]++
            if (d.moving) s.moving = true
        }
        stacks.sortBy { if (it.owner == player) -1 else it.owner }
        return stacks.take(3)
    }

    /** A military map symbol: a box in the state's colour, the sign of its arm, how many, and how whole they are. */
    private fun counter(ui: Ui, x: Float, y: Float, w: Float, h: Float, s: Stack, hot: Boolean) {
        val dp = ui.dp
        // The player's own armies are paper with a band of his colour: light is mine, wherever it stands.
        val c = if (s.owner == ownTag) Palette.ink else colours[s.owner]
        ui.rect(x - dp, y - dp, w + 2 * dp, h + 2 * dp, if (hot) Palette.accent else Palette.line)
        ui.rect(x, y, w, h, c)
        if (s.owner == ownTag) ui.rect(x, y, 3 * dp, h, colours[s.owner])
        val ink = if (c.r * 0.3f + c.g * 0.59f + c.b * 0.11f > 0.55f) Palette.line else Palette.ink
        ui.shapes.color = ink
        val bx = x + 3 * dp; val by = y + 8 * dp; val bw = w * 0.52f; val bh = h - 11 * dp
        val t = 1.4f * dp
        // the frame of the sign
        ui.shapes.rectLine(bx, by, bx + bw, by, t); ui.shapes.rectLine(bx, by + bh, bx + bw, by + bh, t)
        ui.shapes.rectLine(bx, by, bx, by + bh, t); ui.shapes.rectLine(bx + bw, by, bx + bw, by + bh, t)
        when (s.main) {
            UnitType.INF -> { ui.shapes.rectLine(bx, by, bx + bw, by + bh, t); ui.shapes.rectLine(bx, by + bh, bx + bw, by, t) }
            UnitType.ARM -> ellipse(ui, bx + bw / 2, by + bh / 2, bw * 0.34f, bh * 0.28f, t)
            UnitType.MOT -> { ui.shapes.rectLine(bx, by, bx + bw, by + bh, t); ui.shapes.rectLine(bx, by + bh, bx + bw, by, t); ellipse(ui, bx + bw / 2, by + bh / 2, bw * 0.34f, bh * 0.28f, t) }
            UnitType.CAV -> ui.shapes.rectLine(bx, by, bx + bw, by + bh, t)
            UnitType.MTN -> { ui.shapes.rectLine(bx, by, bx + bw, by + bh, t); ui.shapes.rectLine(bx, by + bh, bx + bw, by, t); ui.shapes.triangle(bx + bw / 2 - 3 * dp, by, bx + bw / 2 + 3 * dp, by, bx + bw / 2, by + 5 * dp) }
            UnitType.GAR -> { ui.shapes.rectLine(bx, by, bx + bw, by + bh, t); ui.shapes.rectLine(bx, by + bh, bx + bw, by, t); ui.shapes.rect(bx, by, bw, 3 * dp) }
        }
        // how whole: a bar under the sign
        val whole = if (s.size > 0) (s.strength / s.size).coerceIn(0f, 1f) else 0f
        ui.rect(x + 2 * dp, y + 2 * dp, w - 4 * dp, 3 * dp, Palette.line)
        ui.rect(x + 2 * dp, y + 2 * dp, (w - 4 * dp) * whole, 3 * dp, if (whole > 0.6f) Palette.good else if (whole > 0.35f) Palette.accent else Palette.bad)
        ui.text(s.n.toString(), bx + bw, y + h - 5 * dp, ink, 1f, com.badlogic.gdx.utils.Align.center, w - bw - 3 * dp)
    }

    private fun ellipse(ui: Ui, cx: Float, cy: Float, rx: Float, ry: Float, t: Float) {
        var px = cx + rx; var py = cy
        for (i in 1..12) {
            val a = i * (Math.PI * 2 / 12)
            val x = cx + rx * kotlin.math.cos(a).toFloat(); val y = cy + ry * kotlin.math.sin(a).toFloat()
            ui.shapes.rectLine(px, py, x, y, t)
            px = x; py = y
        }
    }

    private fun arrow(ui: Ui, x0: Float, y0: Float, x1: Float, y1: Float, t: Float) {
        val dx = x1 - x0; val dy = y1 - y0
        val len = kotlin.math.hypot(dx, dy)
        if (len < 4f) return
        val ux = dx / len; val uy = dy / len
        val ex = x1 - ux * 4 * t; val ey = y1 - uy * 4 * t
        ui.shapes.rectLine(x0, y0, ex, ey, t)
        ui.shapes.triangle(x1, y1, ex - uy * 2.2f * t, ey + ux * 2.2f * t, ex + uy * 2.2f * t, ey - ux * 2.2f * t)
    }

    /** Where a battle is being fought: a small burst. */
    private fun burst(ui: Ui, x: Float, y: Float, r: Float) {
        ui.shapes.setColor(Palette.bad.r, Palette.bad.g, Palette.bad.b, 0.95f)
        for (i in 0 until 4) {
            val a = i * (Math.PI / 4)
            val dx = r * kotlin.math.cos(a).toFloat(); val dy = r * kotlin.math.sin(a).toFloat()
            ui.shapes.rectLine(x - dx, y - dy, x + dx, y + dy, r * 0.28f)
        }
    }

    fun dispose() {
        land.dispose(); lakes.dispose(); shader.dispose(); ground.dispose()
    }

    private companion object {
        const val VERTEX = """
            attribute vec2 a_position;
            attribute vec4 a_color;
            uniform mat4 u_proj;
            uniform vec4 u_ground;
            varying vec4 v_color;
            varying vec2 v_uv;
            void main() {
                v_color = a_color;
                v_uv = vec2((a_position.x - u_ground.x) * u_ground.z, (u_ground.y - a_position.y) * u_ground.w);
                gl_Position = u_proj * vec4(a_position, 0.0, 1.0);
            }
        """
        const val FRAGMENT = """
            #ifdef GL_ES
            precision mediump float;
            #endif
            uniform sampler2D u_tex;
            uniform float u_flat;
            varying vec4 v_color;
            varying vec2 v_uv;
            void main() {
                vec3 ground = texture2D(u_tex, v_uv).rgb;
                gl_FragColor = vec4(mix(mix(ground, v_color.rgb, v_color.a), v_color.rgb, u_flat), 1.0);
            }
        """
    }
}

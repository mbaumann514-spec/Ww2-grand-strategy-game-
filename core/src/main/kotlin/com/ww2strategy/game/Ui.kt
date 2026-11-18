package com.ww2strategy.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.g2d.BitmapFont
import com.badlogic.gdx.graphics.g2d.GlyphLayout
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.Align
import com.ww2strategy.sim.DataSource
import com.ww2strategy.sim.GameJson
import com.ww2strategy.sim.stripComments
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/** The colours of the whole game: a staff map on a table. One palette, fixed roles. */
object Palette {
    val sea = Color.valueOf("8fa9b8")
    val paper = Color.valueOf("e9e1cc")
    val panel = Color.valueOf("2b2f33")
    val panelLight = Color.valueOf("3a4046")
    val line = Color.valueOf("1c1a17")
    val ink = Color.valueOf("efe9da")
    val dim = Color.valueOf("a9a497")
    val accent = Color.valueOf("d9b45a")
    val good = Color.valueOf("9ecb7a")
    val bad = Color.valueOf("e07a5f")
    val button = Color.valueOf("4a525a")
    val buttonHot = Color.valueOf("6b5a2e")
}

/** Every word the game shows, by key, in the player's language; English where the language has none. */
object Texts {
    var language = "en"
        private set
    private var english: Map<String, String> = emptyMap()
    private var current: Map<String, String> = emptyMap()

    private fun read(source: DataSource, code: String): Map<String, String> =
        stripComments(GameJson.parseToJsonElement(source.read("data/text/$code.json"))).jsonObject.mapValues { it.value.jsonPrimitive.content }

    fun load(source: DataSource, code: String) {
        english = read(source, "en")
        language = if (code == "de") "de" else "en"
        current = if (language == "en") english else read(source, language)
    }

    fun has(key: String): Boolean = key in current || key in english

    fun t(key: String, vararg args: Any): String {
        var text = current[key] ?: english[key] ?: key
        for ((i, arg) in args.withIndex()) text = text.replace("{$i}", arg.toString())
        return text
    }
}

/**
 * The interface, drawn each frame from scratch: rectangles first, then words, a layer at a time.
 * Every button says where it is, so a tap can be given to it, the harness can press it by name,
 * and the checks can see whether two overlap or one is too small for a finger.
 */
class Ui {
    val shapes = ShapeRenderer()
    val batch = SpriteBatch()
    val font: BitmapFont = PixelFont.text()
    private val layout = GlyphLayout()
    private val screen = Matrix4()

    /** Screen pixels to one dp, and to one pixel of the font. */
    var dp = 1f
        private set
    var textScale = 1f
        private set
    var width = 0f
        private set
    var height = 0f
        private set

    class Target(val id: String, val x: Float, val y: Float, val w: Float, val h: Float, val live: Boolean = true)
    class Hold(val x: Float, val y: Float, val w: Float, val h: Float, val text: String)

    val targets = ArrayList<Target>()
    val holds = ArrayList<Hold>()
    private val words = ArrayList<() -> Unit>()

    /** While true, buttons are drawn but do not answer: something lies over them. */
    var inert = false

    /** Half the height of a capital letter: add it to a middle to set a line's top so the line sits centred. */
    fun mid(scale: Float = 1f): Float = 5f * textScale * scale

    fun paragraphHeight(text: String, width: Float, scale: Float = 1f): Float {
        font.data.setScale(textScale * scale)
        layout.setText(font, text, Palette.ink, width, Align.left, true)
        return layout.height + lineHeight(scale) * 0.3f
    }

    /** A tap waiting to be given to a button: screen pixels, y up. Negative: none. */
    var tapX = -1f
    var tapY = -1f

    fun resize(w: Int, h: Int, density: Float) {
        width = w.toFloat()
        height = h.toFloat()
        dp = density
        textScale = PixelFont.scaleFor(density, minOf(width, height))
        screen.setToOrtho2D(0f, 0f, width, height)
    }

    fun begin() {
        targets.clear()
        holds.clear()
        shapes.projectionMatrix = screen
        batch.projectionMatrix = screen
        Gdx.gl.glEnable(GL20.GL_BLEND)
        Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA, GL20.GL_ONE_MINUS_SRC_ALPHA)
        shapes.begin(ShapeRenderer.ShapeType.Filled)
    }

    /** Ends a layer: what was drawn so far lies under what comes next. */
    fun flush() {
        shapes.end()
        batch.begin()
        for (word in words) word()
        batch.end()
        words.clear()
        Gdx.gl.glEnable(GL20.GL_BLEND)
        shapes.begin(ShapeRenderer.ShapeType.Filled)
    }

    fun end() {
        flush()
        shapes.end()
    }

    fun rect(x: Float, y: Float, w: Float, h: Float, colour: Color, alpha: Float = 1f) {
        shapes.setColor(colour.r, colour.g, colour.b, colour.a * alpha)
        shapes.rect(x, y, w, h)
    }

    fun frame(x: Float, y: Float, w: Float, h: Float, colour: Color, thick: Float = dp) {
        rect(x, y, w, thick, colour); rect(x, y + h - thick, w, thick, colour)
        rect(x, y, thick, h, colour); rect(x + w - thick, y, thick, h, colour)
    }

    fun panel(x: Float, y: Float, w: Float, h: Float) {
        rect(x, y, w, h, Palette.panel)
        frame(x, y, w, h, Palette.accent, dp)
    }

    fun textWidth(text: String, scale: Float = 1f): Float {
        font.data.setScale(textScale * scale)
        layout.setText(font, text)
        return layout.width
    }

    fun lineHeight(scale: Float = 1f): Float = font.data.lineHeight / font.data.scaleY * textScale * scale

    /** One line, its top at [top]. */
    fun text(text: String, x: Float, top: Float, colour: Color = Palette.ink, scale: Float = 1f, align: Int = Align.left, width: Float = 0f) {
        val copy = Color(colour)
        words.add {
            font.data.setScale(textScale * scale)
            font.color = copy
            font.draw(batch, text, x, top, width, align, false)
        }
    }

    /** Wrapped text; returns its height. */
    fun paragraph(text: String, x: Float, top: Float, width: Float, colour: Color = Palette.ink, scale: Float = 1f): Float {
        font.data.setScale(textScale * scale)
        layout.setText(font, text, colour, width, Align.left, true)
        val height = layout.height + lineHeight(scale) * 0.3f
        val copy = Color(colour)
        words.add {
            font.data.setScale(textScale * scale)
            font.color = copy
            font.draw(batch, text, x, top, width, Align.left, true)
        }
        return height
    }

    fun inside(px: Float, py: Float, x: Float, y: Float, w: Float, h: Float) = px >= x && px <= x + w && py >= y && py <= y + h

    /** A place a finger held down gets a sentence for. */
    fun hold(x: Float, y: Float, w: Float, h: Float, key: String) {
        holds.add(Hold(x, y, w, h, Texts.t(key)))
    }

    fun holdText(x: Float, y: Float, w: Float, h: Float, text: String) {
        holds.add(Hold(x, y, w, h, text))
    }

    /** A button. True when it was tapped this frame. */
    fun button(id: String, x: Float, y: Float, w: Float, h: Float, label: String, hot: Boolean = false, enabled: Boolean = true, scale: Float = 1f): Boolean {
        targets.add(Target(id, x, y, w, h, enabled && !inert))
        rect(x, y, w, h, if (hot) Palette.buttonHot else Palette.button, if (enabled) 1f else 0.5f)
        frame(x, y, w, h, if (hot) Palette.accent else Palette.line)
        if (label.isNotEmpty()) {
            text(label, x, y + h / 2 + mid(scale), if (enabled) Palette.ink else Palette.dim, scale, Align.center, w)
        }
        if (enabled && !inert && tapX >= 0 && inside(tapX, tapY, x, y, w, h)) {
            tapX = -1f
            return true
        }
        return false
    }

    /** Swallows a tap that fell on a panel, so it does not reach the map under it. */
    fun block(x: Float, y: Float, w: Float, h: Float) {
        if (!inert && tapX >= 0 && inside(tapX, tapY, x, y, w, h)) tapX = -1f
    }

    fun dispose() {
        shapes.dispose()
        batch.dispose()
        font.dispose()
    }
}

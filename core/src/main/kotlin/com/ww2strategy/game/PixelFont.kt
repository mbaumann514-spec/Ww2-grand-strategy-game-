package com.ww2strategy.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.BitmapFont
import com.badlogic.gdx.graphics.g2d.TextureRegion
import kotlin.math.roundToInt

/**
 * The game's two typefaces, baked from rows of pixels at start-up (Paket d1).
 *
 * The rows come from [SchriftGlyphen], which `tools/schrift.mjs` writes from
 * two OFL pixel fonts: Jersey 10 for the text, Jacquard 12, a pixel
 * blackletter, for the headings. They replace libGDX's built-in face, a
 * 15-pixel Arial that had no en dash, no curly quote and no ellipsis
 * (`CLAUDE.md` §8), and that a phone could only enlarge by smearing it.
 *
 * A pixel font is drawn at a whole number of screen pixels to one of its own,
 * with nearest filtering, or it is not a pixel font any more: [scaleFor]
 * picks that number from the density.
 */
internal object PixelFont {

    /** One glyph as the generator wrote it. */
    class Glyph(val code: Int, val advance: Int, val left: Int, val top: Int, val rows: List<String>) {
        val width: Int get() = rows.maxOfOrNull { it.length } ?: 0
        val height: Int get() = rows.size
    }

    fun parse(entries: Array<String>): List<Glyph> = entries.map { entry ->
        val parts = entry.split(' ', limit = 5)
        Glyph(
            code = parts[0].toInt(),
            advance = parts[1].toInt(),
            left = parts[2].toInt(),
            top = parts[3].toInt(),
            rows = parts.getOrNull(4)?.takeIf { it.isNotEmpty() }?.split('/') ?: emptyList(),
        )
    }

    /** Where each inked glyph goes in its atlas. Pure, for the test. */
    fun layout(glyphs: List<Glyph>): AtlasLayout.Packed {
        val inked = glyphs.filter { it.height > 0 }
        return AtlasLayout.pack(inked.map { it.width }, inked.map { it.height }, gap = 1)
    }

    /**
     * Screen pixels to one pixel of the font: one on a desk, three on a phone
     * of 420 dpi. A little above the density, because Jersey's capitals are
     * ten pixels and a line of text on a phone wants to be eleven dp or so.
     */
    fun scaleFor(density: Float): Float = maxOf(1, (density * 1.1f).roundToInt()).toFloat()

    /**
     * The same, and never so large that the screen's short side holds fewer
     * than [LINE_PIXELS] pixels of the font: the outer screen of a folding
     * phone, 904 pixels at 402 dpi, rounded up to three and set its text a
     * fifth larger to the dp than any other phone 360 dp wide, and the date
     * stood under the page's cross, the tabs shrank under a finger and lines
     * were cut short on five pages (B168, 22 October 2026).
     */
    fun scaleFor(density: Float, shortSide: Float): Float =
        minOf(scaleFor(density), maxOf(1f, kotlin.math.floor(shortSide / LINE_PIXELS)))

    /** Pixels of the font across the short side of a phone 360 dp wide, at two and at three to the pixel. */
    const val LINE_PIXELS = 360f

    /**
     * The headings' pixels: about half as large again as the text's, and
     * never the same, because Jacquard's small letters are no taller than
     * Jersey's and a heading at the text's size reads as smaller than it.
     */
    fun headingScaleFor(density: Float): Float = headingScaleOver(scaleFor(density))

    /** The headings' pixels over a text set [text] screen pixels to its pixel. */
    fun headingScaleOver(text: Float): Float = maxOf(text + 1f, (text * 1.4f).roundToInt().toFloat())

    fun text(): BitmapFont = bake(parse(SchriftGlyphen.TEXT))

    fun heading(): BitmapFont = bake(parse(SchriftGlyphen.HEADING))

    /**
     * An atlas and a [BitmapFont.BitmapFontData] filled by hand, in the
     * terms libGDX's own loader uses: [BitmapFont.Glyph.yoffset] is
     * `-(height + distance from the line's top to the glyph's top)`.
     */
    fun bake(glyphs: List<Glyph>): BitmapFont {
        val inked = glyphs.filter { it.height > 0 }
        val packed = layout(glyphs)
        val pixmap = PixelBuffer(packed.width, packed.height)
        pixmap.blending = false
        pixmap.setColor(Color.CLEAR)
        pixmap.fill()
        for ((index, glyph) in inked.withIndex()) {
            for ((y, row) in glyph.rows.withIndex()) {
                for ((x, cell) in row.withIndex()) {
                    if (cell == '#') pixmap.drawPixel(packed.x[index] + x, packed.y[index] + y, -1)
                }
            }
        }
        val texture = pixmap.texture()
        texture.setFilter(Texture.TextureFilter.Nearest, Texture.TextureFilter.Nearest)
        pixmap.dispose()

        /*
         * The line: from the top of an accented capital to the foot of a
         * "g", and two pixels between lines. Not from the tallest glyph to
         * the deepest: the fonts' own extremes (a ring over an A, a comma
         * under a Latvian K) gave a line twice the capitals, and a panel of
         * loose, gappy text. A rare mark that reaches past it touches the
         * next line's ascenders, as it does in print.
         */
        fun glyph(c: Char) = glyphs.firstOrNull { it.code == c.code }
        val above = glyph('Ä')?.top ?: inked.maxOf { it.top }
        val below = glyph('g')?.let { it.height - it.top } ?: 0
        val data = BitmapFont.BitmapFontData()
        data.lineHeight = (above + below + 2).toFloat()
        val baseLine = above
        val positions = inked.withIndex().associate { (index, glyph) -> glyph.code to index }
        for (glyph in glyphs) {
            val entry = BitmapFont.Glyph()
            entry.id = glyph.code
            entry.xadvance = glyph.advance
            entry.xoffset = glyph.left
            val at = positions[glyph.code]
            if (at != null) {
                entry.srcX = packed.x[at]
                entry.srcY = packed.y[at]
                entry.width = glyph.width
                entry.height = glyph.height
                entry.yoffset = -(glyph.height + (baseLine - glyph.top))
            }
            data.setGlyph(glyph.code, entry)
        }
        val space = glyphs.firstOrNull { it.code == ' '.code }
        data.spaceXadvance = (space?.advance ?: 4).toFloat()
        data.xHeight = (glyphs.firstOrNull { it.code == 'x'.code }?.height ?: 1).toFloat()
        data.capHeight = (glyphs.firstOrNull { it.code == 'H'.code }?.height ?: above).toFloat()
        data.ascent = baseLine - data.capHeight
        data.descent = -below.toFloat()
        data.down = -data.lineHeight
        /*
         * The font owns its atlas, so disposing the font lets the atlas go.
         * Built from a region, a BitmapFont does not; four faces made for each
         * campaign (the near names, the hosts', the markets', the research
         * page's small years) stayed on the GPU after it was left, and
         * `--cycle` counted four more textures for every campaign begun.
         */
        return ShadowFont(data, TextureRegion(texture)).apply { setOwnsTexture(true) }
    }
}

/**
 * A face whose every line of text throws a very light shadow, one of its own
 * pixels down and to the right (the author, 27 September 2026: "gib Schrift
 * und allen Rahmen einen ganz leichten Schatten"). Drawn by the font itself,
 * so every word in the game has it without a call site knowing.
 */
internal class ShadowFont(data: BitmapFontData, region: TextureRegion) : BitmapFont(data, region, true) {
    private val shade = Color()

    /**
     * Off for a repeated draw that is already its own outline -- the eight-way
     * halo under a map name -- so that outline does not pick up a shadow of
     * its own eight times over and turn into a muddy smear under the ink.
     * See [noShadow].
     */
    var shadowEnabled = true

    private fun shadow(batch: com.badlogic.gdx.graphics.g2d.Batch, place: (com.badlogic.gdx.graphics.g2d.BitmapFontCache, Float) -> Unit) {
        if (!shadowEnabled) return
        val step = kotlin.math.max(1f, kotlin.math.round(data.scaleX))
        shade.set(0.04f, 0.02f, 0.01f, SHADOW * color.a)
        val cache = getCache()
        cache.clear()
        place(cache, step)
        cache.tint(shade)
        cache.draw(batch)
        cache.clear()
    }

    override fun draw(batch: com.badlogic.gdx.graphics.g2d.Batch, str: CharSequence, x: Float, y: Float): com.badlogic.gdx.graphics.g2d.GlyphLayout {
        shadow(batch) { cache, step -> cache.addText(str, x + step, y - step) }
        return super.draw(batch, str, x, y)
    }

    override fun draw(
        batch: com.badlogic.gdx.graphics.g2d.Batch, str: CharSequence, x: Float, y: Float,
        targetWidth: Float, halign: Int, wrap: Boolean,
    ): com.badlogic.gdx.graphics.g2d.GlyphLayout {
        shadow(batch) { cache, step -> cache.addText(str, x + step, y - step, targetWidth, halign, wrap) }
        return super.draw(batch, str, x, y, targetWidth, halign, wrap)
    }

    override fun draw(batch: com.badlogic.gdx.graphics.g2d.Batch, layout: com.badlogic.gdx.graphics.g2d.GlyphLayout, x: Float, y: Float) {
        shadow(batch) { cache, step -> cache.addText(layout, x + step, y - step) }
        super.draw(batch, layout, x, y)
    }

    private companion object {
        /** How dark the shadow is, against the text's own opacity. */
        const val SHADOW = 0.45f
    }
}

/**
 * Draw a repeated outline pass -- a halo of the same string offset a pixel
 * out in every direction -- without each of those repeats throwing its own
 * light shadow, which would stack into a smear under the ink. A plain
 * [BitmapFont] has no shadow to turn off and runs [block] as it is.
 */
internal fun BitmapFont.noShadow(block: () -> Unit) {
    val shadowed = this as? ShadowFont
    if (shadowed == null) { block(); return }
    shadowed.shadowEnabled = false
    try { block() } finally { shadowed.shadowEnabled = true }
}

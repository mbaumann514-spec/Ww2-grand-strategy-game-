package com.ww2strategy.game

/**
 * Where each plate goes in an atlas, packed in shelves no wider than
 * [MAX_EDGE].
 *
 * Paket c2. Every atlas in this game is drawn in code at start-up (`CLAUDE.md`
 * §2: not one image file), and each of them used to be a single row of plates
 * packed left to right. A row has no natural limit and GL does: a texture
 * wider than `GL_MAX_TEXTURE_SIZE` fails at upload, on the device, in a way a
 * desktop with a limit of 16k never shows. The battle atlas had reached 11,520
 * pixels. 2048 is the edge every phone the game supports can be counted on
 * for, so that is the limit, and `AtlasLayoutTest` holds every atlas to it.
 *
 * Shelves rather than anything cleverer: the plates of one atlas are nearly
 * all one height, the order they are listed in is kept, and a packing a
 * reader can follow in his head is worth more than a few rows of texture.
 *
 * Pure arithmetic, so the test needs no graphics card.
 */
object AtlasLayout {
    /** The widest and tallest any atlas may be. */
    const val MAX_EDGE = 2048

    /** Positions, in the order the plates were given, and the atlas's size. */
    class Packed(val x: IntArray, val y: IntArray, val width: Int, val height: Int)

    /**
     * Shelves, left to right and then downward, with [gap] clear pixels
     * between neighbours: a region sampled at its own edge picks up whatever
     * is next to it once the batch scales it.
     */
    fun pack(widths: List<Int>, heights: List<Int>, gap: Int = 1, maxEdge: Int = MAX_EDGE): Packed {
        require(widths.size == heights.size) { "${widths.size} widths for ${heights.size} heights" }
        val xs = IntArray(widths.size)
        val ys = IntArray(widths.size)
        var penX = 0
        var shelfY = 0
        var shelfHeight = 0
        var widest = 0
        for (i in widths.indices) {
            val w = widths[i]
            val h = heights[i]
            require(w <= maxEdge && h <= maxEdge) { "a plate of ${w}x$h is larger than an atlas of $maxEdge" }
            if (penX > 0 && penX + w > maxEdge) {
                shelfY += shelfHeight + gap
                penX = 0
                shelfHeight = 0
            }
            xs[i] = penX
            ys[i] = shelfY
            widest = maxOf(widest, penX + w)
            shelfHeight = maxOf(shelfHeight, h)
            penX += w + gap
        }
        return Packed(xs, ys, maxOf(widest, 1), maxOf(shelfY + shelfHeight, 1))
    }
}

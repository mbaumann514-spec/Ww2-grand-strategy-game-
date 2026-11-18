package com.ww2strategy.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture

/**
 * Pixels drawn in memory and handed to a pixmap in one piece (B15).
 *
 * Every picture in this game is drawn in code, pixel by pixel. On the desktop
 * a pixmap's setColor and drawPixel are cheap; in the browser build every one
 * of those calls crosses into WebAssembly, and the map's textures alone --
 * some ten million pixels -- kept the page frozen for minutes. So the heavy
 * painters draw into this plain array and copy it over once. The bytes are
 * laid out as libGDX's own gdx2d lays them out, so the picture is the same to
 * the pixel on every platform.
 */
internal class PixelBuffer(val width: Int, val height: Int) {

    /** RGBA8888, as [Color.rgba8888] packs it; 0 is clear. */
    val rgba = IntArray(width * height)

    fun set(x: Int, y: Int, r: Float, g: Float, b: Float, a: Float) {
        rgba[y * width + x] = Color.rgba8888(r, g, b, a)
    }

    fun set(x: Int, y: Int, value: Int) {
        rgba[y * width + x] = value
    }

    fun get(x: Int, y: Int): Int = rgba[y * width + x]

    /**
     * Whether a drawn pixel is laid over what is there, as a pixmap's
     * SourceOver, or replaces it, as its None. Off by default here, where a
     * pixmap has it on: most painters turned it off, and the few that did
     * not say so.
     */
    var blending = false

    /** As a pixmap's drawPixel: out of bounds is ignored. */
    fun drawPixel(x: Int, y: Int, value: Int) {
        if (x < 0 || y < 0 || x >= width || y >= height) return
        val at = y * width + x
        rgba[at] = if (blending) blend(value, rgba[at]) else value
    }

    /** As a pixmap's getPixel: out of bounds reads clear. */
    fun getPixel(x: Int, y: Int): Int =
        if (x < 0 || y < 0 || x >= width || y >= height) 0 else rgba[y * width + x]

    /*
     * A pixmap's own drawing calls, so a painter written against a pixmap
     * changes one line to use this instead. Each pixel is drawn once over a
     * clear ground in every painter here, where blending and overwriting
     * give the same result.
     */
    private var colour = 0

    fun setColor(r: Float, g: Float, b: Float, a: Float) {
        colour = Color.rgba8888(r, g, b, a)
    }

    fun setColor(c: Color) {
        colour = Color.rgba8888(c)
    }

    fun setColor(value: Int) {
        colour = value
    }

    fun drawPixel(x: Int, y: Int) = drawPixel(x, y, colour)

    fun fill() = rgba.fill(colour)

    fun fillRectangle(x: Int, y: Int, w: Int, h: Int) {
        for (row in maxOf(0, y) until minOf(height, y + h)) {
            for (column in maxOf(0, x) until minOf(width, x + w)) drawPixel(column, row, colour)
        }
    }

    /** libGDX's own source-over, from gdx2d.c, integer for integer, so a blended picture is the same to the pixel. */
    private fun blend(src: Int, dst: Int): Int {
        val srcA = src and 0xff
        if (srcA == 0) return dst
        val srcB = (src ushr 8) and 0xff
        val srcG = (src ushr 16) and 0xff
        val srcR = (src ushr 24) and 0xff
        var dstA = dst and 0xff
        var dstB = (dst ushr 8) and 0xff
        var dstG = (dst ushr 16) and 0xff
        var dstR = (dst ushr 24) and 0xff
        dstA -= (dstA * srcA) / 255
        val a = dstA + srcA
        dstR = (dstR * dstA + srcR * srcA) / a
        dstG = (dstG * dstA + srcG * srcA) / a
        dstB = (dstB * dstA + srcB * srcA) / a
        return (dstR shl 24) or (dstG shl 16) or (dstB shl 8) or a
    }

    /** Nothing to free: the array is garbage like any other. Here so a pixmap's dispose() reads the same. */
    fun dispose() {}

    /**
     * A texture of these pixels, in [format] (RGBA8888, RGB888 or RGBA4444):
     * through a pixmap where there are pixmaps, straight to GL in the
     * browser ([Upload]), where a four-bit texture is widened to eight.
     */
    fun texture(format: Pixmap.Format = Pixmap.Format.RGBA8888): Texture {
        val wanted = if (format == Pixmap.Format.RGBA4444 && Upload.widenFourBit) Pixmap.Format.RGBA8888 else format
        return Upload.texture(width, height, bytes(wanted), wanted)
    }

    /** A new pixmap holding these pixels, in [format] (RGBA8888, RGB888 or RGBA4444). */
    fun toPixmap(format: Pixmap.Format = Pixmap.Format.RGBA8888): Pixmap {
        val pixmap = Pixmap(width, height, format)
        pixmap.blending = Pixmap.Blending.None
        val buffer = pixmap.pixels
        buffer.clear()
        buffer.put(bytes(format))
        buffer.flip()
        return pixmap
    }

    /** The pixels laid out as gdx2d lays out [format]. */
    private fun bytes(format: Pixmap.Format): ByteArray {
        val n = width * height
        return when (format) {
            Pixmap.Format.RGBA8888 -> ByteArray(n * 4).also { out ->
                for (i in 0 until n) {
                    val c = rgba[i]
                    out[i * 4] = (c ushr 24).toByte()
                    out[i * 4 + 1] = (c ushr 16).toByte()
                    out[i * 4 + 2] = (c ushr 8).toByte()
                    out[i * 4 + 3] = c.toByte()
                }
            }
            Pixmap.Format.RGB888 -> ByteArray(n * 3).also { out ->
                for (i in 0 until n) {
                    val c = rgba[i]
                    out[i * 3] = (c ushr 24).toByte()
                    out[i * 3 + 1] = (c ushr 16).toByte()
                    out[i * 3 + 2] = (c ushr 8).toByte()
                }
            }
            // Four bits a channel, the top four of each byte, as one
            // little-endian 16-bit word: gdx2d's own layout.
            Pixmap.Format.RGBA4444 -> ByteArray(n * 2).also { out ->
                for (i in 0 until n) {
                    val c = rgba[i]
                    val word = ((c ushr 28) and 0xF shl 12) or ((c ushr 20) and 0xF shl 8) or
                        ((c ushr 12) and 0xF shl 4) or ((c ushr 4) and 0xF)
                    out[i * 2] = word.toByte()
                    out[i * 2 + 1] = (word ushr 8).toByte()
                }
            }
            else -> throw IllegalArgumentException("PixelBuffer cannot write $format")
        }
    }
}

package com.ww2strategy.game

import com.badlogic.gdx.Application
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.TextureData
import com.badlogic.gdx.utils.BufferUtils

/**
 * Pixels to a texture, by platform (B15).
 *
 * Straight to GL with glTexImage2D, and no pixmap at all, on every platform
 * (3 October 2026; before, the desktop and Android went through a pixmap). In
 * the browser that was always so: libGDX's
 * pixmaps live in WebAssembly there, and a page whose host forbids compiling
 * WebAssembly (a content security policy without 'wasm-unsafe-eval') would
 * otherwise start and then fail at the first picture. With every texture made
 * here, the game needs no WebAssembly to draw.
 */
internal object Upload {

    private val browser: Boolean get() = Gdx.app?.type == Application.ApplicationType.WebGL

    /**
     * A texture of [bytes] laid out as gdx2d lays out [format] (RGBA8888, RGB888 or RGBA4444).
     *
     * Managed, on every platform: the bytes are kept outside the Java heap and
     * given to GL again when Android takes the context away. The author's
     * phone, 3 October 2026, showed every page and frame black after the game
     * came back to the front -- `Texture(pixmap)` makes an unmanaged texture,
     * libGDX does not restore it, and every texture of this game is made here
     * from pixels, not loaded from a file it could read again.
     */
    fun texture(width: Int, height: Int, bytes: ByteArray, format: Pixmap.Format): Texture =
        Texture(Raw(width, height, bytes, format))

    /** A pixmap's texture that survives a lost context: the pixmap is kept for it, and must not be disposed. */
    fun managed(pixmap: Pixmap): Texture =
        Texture(com.badlogic.gdx.graphics.glutils.PixmapTextureData(pixmap, null, false, false, true))

    /** One white pixel, the texture tinted to fill a rectangle. */
    fun white(): Texture = texture(1, 1, byteArrayOf(-1, -1, -1, -1), Pixmap.Format.RGBA8888)

    /**
     * One white pixel for the whole game, made once and never let go, for a
     * page that has nothing else to dispose. Seven pages made their own and
     * kept it after the campaign was left (`--cycle`). Never dispose it.
     */
    val sharedWhite: Texture by lazy { white() }

    /** Whether a four-bit texture should be widened to eight bits: WebGL wants a 16-bit array for it, not bytes. */
    val widenFourBit: Boolean get() = browser

    /**
     * Bytes handed to GL as they are. Kept, so a lost context can be given
     * them again, as a pixmap texture keeps its pixmap.
     */
    private class Raw(
        private val w: Int,
        private val h: Int,
        bytes: ByteArray,
        private val format: Pixmap.Format,
    ) : TextureData {
        /** Off the Java heap, as a pixmap's pixels are: a phone's heap is small. */
        private val buffer = BufferUtils.newByteBuffer(bytes.size).also { it.put(bytes); it.flip() }
        override fun getType() = TextureData.TextureDataType.Custom
        override fun isPrepared() = true
        override fun prepare() {}
        override fun consumePixmap(): Pixmap = throw UnsupportedOperationException("raw pixels have no pixmap")
        override fun disposePixmap() = false
        override fun consumeCustomData(target: Int) {
            val (glFormat, glType) = when (format) {
                Pixmap.Format.RGB888 -> GL20.GL_RGB to GL20.GL_UNSIGNED_BYTE
                // Native shorts, as gdx2d keeps them (widened to bytes in the browser).
                Pixmap.Format.RGBA4444 -> GL20.GL_RGBA to GL20.GL_UNSIGNED_SHORT_4_4_4_4
                else -> GL20.GL_RGBA to GL20.GL_UNSIGNED_BYTE
            }
            buffer.rewind()
            Gdx.gl.glPixelStorei(GL20.GL_UNPACK_ALIGNMENT, 1)
            Gdx.gl.glTexImage2D(target, 0, glFormat, w, h, 0, glFormat, glType, buffer)
        }
        override fun getWidth() = w
        override fun getHeight() = h
        override fun getFormat(): Pixmap.Format = format
        override fun useMipMaps() = false
        override fun isManaged() = true
    }
}

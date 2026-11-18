package com.ww2strategy.desktop

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.PixmapIO
import com.ww2strategy.game.Ww2Game
import java.io.File

/**
 * The desktop launcher, and the screenshot harness.
 *
 * There is no phone where this game is written and a screenshot cannot tap, so every screen is
 * reviewed through this: it starts the real game at a phone's size, presses what it is told to,
 * writes a picture and prints two checks that are read like a test.
 *
 *   xvfb-run -a -s "-screen 0 1200x2500x24" ./gradlew :lwjgl3:run --args="--screenshot /tmp/x.png \
 *       --width 1080 --height 2400 --dpi 420 --country GER --days 30 --select warsaw --press 'tab.production'"
 *
 *   --screenshot FILE   write the last frame there (never inside the repository) and leave
 *   --width, --height   the window, in pixels; --dpi the screen's density (a phone: 1080 2400 420)
 *   --lang en|de        the language
 *   --country TAG       begin a campaign as that state (else the title page)
 *   --seed N            the campaign's seed
 *   --days N            let that many days pass first
 *   --select REGION     look at that region and select it; --zoom KM kilometres to a pixel
 *   --press "a;b;c"     in turn: a button by its name, x,y (pixels from the top left), region:ID, hold:x,y, back, wait, days:N
 */
fun main(args: Array<String>) {
    fun arg(name: String): String? = args.indexOf(name).let { if (it >= 0 && it + 1 < args.size) args[it + 1] else null }
    val shot = arg("--screenshot")
    val width = arg("--width")?.toInt() ?: 540
    val height = arg("--height")?.toInt() ?: 1200
    val options = Ww2Game.Options()
    options.language = arg("--lang") ?: if (shot != null) "en" else null
    options.country = arg("--country")
    options.seed = arg("--seed")?.toLong() ?: 1
    arg("--dpi")?.let { options.density = it.toFloat() / 160f }
    val days = arg("--days")?.toInt() ?: 0
    val select = arg("--select")
    val zoom = arg("--zoom")?.toFloat()
    val presses = ArrayDeque((arg("--press") ?: "").split(";").map { it.trim() }.filter { it.isNotEmpty() })
    var wait = 0
    var problems = 0
    if (shot != null) {
        options.onFrame = { game, frame ->
            if (frame == 2) {
                if (days > 0) game.advance(days)
                select?.let { id ->
                    val r = game.data.region(id)
                    game.selected = r
                    game.map.lookAtRegion(r, zoom ?: game.map.camera.zoom)
                }
                if (select == null && zoom != null) game.map.lookAt(game.map.camera.position.x, game.map.camera.position.y, zoom)
            }
            if (frame > 3 && wait-- <= 0) {
                if (presses.isNotEmpty()) {
                    val what = presses.removeFirst()
                    wait = 3
                    when {
                        what == "wait" -> wait = 30
                        what == "back" -> game.back()
                        what.startsWith("days:") -> game.advance(what.substring(5).toInt())
                        what.startsWith("hold:") -> what.substring(5).split(",").let { game.hold(it[0].toFloat(), it[1].toFloat()); wait = 2 }
                        what.startsWith("region:") -> {
                            val r = game.data.region(what.substring(7))
                            game.tap(game.map.screenX(r), Gdx.graphics.height - game.map.screenY(r))
                        }
                        what.matches(Regex("\\d+,\\d+")) -> what.split(",").let { game.tap(it[0].toFloat(), it[1].toFloat()) }
                        else -> {
                            val target = game.lastTargets.lastOrNull { it.id == what }
                            if (target == null) { println("press: nothing called '$what' on the screen"); problems++ }
                            else game.tap(target.x + target.w / 2, Gdx.graphics.height - (target.y + target.h / 2))
                        }
                    }
                } else {
                    // The checks, read like a test: a finger needs 48 dp, and nothing may lie on anything else.
                    val dp = game.ui.dp
                    val small = game.lastTargets.filter { it.w < 47.5f * dp || it.h < 47.5f * dp }.map { it.id }
                    println("tap targets under 48 dp: " + if (small.isEmpty()) "none" else small.joinToString())
                    val over = ArrayList<String>()
                    val t = game.lastTargets
                    for (i in t.indices) for (j in i + 1 until t.size) {
                        val a = t[i]; val b = t[j]
                        if (a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1) over.add(a.id + " / " + b.id)
                    }
                    println("overlaps: " + if (over.isEmpty()) "none" else over.joinToString())
                    val pixmap = Pixmap.createFromFrameBuffer(0, 0, Gdx.graphics.backBufferWidth, Gdx.graphics.backBufferHeight)
                    PixmapIO.writePNG(FileHandle(File(shot)), pixmap, 6, true)
                    pixmap.dispose()
                    println("screenshot: $shot ${Gdx.graphics.backBufferWidth}x${Gdx.graphics.backBufferHeight}" + if (problems > 0) " ($problems presses found nothing)" else "")
                    Gdx.app.exit()
                }
            }
        }
    }
    val config = Lwjgl3ApplicationConfiguration()
    config.setTitle("Finis Pacis (working title)")
    config.setWindowedMode(width, height)
    config.setForegroundFPS(60)
    config.useVsync(shot == null)
    Lwjgl3Application(Ww2Game(options), config)
}

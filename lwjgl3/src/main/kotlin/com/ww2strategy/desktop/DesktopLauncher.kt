package com.ww2strategy.desktop

import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration
import com.ww2strategy.game.HelloGame

fun main() {
    val config = Lwjgl3ApplicationConfiguration()
    config.setWindowedMode(540, 1200)
    Lwjgl3Application(HelloGame(), config)
}

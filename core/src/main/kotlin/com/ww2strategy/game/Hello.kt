package com.ww2strategy.game

import com.badlogic.gdx.ApplicationAdapter
import com.badlogic.gdx.Gdx
import com.ww2strategy.sim.Hello

class HelloGame : ApplicationAdapter() {
    private var frames = 0
    override fun render() {
        Gdx.gl.glClearColor(0.2f, 0.3f, 0.4f, 1f)
        Gdx.gl.glClear(com.badlogic.gdx.graphics.GL20.GL_COLOR_BUFFER_BIT)
        if (++frames == 3) { println("core ok: " + Hello.text() + " " + Gdx.graphics.width + "x" + Gdx.graphics.height); Gdx.app.exit() }
    }
}

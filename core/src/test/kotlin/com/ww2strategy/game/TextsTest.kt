package com.ww2strategy.game

import com.ww2strategy.sim.GameJson
import com.ww2strategy.sim.stripComments
import kotlinx.serialization.json.jsonObject
import java.io.File
import kotlin.test.Test
import kotlin.test.assertTrue

/** Every word the game shows exists in both languages, and every decision of the plan has its name. */
class TextsTest {
    private fun keys(code: String) = stripComments(GameJson.parseToJsonElement(File("data/text/$code.json").readText())).jsonObject.keys

    @Test fun `German has every English key`() {
        val missing = keys("en") - keys("de")
        assertTrue(missing.isEmpty(), "missing in de.json: $missing")
    }

    @Test fun `every decision of the plan has a name`() {
        val plan = Regex("\"id\": \"(\\w+)\", \"kind\"").findAll(File("data/scenarios/1939/scenario.json").readText()).map { "plan." + it.groupValues[1] }.toSet()
        val missing = plan - keys("en")
        assertTrue(plan.size > 15 && missing.isEmpty(), "plans without a name: $missing")
    }
}

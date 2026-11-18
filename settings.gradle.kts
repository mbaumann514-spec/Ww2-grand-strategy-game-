// The module layout, taken over from the sister game (its ADR-007) for the same one reason:
// `sim` must never depend on libGDX. The rules live there and so do the tests, so it has to
// run on a plain JVM with no window, no GL context and no device. `core` is the only module
// that knows libGDX exists; the launchers below it are thin.

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

rootProject.name = "ww2-grand-strategy"

include("sim")      // the rules: clock, countries, regions, divisions, combat, supply, AI, saves. No libGDX.
include("core")     // the libGDX game: map, counters, interface, input. Depends on :sim.
include("lwjgl3")   // desktop launcher, for development and the screenshot harness.

// The Android launcher is the one that ships. Built only with WW2_ANDROID=1: the environment
// these packages are written in cannot reach Google's Maven, and a module Gradle cannot
// evaluate fails every task, the simulation's tests included. docs/ANDROID.md is the procedure.
if (System.getenv("WW2_ANDROID") == "1") include("android")

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

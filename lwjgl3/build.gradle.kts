plugins {
    alias(libs.plugins.kotlin.jvm)
    application
}

dependencies {
    implementation(project(":core"))
    implementation(libs.gdx.backend.lwjgl3)
    runtimeOnly(variantOf(libs.gdx.platform.natives) { classifier("natives-desktop") })
}

kotlin {
    jvmToolchain(libs.versions.jdk.get().toInt())
}

application {
    mainClass.set("com.ww2strategy.desktop.DesktopLauncherKt")
}

val gameVersion = "${rootProject.property("gameVersion")}.${System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull() ?: 1}"

// The content lives in the repository's data/ directory, shared by every platform, so the
// desktop launcher runs with the repository root as its working directory.
tasks.named<JavaExec>("run") {
    workingDir = rootProject.projectDir
    systemProperty("game.version", gameVersion)
    // A phone's heap, to find what overflows it before a phone does: GAME_HEAP=256m ./gradlew :lwjgl3:run ...
    System.getenv("GAME_HEAP")?.let { maxHeapSize = it }
}

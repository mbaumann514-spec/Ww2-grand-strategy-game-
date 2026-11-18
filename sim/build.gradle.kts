plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
}

/*
 * The simulation. Deliberately no libGDX dependency, and none should ever be added: the whole
 * point of this module is that the rules run without a graphics context.
 *
 * One target, the JVM. The sister game kept a JavaScript target beside it that nobody built
 * and that sat broken for weeks; this game goes to Google Play only, so there is none.
 */
kotlin {
    jvmToolchain(libs.versions.jdk.get().toInt())
    compilerOptions {
        allWarningsAsErrors.set(false)
    }
}

dependencies {
    // `api`: the save format and the data loaders appear in this module's public types.
    api(libs.kotlinx.serialization.json)
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
    // The scenario data lives in the repository's data/ directory, shared by every platform,
    // so the tests run from the repository root rather than keeping a second copy of it.
    workingDir = rootProject.projectDir
    // A data edit must rerun the tests: without this Gradle restores the last results from its
    // cache after a JSON-only change and reports them as a pass (the sister game learned it).
    inputs.dir(rootProject.file("data"))
    testLogging {
        events("failed")
        showStandardStreams = false
    }
}

/*
 * The headless runner: the balance instrument.
 *
 *   ./gradlew :sim:headless --args="--years 6 --seed 1"
 */
val headless by tasks.registering(JavaExec::class) {
    group = "application"
    description = "Run the war forward with no screen attached and print what happened."
    mainClass.set("com.ww2strategy.sim.tools.Headless")
    classpath = sourceSets["main"].runtimeClasspath
    workingDir = rootProject.projectDir
}

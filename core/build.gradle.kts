plugins {
    alias(libs.plugins.kotlin.jvm)
}

dependencies {
    api(project(":sim"))
    api(libs.gdx)
    testImplementation(kotlin("test"))
    testRuntimeOnly(variantOf(libs.gdx.platform.natives) { classifier("natives-desktop") })
}

kotlin {
    jvmToolchain(libs.versions.jdk.get().toInt())
}

tasks.test {
    useJUnitPlatform()
    workingDir = rootProject.projectDir
    inputs.dir(rootProject.file("data"))
}

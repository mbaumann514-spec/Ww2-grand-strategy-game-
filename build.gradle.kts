// The Android Gradle plugin, and only when the Android module is built (WW2_ANDROID=1), on the
// same classpath as the Kotlin plugin, which is where the Kotlin plugin looks for it.
buildscript {
    if (System.getenv("WW2_ANDROID") == "1") {
        repositories {
            google()
            mavenCentral()
        }
        dependencies {
            classpath("com.android.tools.build:gradle:8.11.1")
        }
    }
}

plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}

subprojects {
    repositories {
        mavenCentral()
    }
}

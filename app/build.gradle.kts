plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.farhan.reimagined2048"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "com.farhan.reimagined2048"
        minSdk = 26
        targetSdk = 37
        versionCode = 2
        versionName = "2.2.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            optimization {
                enable = false
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.core.ktx)
    implementation(libs.material)
    implementation("androidx.webkit:webkit:1.17.0")
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
}
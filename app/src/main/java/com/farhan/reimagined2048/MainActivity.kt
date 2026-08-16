package com.farhan.reimagined2048

import android.annotation.SuppressLint
import android.media.AudioAttributes
import android.os.Build
import android.os.Bundle
import android.os.VibrationAttributes
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.annotation.Keep
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        supportActionBar?.hide()
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        unlockMaxRefreshRate()
        enableImmersiveMode()

        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.gameWebView)
        webView.isHapticFeedbackEnabled = true
        setupHighPerformanceWebView()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript("if(window.handleAndroidBack){ window.handleAndroidBack(); } else { false; }") { result ->
                    if (result != "true") {
                        if (webView.canGoBack()) {
                            webView.goBack()
                        } else {
                            finish()
                        }
                    }
                }
            }
        })
    }

    private fun unlockMaxRefreshRate() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val modes = display?.supportedModes ?: return
            val maxMode = modes.maxByOrNull { it.refreshRate }
            maxMode?.let {
                val params = window.attributes
                params.preferredDisplayModeId = it.modeId
                window.attributes = params
            }
        } else {
            @Suppress("DEPRECATION")
            val modes = windowManager.defaultDisplay.supportedModes
            val maxMode = modes.maxByOrNull { it.refreshRate }
            maxMode?.let {
                val params = window.attributes
                params.preferredDisplayModeId = it.modeId
                window.attributes = params
            }
        }
    }

    private fun enableImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    @SuppressLint("SetJavaScriptEnabled", "WebViewRenderProcessGone")
    private fun setupHighPerformanceWebView() {
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.setBackgroundColor(0xFF000000.toInt())

        WebView.setWebContentsDebuggingEnabled(false)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        @Suppress("DEPRECATION")
        settings.allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        settings.allowUniversalAccessFromFileURLs = true
        settings.safeBrowsingEnabled = false

        webView.addJavascriptInterface(NativeBridge(this), "AndroidBridge")

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.webViewClient = SafeWebViewClient(assetLoader)
        webView.loadUrl("file:///android_asset/index.html")
    }

    private class SafeWebViewClient(
        private val assetLoader: WebViewAssetLoader
    ) : WebViewClient() {

        override fun shouldInterceptRequest(
            view: WebView?,
            request: WebResourceRequest?
        ): WebResourceResponse? {
            val url = request?.url ?: return null
            return assetLoader.shouldInterceptRequest(url)
        }

        override fun onRenderProcessGone(
            view: WebView?,
            detail: RenderProcessGoneDetail?
        ): Boolean {
            view?.destroy()
            return true
        }
    }

    @Keep
    @Suppress("unused")
    class NativeBridge(private val activity: MainActivity) {

        @JavascriptInterface
        fun exitApp() {
            activity.runOnUiThread {
                activity.finishAffinity()
            }
        }

        @JavascriptInterface
        fun haptic(milliseconds: Double) {
            triggerAdaptiveHaptic(milliseconds.toLong())
        }

        @JavascriptInterface
        fun haptic(milliseconds: Long) {
            triggerAdaptiveHaptic(milliseconds)
        }

        @JavascriptInterface
        fun haptic(milliseconds: Int) {
            triggerAdaptiveHaptic(milliseconds.toLong())
        }

        private fun triggerAdaptiveHaptic(rawMs: Long) {
            if (rawMs <= 0) return

            val vib = activity.getSystemService(Vibrator::class.java) ?: return
            if (!vib.hasVibrator()) return

            val (duration, amplitude) = when (rawMs) {
                in 1..10 -> Pair(30L, 120)
                in 11..16 -> Pair(42L, 180)
                in 17..25 -> Pair(55L, 210)
                in 26..40 -> Pair(80L, 255)
                else -> Pair(rawMs.coerceIn(30L, 90L), 255)
            }

            try {
                val effect = if (vib.hasAmplitudeControl()) {
                    VibrationEffect.createOneShot(duration, amplitude)
                } else {
                    VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    val attrs = VibrationAttributes.Builder()
                        .setUsage(VibrationAttributes.USAGE_ALARM)
                        .build()
                    vib.vibrate(effect, attrs)
                } else {
                    @Suppress("DEPRECATION")
                    val audioAttrs = AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                    @Suppress("DEPRECATION")
                    vib.vibrate(effect, audioAttrs)
                }
            } catch (_: Throwable) {
                @Suppress("DEPRECATION")
                vib.vibrate(duration)
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            enableImmersiveMode()
        }
    }
}
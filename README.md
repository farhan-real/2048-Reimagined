# 2048 Reimagined

An open-source, high-performance Android edition of the 2048 puzzle game. Built from scratch with an independent codebase, this project introduces hardware-accelerated grid mechanics, high refresh rate support (90Hz, 120Hz, 144Hz), 11 visual themes, a background music engine with real-time spectrum visualizers, deterministic spawn modes, an active game timer, and a local leaderboard.

While based on the original 2048 game concept created by Gabriele Cirulli, all source code, layout systems, audio engines, and native Android bridges in this repository were written from scratch by Me.

---
# Screenshots

| Default Theme | Seaway Theme |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/d10762ca-a8b6-43bd-87dc-8433d1fb6c29" width="280" alt="Default Theme" /> | <img src="https://github.com/user-attachments/assets/338fab07-650f-4bfa-924c-756e96546cf0" width="280" alt="Seaway Theme" /> |
| **Music Player** | **Settings** |
| <img src="https://github.com/user-attachments/assets/dbb870fa-827e-4ae1-afa6-20b2ab5798cc" width="280" alt="Music Player" /> | <img src="https://github.com/user-attachments/assets/eff34d64-a6aa-4299-890b-8cf98eeec9b5" width="280" alt="Settings Screen" /> |

## Features

### Display and Performance
* **High Refresh Rate Support:** Configures display attributes to render at panel maximums (90Hz, 120Hz, or 144Hz).
* **Hardware-Accelerated Grid:** Matrix transforms run on dedicated GPU composition layers using CSS `translate3d` to prevent layout reflows.
* **11 Custom Themes:** Optimized palettes for AMOLED, dark, and light displays:
  * Neon AMOLED
  * Pastel AMOLED
  * Cyberpunk
  * Synthwave
  * Seaway
  * Pastel Pink
  * The Void
  * Terminal
  * Sakura Night
  * Supernova
  * Classic Sand

### Gameplay Mechanics
* **Deterministic Spawn Mode:** Generates new tiles using a Mulberry32 PRNG seeded with a hash of the current board state and turn count. Eliminates using undo to re-roll random tile placements.
* **Active Game Timer:** Calculates duration exclusively while the game board is focused and visible on-screen (auto-pauses when menus are open, during app switches, or on screen lock).
* **Top-5 Leaderboard:** Local tracking of top scores alongside clear time and completion timestamp, with support for clearing the board or deleting individual entries.
* **Single-Move Undo:** Preserves complete state snapshots including score, matrix data, PRNG seed state, and timer duration.

### Audio and Visualizer Engine
* **Background Music Player:** Native playback for `.mp3` and `.flac` audio files with randomized playlist shuffling on startup.
* **Smart Track Metadata:** Automatically parses `[Artist(s)] - [Title]` naming structures across common delimiters (`, `, ` & `, ` and `, ` vs `, ` vs. `).
* **Playlist Checklist:** Custom dialog to enable or disable specific tracks in the active queue.
* **Real-Time Spectrum Visualizer:** Powered by Web Audio API frequency analysis:
  * **Full Bottom Mode:** Full-width, multi-bar equalizer wave shaped with a smooth Gaussian bell curve.
  * **Isolated Box Mode:** Bottom-left widget with selectable sizing (Small, Medium, Large).
  * **Configurable Density:** Slider to adjust visualizer bar counts (Minimal, Normal, Dense, Extreme).
* **Volume Controls:** Independent sliders for synthesized Web Audio sound effects (SFX) and music volume.

### Android Integration
* **Native Haptic Bridge:** Android `Vibrator` API integration with adaptive amplitude profiles (Off, Soft, Hard).
* **Immersive Mode:** System bars automatically hidden with transient swipe-to-reveal navigation.
* **Back Button Routing:** Android system back button sequentially closes open modal sheets before showing the exit confirmation dialog.

---

## Project Structure

```text
app/src/main/
├── java/com/farhan/reimagined2048/
│   └── MainActivity.kt             # Android Activity, WebView configuration, native bridges
├── res/                            # Native Android resources (icons, themes, strings)
└── assets/
    ├── index.html                  # Main application markup
    ├── music/                      # Directory for .mp3 and .flac audio tracks
    ├── css/
    │   ├── base/
    │   │   ├── variables.css       # Sizing metrics and CSS custom properties
    │   │   └── layout.css          # Core layouts, scoreboards, action rows
    │   ├── components/
    │   │   ├── board.css           # Grid matrix, hardware transforms, tile animations
    │   │   └── music.css           # Player modal, seekbar, visualizer canvases
    │   ├── modals/
    │   │   ├── modal-base.css      # Modal base overlays, card frames, headers, footers
    │   │   ├── modal-settings.css  # Settings cards, sliders, switches, tab buttons
    │   │   ├── modal-leaderboard.css# Leaderboard ranking rows and badges
    │   │   ├── modal-music.css     # Playlist checklist selector dialog
    │   │   └── modal-info.css      # Changelog, Credits, Game-over overlays
    │   └── themes/
    │       ├── themes.css          # Theme aggregator stylesheet
    │       └── [theme-name].css    # Individual color palette definitions
    └── js/
        ├── core/
        │   ├── storage.js          # LocalStorage persistence manager
        │   ├── prng.js             # Mulberry32 PRNG and board hashing engine
        │   ├── tile.js             # Tile DOM instance controller
        │   └── game.js             # Core 2048 matrix state and move mechanics
        ├── audio/
        │   ├── sfx.js              # Synthesized Web Audio sound effects
        │   ├── music-data.js       # Track registry and metadata parser
        │   ├── visualizer.js       # Real-time spectrum visualizer canvas engine
        │   └── music.js            # Background audio playback and playlist manager
        ├── features/
        │   ├── particles.js        # Canvas particle burst physics
        │   ├── timer.js            # Active duration timer
        │   ├── leaderboard.js      # Leaderboard data and rank manager
        │   └── info-data.js        # Changelog and Credits data registry
        ├── ui/
        │   ├── theme-ui.js         # Theme dropdown menu controller
        │   ├── settings-ui.js      # Settings modal bindings and sliders
        │   ├── leaderboard-ui.js   # Leaderboard rendering and deletion
        │   ├── music-ui.js         # Music player UI, seekbar, playlist picker
        │   └── ui.js               # Main UI coordinator
        └── input/
            └── input.js            # Touch gestures, keyboard inputs, Android back handler
```

---

## Adding Custom Music

1. Place your audio files (`.mp3`, `.flac`, `.wav`, `.ogg`, or `.m4a`) into:
   ```text
   app/src/main/assets/music/
   ```

2. Format file names using the `[Artist(s)] - [Title].[ext]` convention:
   ```text
   Dubmood - Chiptune.mp3
   Zalza vs Floppi - Alanya Spring.flac
   Alan Walker, K-391 - Ignite.mp3
   ```

3. Register the filenames in `app/src/main/assets/js/audio/music-data.js`:
   ```javascript
   const TRACK_FILES = [
     "Dubmood - Chiptune.mp3",
     "Zalza vs Floppi - Alanya Spring.flac",
     "Alan Walker, K-391 - Ignite.mp3"
   ];
   ```

---

## Build Requirements

* Android Studio Hedgehog (2023.1.1) or newer
* Target SDK 37 (Android 17)
* Minimum SDK 26 (Android 8.0)
* Gradle 8.x + Kotlin DSL

### Compiling from Source
To compile a debug build from the terminal:
```bash
./gradlew assembleDebug
```
The output APK will be located in `app/build/outputs/apk/debug/`.

---

## Credits

### Development
* **Code:** Farhan & Gemini
* **Testing:** Farhan
* **Architecture:** Farhan
* **Original 2048 Concept:** Gabriele Cirulli

### Design and Sound
* **App Icon:** Gemini
* **Sound Effects (SFX):** Gemini

### Featured Music Composers
* Dubmood
* Zabutom
* Jakim
* ko0x
* Moodmode
* Oxbow
* rez
* kenet
* Zalza
* Floppi

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE](LICENSE) file for details.

* All bundled soundtrack tracks remain the intellectual property and copyright of their respective artists and composers.

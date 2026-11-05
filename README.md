# 2048 Reimagined

> An open-source, high-performance Android edition of the 2048 puzzle game.

Built from scratch with an independent codebase, this project introduces hardware-accelerated grid mechanics, high refresh rate support (90Hz, 120Hz, 144Hz), an ergonomic 3-column landscape mode, 21 distinct theme variants with dual-mode sliding switches, an automatic precompiled zero-calculation visualizer engine, a 25-track chiptune soundtrack, deterministic spawn modes, an active game timer, and a local leaderboard with undo retraction.

While based on the original 2048 game concept created by Gabriele Cirulli, all source code, layout systems, audio engines, and native Android bridges in this repository were written from scratch.

---

## Screenshots

| Default Theme | Seaway Theme |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/d10762ca-a8b6-43bd-87dc-8433d1fb6c29" width="280" alt="Default Theme" /> | <img src="https://github.com/user-attachments/assets/338fab07-650f-4bfa-924c-756e96546cf0" width="280" alt="Seaway Theme" /> |
| **Music Player** | **Settings** |
| <img src="https://github.com/user-attachments/assets/dbb870fa-827e-4ae1-afa6-20b2ab5798cc" width="280" alt="Music Player" /> | <img src="https://github.com/user-attachments/assets/eff34d64-a6aa-4299-890b-8cf98eeec9b5" width="280" alt="Settings Screen" /> |

---

## Theme Previews

Complete tile progressions from 2 to 2048 for each theme family:

### Nature & Art
> *Forest, Ocean, Sakura, Autumn, Ukiyo-e*

[![Nature & Art](previews/nature.svg)](app/src/main/assets/previews/nature.svg)

---

### Space & Cosmos
> *Stellar Nebula, Supernova*

[![Space & Cosmos](previews/space.svg)](app/src/main/assets/previews/space.svg)

---

### Retro & Hardware
> *Retro Keeb, DMG 1989, Terminal, Synthwave*

[![Retro & Hardware](previews/retro.svg)](app/src/main/assets/previews/retro.svg)

---

### Cyber & Tech
> *Cyberpunk, Blueprint, Frutiger Aero, Vectorheart, Neon Glow*

[![Cyber & Tech](previews/cyber.svg)](app/src/main/assets/previews/cyber.svg)

---

### Aesthetic & Minimal
> *Pastel Rainbow, Pastel Pink, Nordic Frost, Classic Sand, The Void*

[![Aesthetic & Minimal](previews/minimal.svg)](app/src/main/assets/previews/minimal.svg)

---

## Features

### Display, Orientation and Performance
* **High Refresh Rate Support:** Configures display attributes to render at panel maximums (90Hz, 120Hz, or 144Hz).
* **3-Column Landscape Layout:** Ergonomic horizontal interface placing UI controls on the left, board in the center, and a live audio visualizer panel on the right.
* **3-State Orientation Lock:** Settings toggle supporting Rotate (Auto/Sensor), Portrait lock, and Landscape lock with native Android bridge integration.
* **Hardware-Accelerated Grid:** Matrix transforms run on dedicated GPU layers with CSS containment (`contain: layout style`) to isolate tile animations from page reflows.

### Comprehensive Theme Engine
Organized into category subfolders with interactive sliding dual-mode (Sun/Moon) switches:
* **Nature & Art:** Forest (Dark/Light), Ocean (Dark/Light), Sakura Bloom (Dark/Light), Autumn Maple (Dark/Light), Ukiyo-e (Traditional wood grain).
* **Space & Cosmos:** Stellar Nebula (Dark/Light), Supernova (Dark/Light).
* **Retro & Hardware:** Retro Keeb (Dark/Light), DMG 1989 (4-tone LCD/Backlit Dark), Terminal (Dark/Light), Synthwave (Dark/Light).
* **Cyber & Tech:** Cyberpunk (Dark/Light), Blueprint (Dark/Light), Frutiger Aero (Dark/Light), Vectorheart (Dark/Light), Neon Glow (Dark/Light).
* **Aesthetic & Minimal:** Pastel Rainbow (Dark/Light), Pastel Pink (Dark/Light), Nordic Frost (Dark/Light), Classic Sand (Dark/Light), The Void (OLED).

### Gameplay Mechanics
* **Deterministic Spawn Mode:** Generates tiles using a Mulberry32 PRNG seeded with board state and turn count, preventing undo re-rolling.
* **Active Game Timer:** Ticks strictly while the board is on-screen (auto-pauses on modal open, app switch, or lock screen).
* **Top-5 Leaderboard with Loss Undo:** Automatically records high scores; undoing from the game-over screen retracts the entry to prevent false or duplicate ranks.
* **Single-Move Undo:** Preserves complete state snapshots including score, matrix data, PRNG seed state, and timer duration.

### Audio and Visualizer Engine
* **Automatic Precompiled Visualizer:** Pre-generates multi-band frequency, beat cadence, and chiptune arpeggios on startup for all tracks. Operates with zero runtime FFT calculation, eliminating device heating and battery drain.
* **Thermal-Optimized 25 FPS Cap:** Capped visualizer loop with single-pass path batching and clamped 2.0x DPR to eliminate redundant GPU overdraw.
* **Display Modes:** Full-width bottom wave, isolated bottom-left box widget, and right-column landscape visualizer panel.
* **25-Track Soundtrack:** Standardized 192 kbps MP3 audio library with random shuffling, metadata parsing, and playlist selection.
* **Independent Volume Sliders:** Separate controls for synthesized Web Audio sound effects (SFX) and music playback.

### Android Native Integration
* **Native Haptic Bridge:** Android `Vibrator` API integration with adaptive amplitude profiles (Off, Soft, Hard).
* **Immersive Mode:** System bars automatically hidden with transient swipe-to-reveal navigation.
* **Back Button Routing:** Android system back button sequentially closes open modal sheets before showing the exit confirmation dialog.

---

## Project Structure

```text
app/src/main/
├── java/com/farhan/reimagined2048/
│   └── MainActivity.kt             # Android Activity, WebView setup, native bridges
├── res/                            # Native Android resources (icons, themes, strings)
└── assets/
    ├── index.html                  # Main application markup
    ├── music/                      # Directory for 192 kbps MP3 soundtrack files
    ├── previews/                   # SVG grid previews for all theme block palettes
    │   ├── nature.svg
    │   ├── space.svg
    │   ├── retro.svg
    │   ├── cyber.svg
    │   └── minimal.svg
    ├── css/
    │   ├── base/
    │   │   ├── variables.css       # Sizing metrics and responsive clamp formulas
    │   │   ├── layout.css          # Core layouts, scoreboards, action rows
    │   │   └── landscape.css       # 3-column landscape responsive layout styles
    │   ├── components/
    │   │   ├── board.css           # Grid matrix, containment, tile animations
    │   │   └── music.css           # Player modal, seekbar, visualizer canvases
    │   ├── modals/
    │   │   ├── modal-base.css      # Modal base overlays with visibility isolation
    │   │   ├── modal-settings.css  # Settings cards, sliders, switches, tab buttons
    │   │   ├── modal-leaderboard.css# Leaderboard ranking rows and badges
    │   │   ├── modal-music.css     # Playlist checklist selector dialog
    │   │   └── modal-info.css      # Changelog, Credits, Game-over overlays
    │   └── themes/
    │       ├── themes.css          # Theme aggregator stylesheet
    │       ├── organize.ps1        # Theme directory relocation script
    │       ├── nature/             # Forest, Ocean, Sakura, Autumn, Ukiyo-e
    │       ├── space/              # Nebula, Supernova
    │       ├── retro/              # Retro Keeb, DMG 1989, Terminal, Synthwave
    │       ├── cyber/              # Cyberpunk, Blueprint, Frutiger Aero, Vectorheart, Neon
    │       └── minimal/            # Pastel, Nordic Frost, Classic Sand, The Void
    └── js/
        ├── core/
        │   ├── storage.js          # LocalStorage persistence manager
        │   ├── prng.js             # Mulberry32 PRNG and board hashing engine
        │   ├── tile.js             # Tile DOM instance controller
        │   └── game.js             # Core 2048 matrix state, moves, undo tracking
        ├── audio/
        │   ├── sfx.js              # Synthesized Web Audio sound effects
        │   ├── music-data.js       # 25-track registry and metadata parser
        │   ├── visualizerdata.js   # Precompiled acoustic frequency synthesis engine
        │   ├── visualizer.js       # 25 FPS spectrum visualizer canvas renderer
        │   └── music.js            # Background audio playback and playlist manager
        ├── features/
        │   ├── particles.js        # Canvas particle burst physics with cached metrics
        │   ├── timer.js            # Active duration timer
        │   ├── leaderboard.js      # Leaderboard data and rank manager
        │   └── info-data.js        # Changelog (up to v3.1.2) and Credits registry
        ├── ui/
        │   ├── theme-ui.js         # Theme dropdown menu with sliding mode switches
        │   ├── settings-ui.js      # Settings modal bindings, orientation tabs, sliders
        │   ├── leaderboard-ui.js   # Leaderboard rendering and deletion
        │   ├── music-ui.js         # Music player UI, seekbar, gated progress updates
        │   └── ui.js               # Main UI coordinator
        └── input/
            └── input.js            # Touch gestures, keyboard inputs, Android back handler
```

---

## Adding Custom Music

1. Convert audio files to 192 kbps MP3 and place them in:
   ```text
   assets/music/
   ```

2. Format file names using the `[Artist(s)] - [Title].mp3` convention:
   ```text
   Dubmood - Chiptune.mp3
   Zalza vs Floppi - Alanya Spring.mp3
   ```

3. Register the filenames in `assets/js/audio/music-data.js`:
   ```javascript
   const TRACK_FILES = [
     "Dubmood - Chiptune.mp3",
     "Zalza vs Floppi - Alanya Spring.mp3"
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
* 0BiT
* GEAR
* SnD

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE](LICENSE) file for details.

* All bundled soundtrack tracks remain the intellectual property and copyright of their respective artists and composers.
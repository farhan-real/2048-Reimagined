(function() {
  const CHANGELOG = [
    {
      version: "V3.1.2",
      title: "Precompiled Visualizer, High Responsiveness & Fixes",
      changes: [
        "Automatic Precompiled Visualizer Engine: Automatically pre-generates synchronized frequency, beat cadence, and melody motion profiles for all 25 tracks on startup.",
        "Zero Runtime FFT Overhead: Audio motion is retrieved instantly from precompiled lookup buffers with sub-frame time interpolation, completely eliminating device overheating.",
        "High-Resolution Transient Response: Evaluates instantaneous kick punches, sharp snare cracks on beats 2 & 4, and rapid 16th-note percussion ticks with microsecond precision.",
        "Fast Chiptune Arpeggios: Generates rapid melodic sweeps cascading across frequency bands matching fast-paced chiptune and dance rhythms.",
        "Full Vertical Height Scaling: Calibrated acoustic gain and dynamic contrast so visualizer bars fill 85%–95% of canvas headroom instead of staying low and flat.",
        "Snappy Gravity Physics: Upgraded gravity drop speed to 4.2x canvas height so bars drop swiftly between transients and bounce with agile rhythm.",
        "Fixed Broken Visualizer: Replaced Canvas roundRect calls with universal path rendering to eliminate WebView crashes, and restored missing Isolated Box mode rendering in the animation loop.",
        "Permanent Audio Capture Fix: Bypassed Android WebView cross-origin media capture restrictions that caused live WebAudio analysers to return silent zero-frequency buffers."
      ]
    },
    {
      version: "V3.1.1",
      title: "Theme Polish, Outlines & Palette Fixes",
      changes: [
        "Retro Keeb Palette Fix: Replaced multi-color accents with strictly authentic mechanical keyboard colors (cream alphas, stepped industrial gray modifiers, and Cherry crimson red artisan accents).",
        "Outlined Cyberpunk Light: Rebuilt around vibrant glowing neon outlines, colored borders, and cyan/magenta legends over clean light tech surfaces.",
        "Outlined Synthwave Light: Rebuilt with soft 80s pastel sunset paper and glowing neon Outrun borders, matching the outline aesthetic of its dark counterpart.",
        "Nordic Frost Dark Contrast: Completely separated tile shades across polar slate, glacial ocean blue, ice cyan, arctic teal, and frost white for instant visual distinction."
      ]
    },
    {
      version: "V3.1.0",
      title: "New Theme Visions, Custom Canvases & Polish",
      changes: [
        "New Distinct Theme Visions: Added Blueprint (architectural cyanotype), Frutiger Aero (glossy 2000s aqua glass), Ukiyo-e (traditional Edo woodblock print), DMG 1989 (classic Game Boy pea-soup LCD), Vectorheart (red/gray/black vector art), and Retro Keeb (vintage mechanical keyboard cream/gray/red).",
        "Unique Themed Canvases: Introduced custom backgrounds beyond standard black and white (natural cedar wood, reflective olive LCD, drafting linen, and graphite chassis).",
        "Dual-Mode Theme Expansions: Added dark variants for Pastel Pink, Nordic Frost, and Classic Sand, alongside Autumn Maple Light.",
        "Tile Contrast & Aesthetic Refinements: Enhanced tile progressions so adjacent values (2, 4, 8) are instantly distinguishable; restored full-color glowing plasma tiles to Supernova and deep evergreen canopy to Forest.",
        "Aesthetic Overhauls: Redesigned Cyberpunk Light (daytime tech neon), Synthwave Light (Miami Vice sunrise), and Terminal Light (monochrome paper console).",
        "Persistent Theme Selector: Dropdown now stays open when switching themes or toggling dark/light modes for seamless live previewing.",
        "Pastel AMOLED Fix: Resolved CSS selector mismatch that caused the screen to go black when selecting Pastel Rainbow Dark.",
        "Layout Ergonomics: Added extra breathing room between the top controls and score cards."
      ]
    },
    {
      version: "V3.0.0",
      title: "Landscape Mode, Theme Overhaul & 25-Track Audio",
      changes: [
        "Landscape Mode: Ergonomic 3-column layout featuring controls on the left, game board in the center, and a live audio visualizer on the right.",
        "Orientation Controls: New settings toggle to switch between Rotate (Auto), Portrait, and Landscape modes with responsive board scaling.",
        "Theme Overhaul & Dual-Mode Toggles: Consolidated theme items in the dropdown with an interactive sliding Sun/Moon toggle for instant Dark/Light mode switching.",
        "New Nature & Space Themes: Added Emerald Forest, Garden Dawn, Autumn Momiji, Ocean Breeze, Nebula, Celestial Solar, and Supernova Solar Flare.",
        "Light Variants & Palette Rebalancing: Added daylight variants for Cyberpunk, Sakura, Neon, Terminal, and Pastel; removed single-color wash in Synthwave and Supernova.",
        "Theme Subfolders: Structured all stylesheets into dedicated category subfolders (nature, space, cyber, minimal).",
        "Leaderboard Loss Undo: Undoing from the Game Over screen now automatically retracts the submitted score from the top-5 leaderboard.",
        "Dynamic Visualizer Ceilings: Added harmonic per-bar variation so saturated chiptune tracks no longer draw an artificial curve.",
        "Audio Storage Optimization: Converted all music tracks to high-efficiency 192kbps MP3 directly in assets/music/, dramatically cutting storage footprint while expanding the soundtrack to 25 tracks.",
        'Open Source: Published repository on GitHub at <a href="https://github.com/farhan-real/2048-Reimagined" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color);text-decoration:underline;word-break:break-all;">github.com/farhan-real/2048-Reimagined</a>.'
      ]
    },
    {
      version: "V2.2.1",
      title: "Fixes",
      changes: [
        "Fixed app name overriding to 2048 Reimagined on launcher.",
        "Fixed settings icon appearance.",
        "Fixed visualizer appearing static for certain songs (such as Keygen 31)."
      ]
    },
    {
      version: "V2.2.0",
      title: "Game Timer, Leaderboard & Layout Polish",
      changes: [
        "Active Game Timer: Precise timer that only ticks while the game is on-screen (auto-pauses when dialogs are open or app is backgrounded).",
        "Top-5 Leaderboard: Added leaderboard tracking score, duration, and date & time.",
        "Hide Timer Option: Settings toggle to hide on-screen & leaderboard timer without losing background tracking.",
        "Ergonomic Layout: Elevated the game board and placed an enlarged timer below Restart.",
        "In-App Confirmations: Custom dialogs for resetting high scores and clearing the leaderboard.",
        "Codebase Modularization: Cleanly split stylesheets, individual theme files, and script controllers into subfolders."
      ]
    },
    {
      version: "V2.1.0",
      title: "Deterministic Mode, Music & App Identity",
      changes: [
        "Deterministic Mode: Added toggle to lock tile spawn sequences and prevent undo rerolling.",
        "Music Player: Added background music playback supporting .mp3 and .flac files.",
        "Playlist Selector: Custom checklist dialog to choose which tracks can be played.",
        "Music Visualizer: Real-time audio visualizer with Full Bottom and Isolated Box modes.",
        "Volume Controls: Added dedicated sliders for SFX and Music volume.",
        "Changed app display name to 2048 Reimagined.",
        "Web version phased out in favor of the dedicated Android APK."
      ]
    },
    {
      version: "V2.0.2",
      title: "Navigation & General Improvements",
      changes: [
        "Added exit button with toggleable confirmation dialog.",
        "Redesigned Settings sheet with persistent header/footer for smooth scrolling.",
        "Added dedicated Changelog and Credits dialog boxes.",
        "Renamed Rainbow AMOLED theme to Pastel AMOLED.",
        "Fixed screen flickering on settings open."
      ]
    },
    {
      version: "V2.0.1",
      title: "Audio & Vibration Fixes",
      changes: [
        "Fixed vibrations not working on Android.",
        "Reduced Game Over sound volume and softened audio sweeps.",
        "Added customizable haptic strength settings (Off / Soft / Hard)."
      ]
    },
    {
      version: "V2.0.0",
      title: "Android APK Release",
      changes: [
        "Added native Android APK.",
        "Fullscreen immersive mode."
      ]
    },
    {
      version: "V1.0.0",
      title: "Initial Version (Web)",
      changes: [
        "Initial release of the 2048 Reimagined web engine.",
        "11 high-contrast visual themes.",
        "Hardware-accelerated animations with high refresh rate support (90Hz / 120Hz / 144Hz).",
        "Single-move undo system and particle burst effects on tile merges.",
        "Local state saving (auto-save board and high score)."
      ]
    }
  ];

  const CREDITS = [
    {
      category: "Development",
      items: [
        { role: "Code", name: "Farhan" },
        { role: "Testing", name: "Farhan" },
        { role: "Architecture", name: "Farhan" },
        { role: "Original 2048 Concept", name: "Gabriele Cirulli" }
      ]
    },
    {
      category: "Open Source",
      items: [
        { role: "GitHub", name: '<a href="https://github.com/farhan-real/2048-Reimagined" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color);text-decoration:underline;word-break:break-all;">github.com/farhan-real/2048-Reimagined</a>' }
      ]
    },
    {
      category: "Design & Sound",
      items: [
        { role: "App Icon", name: "Gemini" },
        { role: "Sound Effects (SFX)", name: "Gemini" }
      ]
    },
    {
      category: "Music Artists",
      items: [
        { name: "Dubmood" },
        { name: "Zabutom" },
        { name: "Jakim" },
        { name: "ko0x" },
        { name: "Moodmode" },
        { name: "Oxbow" },
        { name: "rez" },
        { name: "kenet" },
        { name: "Zalza" },
        { name: "Floppi" },
        { name: "0BiT" },
        { name: "GEAR" },
        { name: "SnD" }
      ]
    },
    {
      category: "Special Thanks",
      items: [
        { name: "Special thanks to all alpha & beta playtesters!" }
      ]
    }
  ];

  window.InfoData = {
    getChangelog: () => CHANGELOG,
    getCredits: () => CREDITS
  };
})();
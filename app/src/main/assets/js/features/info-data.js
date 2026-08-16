(function() {
  const CHANGELOG = [
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
        "11 high-contrast visual themes (Neon AMOLED, Cyberpunk, Synthwave, Terminal, Sakura Night, Classic Sand, etc.).",
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
        { name: "Floppi" }
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
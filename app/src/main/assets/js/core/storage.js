(function() {
  const KEYS = {
    BEST_SCORE: '2048_best',
    ACTIVE_STATE: '2048_active_state_reimagined',
    LEADERBOARD: '2048_leaderboard',
    MUSIC_SETTINGS: '2048_music_settings',
    SLIDE_SPEED: '2048_slide_speed',
    PART_LIFE: '2048_part_life',
    PART_DENSITY: '2048_part_density',
    VISUALIZER_BAR_COUNT: '2048_visualizer_bar_count',
    VISUALIZER_BOX_SIZE: '2048_visualizer_box_size',
    PARTICLES_ENABLED: '2048_particles_enabled',
    SOUND_ENABLED: '2048_sound_enabled',
    SFX_VOLUME: '2048_sfx_volume',
    MUSIC_VOLUME: '2048_music_volume',
    AUTOPLAY_MUSIC_ENABLED: '2048_autoplay_music_enabled',
    DETERMINISTIC_ENABLED: '2048_deterministic_enabled',
    CONFIRM_EXIT_ENABLED: '2048_confirm_exit_enabled',
    SHOW_TIMER_ENABLED: '2048_show_timer_enabled',
    ORIENTATION_MODE: '2048_orientation_mode',
    SLIDE_HAPTIC: '2048_slide_haptic_val',
    MERGE_HAPTIC: '2048_merge_haptic_val',
    POPUP_COLOR: '2048_popup_color'
  };

  const storage = {
    getBestScore: () => parseInt(localStorage.getItem(KEYS.BEST_SCORE)) || 0,
    setBestScore: (val) => localStorage.setItem(KEYS.BEST_SCORE, val.toString()),

    getGameState: () => {
      try {
        const stored = localStorage.getItem(KEYS.ACTIVE_STATE);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    },
    setGameState: (state) => localStorage.setItem(KEYS.ACTIVE_STATE, JSON.stringify(state)),

    getLeaderboard: () => {
      try {
        const stored = localStorage.getItem(KEYS.LEADERBOARD);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    },
    setLeaderboard: (data) => localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(data)),

    getMusicSettings: () => {
      try {
        const stored = localStorage.getItem(KEYS.MUSIC_SETTINGS);
        return stored ? JSON.parse(stored) : {
          enabledTrackIds: [],
          lastTrackIndex: 0,
          volume: 0.75,
          visualizerMode: "full",
          visualizerBoxSize: "medium",
          visualizerBarCount: 65,
          autoplayMusicEnabled: true
        };
      } catch {
        return {
          enabledTrackIds: [],
          lastTrackIndex: 0,
          volume: 0.75,
          visualizerMode: "full",
          visualizerBoxSize: "medium",
          visualizerBarCount: 65,
          autoplayMusicEnabled: true
        };
      }
    },
    saveMusicSettings: (settings) => localStorage.setItem(KEYS.MUSIC_SETTINGS, JSON.stringify(settings)),

    getSettings: () => {
      const music = storage.getMusicSettings();
      return {
        slideSpeed: localStorage.getItem(KEYS.SLIDE_SPEED) || "130",
        partLife: localStorage.getItem(KEYS.PART_LIFE) || "450",
        partDensity: localStorage.getItem(KEYS.PART_DENSITY) || "20",
        visualizerBarCount: music.visualizerBarCount !== undefined ? music.visualizerBarCount : 65,
        visualizerBoxSize: music.visualizerBoxSize || "medium",
        particlesEnabled: localStorage.getItem(KEYS.PARTICLES_ENABLED) !== "false",
        soundEnabled: localStorage.getItem(KEYS.SOUND_ENABLED) !== "false",
        sfxVolume: localStorage.getItem(KEYS.SFX_VOLUME) !== null ? parseInt(localStorage.getItem(KEYS.SFX_VOLUME)) : 80,
        musicVolume: localStorage.getItem(KEYS.MUSIC_VOLUME) !== null ? parseInt(localStorage.getItem(KEYS.MUSIC_VOLUME)) : 75,
        autoplayMusicEnabled: music.autoplayMusicEnabled !== false,
        deterministicEnabled: localStorage.getItem(KEYS.DETERMINISTIC_ENABLED) === "true",
        confirmExitEnabled: localStorage.getItem(KEYS.CONFIRM_EXIT_ENABLED) !== "false",
        showTimerEnabled: localStorage.getItem(KEYS.SHOW_TIMER_ENABLED) !== "false",
        orientationMode: localStorage.getItem(KEYS.ORIENTATION_MODE) || "auto",
        slideHaptic: localStorage.getItem(KEYS.SLIDE_HAPTIC) !== null ? parseInt(localStorage.getItem(KEYS.SLIDE_HAPTIC)) : 8,
        mergeHaptic: localStorage.getItem(KEYS.MERGE_HAPTIC) !== null ? parseInt(localStorage.getItem(KEYS.MERGE_HAPTIC)) : 18,
        popupColor: localStorage.getItem(KEYS.POPUP_COLOR) || "#00f0ff"
      };
    },

    saveSettings: (settings) => {
      localStorage.setItem(KEYS.SLIDE_SPEED, settings.slideSpeed);
      localStorage.setItem(KEYS.PART_LIFE, settings.partLife);
      localStorage.setItem(KEYS.PART_DENSITY, settings.partDensity);
      localStorage.setItem(KEYS.PARTICLES_ENABLED, settings.particlesEnabled);
      localStorage.setItem(KEYS.SOUND_ENABLED, settings.soundEnabled);
      localStorage.setItem(KEYS.SFX_VOLUME, settings.sfxVolume);
      localStorage.setItem(KEYS.MUSIC_VOLUME, settings.musicVolume);
      localStorage.setItem(KEYS.DETERMINISTIC_ENABLED, settings.deterministicEnabled);
      localStorage.setItem(KEYS.CONFIRM_EXIT_ENABLED, settings.confirmExitEnabled);
      localStorage.setItem(KEYS.SHOW_TIMER_ENABLED, settings.showTimerEnabled);
      localStorage.setItem(KEYS.ORIENTATION_MODE, settings.orientationMode || "auto");
      localStorage.setItem(KEYS.SLIDE_HAPTIC, settings.slideHaptic);
      localStorage.setItem(KEYS.MERGE_HAPTIC, settings.mergeHaptic);
      localStorage.setItem(KEYS.POPUP_COLOR, settings.popupColor);
    }
  };

  window.storage = storage;
})();
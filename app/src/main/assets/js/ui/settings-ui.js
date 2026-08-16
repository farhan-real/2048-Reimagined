(function() {
  class SettingsUI {
    constructor(parentUI) {
      this.parent = parentUI;
      this.popupColor = "#00f0ff";
      this.slideHapticVal = 8;
      this.mergeHapticVal = 18;

      this.initElements();
      this.setupEvents();
    }

    initElements() {
      this.slideSlider = document.getElementById('slider-slide-speed');
      this.partLifeSlider = document.getElementById('slider-part-life');
      this.partDensitySlider = document.getElementById('slider-part-density');
      this.lblSlideSpeed = document.getElementById('lbl-slide-speed');
      this.lblPartLife = document.getElementById('lbl-part-life');
      this.lblPartDensity = document.getElementById('lbl-part-density');

      // Volume Sliders
      this.sfxVolumeSlider = document.getElementById('slider-sfx-volume');
      this.musicVolumeSlider = document.getElementById('slider-settings-music-volume');
      this.lblSfxVolume = document.getElementById('lbl-sfx-volume');
      this.lblMusicVolume = document.getElementById('lbl-settings-music-volume');

      this.particlesCheckbox = document.getElementById('toggle-particles');
      this.soundCheckbox = document.getElementById('toggle-sound');
      this.deterministicCheckbox = document.getElementById('toggle-deterministic');
      this.confirmExitCheckbox = document.getElementById('toggle-confirm-exit');
      this.showTimerCheckbox = document.getElementById('toggle-show-timer');
    }

    setupEvents() {
      this.slideSlider.addEventListener('input', () => this.updateSliderLabels());
      this.partLifeSlider.addEventListener('input', () => this.updateSliderLabels());
      this.partDensitySlider.addEventListener('input', () => this.updateSliderLabels());
      this.showTimerCheckbox.addEventListener('change', () => this.applyTimerVisibility());

      if (this.sfxVolumeSlider) {
        this.sfxVolumeSlider.addEventListener('input', () => this.updateSfxVolume());
      }

      if (this.musicVolumeSlider) {
        this.musicVolumeSlider.addEventListener('input', () => this.updateMusicVolume());
      }

      this.setupHapticTabs();
      this.setupColorTabs();
    }

    updateSfxVolume() {
      const val = parseInt(this.sfxVolumeSlider.value) || 0;
      if (this.lblSfxVolume) this.lblSfxVolume.textContent = val + '%';
      if (window.sound) window.sound.setVolume(val / 100);
    }

    updateMusicVolume() {
      const val = parseInt(this.musicVolumeSlider.value) || 0;
      if (this.lblMusicVolume) this.lblMusicVolume.textContent = val + '%';
      if (window.musicEngine) window.musicEngine.setVolume(val / 100);

      const modalVol = document.getElementById('slider-music-volume');
      const modalBadge = document.getElementById('lbl-music-modal-volume');
      if (modalVol) modalVol.value = val;
      if (modalBadge) modalBadge.textContent = val + '%';
    }

    setupHapticTabs() {
      const bindGroup = (containerId, callback) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const buttons = container.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = parseInt(btn.getAttribute('data-val'));
            callback(val);
            this.parent.triggerHaptic(val);
          });
        });
      };

      bindGroup('group-haptic-slide', (v) => { this.slideHapticVal = v; });
      bindGroup('group-haptic-merge', (v) => { this.mergeHapticVal = v; });
    }

    setupColorTabs() {
      const container = document.getElementById('group-popup-color');
      if (!container) return;
      const buttons = container.querySelectorAll('.tab-btn');
      buttons.forEach(btn => {
        const col = btn.getAttribute('data-color');
        btn.style.color = col;
        btn.addEventListener('click', () => {
          this.popupColor = col;
          this.syncPopupColors();
        });
      });
    }

    syncPopupColors() {
      const container = document.getElementById('group-popup-color');
      if (!container) return;
      const buttons = container.querySelectorAll('.tab-btn');
      buttons.forEach(btn => {
        const col = btn.getAttribute('data-color');
        if (col === this.popupColor) {
          btn.classList.add('active');
          btn.style.backgroundColor = col;
          btn.style.color = '#000000';
          btn.style.boxShadow = `0 0 8px ${col}`;
        } else {
          btn.classList.remove('active');
          btn.style.backgroundColor = 'transparent';
          btn.style.color = col;
          btn.style.boxShadow = 'none';
        }
      });
    }

    updateSliderLabels() {
      const speed = parseInt(this.slideSlider.value);
      if (speed === 0) {
        this.lblSlideSpeed.textContent = "Instant (0ms)";
      } else if (speed <= 90) {
        this.lblSlideSpeed.textContent = `Snappy (${speed}ms)`;
      } else if (speed <= 180) {
        this.lblSlideSpeed.textContent = `Smooth (${speed}ms)`;
      } else if (speed <= 400) {
        this.lblSlideSpeed.textContent = `Chill (${speed}ms)`;
      } else {
        this.lblSlideSpeed.textContent = `Slow-Mo (${(speed / 1000).toFixed(1)}s)`;
      }
      document.documentElement.style.setProperty('--slide-speed', speed + 'ms');

      const life = parseInt(this.partLifeSlider.value);
      if (life <= 200) {
        this.lblPartLife.textContent = `Burst (${life}ms)`;
      } else if (life <= 500) {
        this.lblPartLife.textContent = `Normal (${life}ms)`;
      } else if (life <= 900) {
        this.lblPartLife.textContent = `Lingering (${life}ms)`;
      } else {
        this.lblPartLife.textContent = `Float (${(life / 1000).toFixed(1)}s)`;
      }

      const density = parseInt(this.partDensitySlider.value);
      if (density <= 15) {
        this.lblPartDensity.textContent = `Minimal (${density} qty)`;
      } else if (density <= 30) {
        this.lblPartDensity.textContent = `Default (${density} qty)`;
      } else if (density <= 60) {
        this.lblPartDensity.textContent = `High (${density} qty)`;
      } else {
        this.lblPartDensity.textContent = `Extreme (${density} qty)`;
      }
    }

    applyTimerVisibility() {
      const show = this.showTimerCheckbox.checked;
      if (show) {
        document.body.removeAttribute('data-hide-timer');
      } else {
        document.body.setAttribute('data-hide-timer', 'true');
      }
    }

    load() {
      const s = window.storage.getSettings();
      this.popupColor = s.popupColor;
      this.slideHapticVal = s.slideHaptic;
      this.mergeHapticVal = s.mergeHaptic;

      this.slideSlider.value = s.slideSpeed;
      this.partLifeSlider.value = s.partLife;
      this.partDensitySlider.value = s.partDensity;
      this.particlesCheckbox.checked = s.particlesEnabled;
      this.soundCheckbox.checked = s.soundEnabled;
      this.deterministicCheckbox.checked = s.deterministicEnabled;
      this.confirmExitCheckbox.checked = s.confirmExitEnabled;
      this.showTimerCheckbox.checked = s.showTimerEnabled;

      // Volume init
      const sfxVol = s.sfxVolume !== undefined ? s.sfxVolume : 80;
      const musicVol = s.musicVolume !== undefined ? s.musicVolume : 75;

      if (this.sfxVolumeSlider) {
        this.sfxVolumeSlider.value = sfxVol;
        if (this.lblSfxVolume) this.lblSfxVolume.textContent = sfxVol + '%';
      }
      if (this.musicVolumeSlider) {
        this.musicVolumeSlider.value = musicVol;
        if (this.lblMusicVolume) this.lblMusicVolume.textContent = musicVol + '%';
      }

      if (window.sound) {
        window.sound.enabled = s.soundEnabled;
        window.sound.setVolume(sfxVol / 100);
      }
      if (window.musicEngine) {
        window.musicEngine.setVolume(musicVol / 100);
      }

      this.updateSliderLabels();
      this.applyTimerVisibility();

      const syncTab = (containerId, value) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const buttons = container.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
          if (parseInt(btn.getAttribute('data-val')) === value) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      };

      syncTab('group-haptic-slide', this.slideHapticVal);
      syncTab('group-haptic-merge', this.mergeHapticVal);
      this.syncPopupColors();
    }

    save() {
      window.storage.saveSettings({
        slideSpeed: this.slideSlider.value,
        partLife: this.partLifeSlider.value,
        partDensity: this.partDensitySlider.value,
        particlesEnabled: this.particlesCheckbox.checked,
        soundEnabled: this.soundCheckbox.checked,
        sfxVolume: this.sfxVolumeSlider ? this.sfxVolumeSlider.value : 80,
        musicVolume: this.musicVolumeSlider ? this.musicVolumeSlider.value : 75,
        deterministicEnabled: this.deterministicCheckbox.checked,
        confirmExitEnabled: this.confirmExitCheckbox.checked,
        showTimerEnabled: this.showTimerCheckbox.checked,
        slideHaptic: this.slideHapticVal,
        mergeHaptic: this.mergeHapticVal,
        popupColor: this.popupColor
      });

      if (window.sound) window.sound.enabled = this.soundCheckbox.checked;
      this.applyTimerVisibility();
      document.documentElement.style.setProperty('--slide-speed', `${this.slideSlider.value}ms`);
    }
  }

  window.SettingsUI = SettingsUI;
})();
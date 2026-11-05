(function() {
  class MusicUI {
    constructor(parentUI) {
      this.parent = parentUI;
      this.tempSelectedTrackIds = [];

      this.musicModal = document.getElementById('modal-music');
      this.titleDisplay = document.getElementById('music-title-display');
      this.artistDisplay = document.getElementById('music-artist-display');
      this.landscapeTitle = document.getElementById('landscape-track-title');
      this.landscapeArtist = document.getElementById('landscape-track-artist');
      this.landscapeVinyl = document.getElementById('landscape-vinyl-disc');

      this.currentTimeEl = document.getElementById('music-current-time');
      this.durationEl = document.getElementById('music-duration');
      this.progressBar = document.getElementById('music-progress-bar');
      this.vinylDisc = document.getElementById('vinyl-disc');
      this.btnPlay = document.getElementById('btn-music-play');
      this.btnPrev = document.getElementById('btn-music-prev');
      this.btnNext = document.getElementById('btn-music-next');
      this.volumeSlider = document.getElementById('slider-music-volume');
      this.volumeBadge = document.getElementById('lbl-music-modal-volume');
      this.activeCountEl = document.getElementById('music-active-count');
      this.checklistContainer = document.getElementById('track-checkbox-list');

      this.visualizerBarsSlider = document.getElementById('slider-visualizer-bars');
      this.lblVisualizerBars = document.getElementById('lbl-visualizer-bars');
      this.autoplayMusicCheckbox = document.getElementById('toggle-autoplay-music');

      this.setupEvents();
      this.setupVisualizerTabs();
      this.setupBoxSizeTabs();
      this.setupBarsSlider();
      this.setupAutoplayToggle();
    }

    setupEvents() {
      this.btnPlay.addEventListener('click', () => { if (window.musicEngine) window.musicEngine.togglePlay(); });
      this.btnNext.addEventListener('click', () => { if (window.musicEngine) window.musicEngine.next(); });
      this.btnPrev.addEventListener('click', () => { if (window.musicEngine) window.musicEngine.prev(); });

      this.progressBar.addEventListener('input', (e) => {
        if (window.musicEngine) {
          window.musicEngine.isSeeking = true;
          window.musicEngine.seek(parseFloat(e.target.value) / 100);
        }
      });
      this.progressBar.addEventListener('change', () => { if (window.musicEngine) window.musicEngine.isSeeking = false; });

      if (this.volumeSlider) {
        this.volumeSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value) || 0;
          if (this.volumeBadge) this.volumeBadge.textContent = val + '%';
          if (window.musicEngine) window.musicEngine.setVolume(val / 100);

          const settingsVol = document.getElementById('slider-settings-music-volume');
          const settingsBadge = document.getElementById('lbl-settings-music-volume');
          if (settingsVol) settingsVol.value = val;
          if (settingsBadge) settingsBadge.textContent = val + '%';
        });
      }
    }

    setupBarsSlider() {
      if (!this.visualizerBarsSlider) return;
      this.visualizerBarsSlider.addEventListener('input', () => {
        const val = parseInt(this.visualizerBarsSlider.value);
        this.updateBarsLabel(val);
        if (window.musicEngine && window.musicEngine.visualizer) {
          window.musicEngine.visualizer.setBarCount(val);
          window.musicEngine.saveSettings();
        }
      });
    }

    updateBarsLabel(barCount) {
      if (!this.lblVisualizerBars) return;
      if (barCount <= 35) this.lblVisualizerBars.textContent = `Minimal (${barCount} bars)`;
      else if (barCount <= 55) this.lblVisualizerBars.textContent = `Normal (${barCount} bars)`;
      else if (barCount <= 85) this.lblVisualizerBars.textContent = `Dense (${barCount} bars)`;
      else this.lblVisualizerBars.textContent = `Extreme (${barCount} bars)`;
    }

    setupAutoplayToggle() {
      if (!this.autoplayMusicCheckbox) return;
      this.autoplayMusicCheckbox.addEventListener('change', () => {
        const current = window.storage.getMusicSettings();
        current.autoplayMusicEnabled = this.autoplayMusicCheckbox.checked;
        window.storage.saveMusicSettings(current);
      });
    }

    updateTrackInfo(track) {
      if (!track) return;
      if (this.titleDisplay) this.titleDisplay.textContent = track.title;
      if (this.artistDisplay) this.artistDisplay.textContent = track.artistText;
      if (this.landscapeTitle) this.landscapeTitle.textContent = track.title;
      if (this.landscapeArtist) this.landscapeArtist.textContent = track.artistText;
      if (this.activeCountEl && window.musicEngine) {
        this.activeCountEl.textContent = `${window.musicEngine.activePlaylist.length} active tracks`;
      }
    }

    updatePlayState(isPlaying) {
      if (this.vinylDisc) this.vinylDisc.classList.toggle('playing', isPlaying);
      if (this.landscapeVinyl) this.landscapeVinyl.classList.toggle('playing', isPlaying);
      if (this.btnPlay) {
        this.btnPlay.innerHTML = isPlaying
          ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>`
          : `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>`;
      }
    }

    updateProgress(currentTime, duration) {
      if (!this.musicModal || !this.musicModal.classList.contains('active')) return;
      if (duration > 0) this.progressBar.value = (currentTime / duration) * 100;
      else this.progressBar.value = 0;
      this.currentTimeEl.textContent = this.formatTime(currentTime);
      this.durationEl.textContent = this.formatTime(duration);
    }

    formatTime(sec) {
      if (!sec || isNaN(sec)) return "0:00";
      return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
    }

    renderChecklist() {
      if (!window.MusicData || !window.musicEngine) return;
      const allTracks = window.MusicData.getAvailableTracks();
      this.tempSelectedTrackIds = [...new Set(window.musicEngine.activePlaylist.map(t => t.id))];
      this.checklistContainer.innerHTML = "";

      allTracks.forEach(t => {
        const row = document.createElement('div');
        row.className = "track-select-item" + (this.tempSelectedTrackIds.includes(t.id) ? " selected" : "");
        row.innerHTML = `
          <div class="track-item-info"><span class="track-item-title">${t.title}</span><span class="track-item-artist">${t.artistText}</span></div>
          <label class="switch" style="pointer-events: none;"><input type="checkbox" ${this.tempSelectedTrackIds.includes(t.id) ? "checked" : ""}><span class="switch-slider"></span></label>
        `;
        row.addEventListener('click', () => {
          const input = row.querySelector('input');
          if (this.tempSelectedTrackIds.includes(t.id)) {
            this.tempSelectedTrackIds = this.tempSelectedTrackIds.filter(id => id !== t.id);
            input.checked = false;
            row.classList.remove('selected');
          } else {
            this.tempSelectedTrackIds.push(t.id);
            input.checked = true;
            row.classList.add('selected');
          }
        });
        this.checklistContainer.appendChild(row);
      });
    }

    setupVisualizerTabs() {
      const container = document.getElementById('group-visualizer-mode');
      if (!container) return;
      container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-mode');
          this.syncVisualizerTabs(mode);
          if (window.musicEngine) {
            window.musicEngine.visualizer.setMode(mode);
            window.musicEngine.saveSettings();
          }
        });
      });
    }

    syncVisualizerTabs(mode = "full") {
      const c = document.getElementById('group-visualizer-mode');
      if (!c) return;
      c.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-mode') === mode));
    }

    setupBoxSizeTabs() {
      const container = document.getElementById('group-visualizer-box-size');
      if (!container) return;
      container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const size = btn.getAttribute('data-size');
          this.syncBoxSizeTabs(size);
          if (window.musicEngine) {
            window.musicEngine.visualizer.setBoxSize(size);
            window.musicEngine.saveSettings();
          }
        });
      });
    }

    syncBoxSizeTabs(size = "medium") {
      const c = document.getElementById('group-visualizer-box-size');
      if (!c) return;
      c.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-size') === size));
    }

    syncAllMusicControls() {
      const s = window.storage.getMusicSettings();
      this.syncVisualizerTabs(s.visualizerMode || "full");
      this.syncBoxSizeTabs(s.visualizerBoxSize || "medium");
      if (this.visualizerBarsSlider) {
        this.visualizerBarsSlider.value = s.visualizerBarCount || 65;
        this.updateBarsLabel(s.visualizerBarCount || 65);
      }
      if (this.autoplayMusicCheckbox) this.autoplayMusicCheckbox.checked = s.autoplayMusicEnabled !== false;
    }
  }

  window.MusicUI = MusicUI;
})();
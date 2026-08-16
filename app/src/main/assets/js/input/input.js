(function() {
  class InputHandler {
    constructor(gameEngine, uiController) {
      this.engine = gameEngine;
      this.ui = uiController;

      this.touchStartX = 0;
      this.touchStartY = 0;
      this.swipeThreshold = 35;

      this.setupListeners();
      window.handleAndroidBack = () => this.handleBack();
    }

    setupListeners() {
      window.addEventListener('keydown', (e) => {
        if (this.isBlocked()) return;
        const matchedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyS", "KeyA", "KeyD"];
        if (matchedKeys.includes(e.code)) {
          e.preventDefault();
        }
        switch (e.code) {
          case 'ArrowLeft':  case 'KeyA': this.engine.move('left');  break;
          case 'ArrowRight': case 'KeyD': this.engine.move('right'); break;
          case 'ArrowUp':    case 'KeyW': this.engine.move('up');    break;
          case 'ArrowDown':  case 'KeyS': this.engine.move('down');  break;
        }
      });

      document.addEventListener('touchstart', (e) => {
        if (e.target.closest('button, select, input, .overlay, .modal-card, .theme-dropdown-list, .slider, .tab-btn, .switch')) {
          return;
        }
        if (e.touches.length > 1) return;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }, { passive: true });

      document.addEventListener('touchend', (e) => {
        if (e.target.closest('button, select, input, .overlay, .modal-card, .theme-dropdown-list, .slider, .tab-btn, .switch')) {
          return;
        }
        if (this.isBlocked()) return;

        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > this.swipeThreshold) {
          if (absX > absY) {
            if (dx > 0) this.engine.move('right'); else this.engine.move('left');
          } else {
            if (dy > 0) this.engine.move('down'); else this.engine.move('up');
          }
        }
      }, { passive: true });

      document.addEventListener('gesturestart', (e) => e.preventDefault());
    }

    isBlocked() {
      return this.engine.isMoving ||
             this.ui.gameoverOverlay.classList.contains('active') ||
             this.ui.settingsModal.classList.contains('active') ||
             this.ui.changelogModal.classList.contains('active') ||
             this.ui.creditsModal.classList.contains('active') ||
             this.ui.leaderboardModal.classList.contains('active') ||
             this.ui.musicModal.classList.contains('active') ||
             this.ui.trackSelectorModal.classList.contains('active') ||
             this.ui.confirmActionModal.classList.contains('active') ||
             this.ui.exitModal.classList.contains('active');
    }

    handleBack() {
      if (this.ui.confirmActionModal && this.ui.confirmActionModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.confirmActionModal);
        return true;
      }
      if (this.ui.trackSelectorModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.trackSelectorModal);
        return true;
      }
      if (this.ui.musicModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.musicModal);
        return true;
      }
      if (this.ui.leaderboardModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.leaderboardModal);
        return true;
      }
      if (this.ui.changelogModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.changelogModal);
        return true;
      }
      if (this.ui.creditsModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.creditsModal);
        return true;
      }
      if (this.ui.settingsModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.settingsModal);
        return true;
      }
      if (this.ui.exitModal.classList.contains('active')) {
        this.ui.closeModal(this.ui.exitModal);
        return true;
      }
      if (this.ui.theme && this.ui.theme.themeDropdownWrapper && this.ui.theme.themeDropdownWrapper.classList.contains('active')) {
        this.ui.theme.themeDropdownWrapper.classList.remove('active');
        return true;
      }
      this.ui.handleExitRequest();
      return true;
    }
  }

  window.InputHandler = InputHandler;
})();
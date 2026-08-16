(function() {
  class GameTimer {
    constructor(onTick) {
      this.onTick = onTick;
      this.accumulatedMs = 0;
      this.lastResumeTime = null;
      this.timerInterval = null;
      this.isRunning = false;
      this.isBlockedByModal = false;

      this.setupVisibilityListeners();
    }

    setupVisibilityListeners() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else if (!this.isBlockedByModal) {
          this.resume();
        }
      });

      window.addEventListener('blur', () => this.pause());
      window.addEventListener('focus', () => {
        if (!this.isBlockedByModal && !document.hidden) {
          this.resume();
        }
      });
    }

    start() {
      this.reset();
      this.resume();
    }

    resume() {
      if (this.isRunning || this.isBlockedByModal) return;
      this.isRunning = true;
      this.lastResumeTime = performance.now();

      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => this.tick(), 250);
      this.tick();
    }

    pause() {
      if (!this.isRunning) return;
      if (this.lastResumeTime !== null) {
        this.accumulatedMs += performance.now() - this.lastResumeTime;
        this.lastResumeTime = null;
      }
      this.isRunning = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.tick();
    }

    reset() {
      this.pause();
      this.accumulatedMs = 0;
      this.lastResumeTime = null;
      this.tick();
    }

    setModalBlock(blocked) {
      this.isBlockedByModal = blocked;
      if (blocked) {
        this.pause();
      } else if (!document.hidden) {
        this.resume();
      }
    }

    getElapsedMs() {
      let current = this.accumulatedMs;
      if (this.isRunning && this.lastResumeTime !== null) {
        current += performance.now() - this.lastResumeTime;
      }
      return current;
    }

    getElapsedSeconds() {
      return Math.floor(this.getElapsedMs() / 1000);
    }

    setTimeSeconds(seconds) {
      this.pause();
      this.accumulatedMs = Math.max(0, seconds) * 1000;
      this.lastResumeTime = null;
      this.tick();
    }

    tick() {
      const totalSec = this.getElapsedSeconds();
      const formatted = this.formatTime(totalSec);
      if (this.onTick) {
        this.onTick(formatted, totalSec);
      }
    }

    formatTime(totalSeconds) {
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = Math.floor(totalSeconds % 60);

      if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  window.GameTimer = GameTimer;
})();
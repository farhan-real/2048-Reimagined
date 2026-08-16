(function() {
  const sound = {
    ctx: null,
    enabled: true,
    volume: 0.8,

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
    },

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
    },

    playSlide() {
      if (!this.enabled || this.volume <= 0) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.1);

        const peak = 0.50 * this.volume;
        gain.gain.setValueAtTime(peak, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
      } catch (e) {}
    },

    playMerge() {
      if (!this.enabled || this.volume <= 0) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, this.ctx.currentTime);
        osc.frequency.setValueAtTime(420, this.ctx.currentTime + 0.05);

        const peak = 0.60 * this.volume;
        gain.gain.setValueAtTime(peak, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      } catch (e) {}
    },

    playGameOver() {
      if (!this.enabled || this.volume <= 0) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(210, this.ctx.currentTime + 0.4);

        const peak = 0.35 * this.volume;
        gain.gain.setValueAtTime(peak, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, this.ctx.currentTime + 0.4);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
      } catch (e) {}
    }
  };

  window.sound = sound;
})();
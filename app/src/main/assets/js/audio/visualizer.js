(function() {
  class MusicVisualizer {
    constructor() {
      this.canvasFull = document.getElementById('visualizer-full');
      this.canvasBox = document.getElementById('visualizer-box');
      this.canvasLandscape = document.getElementById('visualizer-landscape');
      this.ctxFull = this.canvasFull ? this.canvasFull.getContext('2d') : null;
      this.ctxBox = this.canvasBox ? this.canvasBox.getContext('2d') : null;
      this.ctxLandscape = this.canvasLandscape ? this.canvasLandscape.getContext('2d') : null;

      this.mode = "full";
      this.boxSize = "medium";
      this.barCount = 65;
      this.hueOffset = 0;
      this.lastTime = performance.now();
      this.lastFrameTime = 0;
      this.frameInterval = 40; // 25 FPS cap

      this.fullPeakHeights = [];
      this.boxPeakHeights = [];
      this.landscapePeakHeights = [];
      this.fullBarVariations = [];
      this.boxBarVariations = [];
      this.landscapeBarVariations = [];
      this.currentTrackId = "default";
      this.trackSeed = 1337;

      this.handleResize = () => this.resize();
      window.addEventListener('resize', this.handleResize);
      this.loadSettings();
      this.resize();
    }

    loadSettings() {
      if (window.storage) {
        const s = window.storage.getMusicSettings();
        this.barCount = s.visualizerBarCount || 65;
        this.boxSize = s.visualizerBoxSize || "medium";
      }
    }

    setBarCount(count) {
      this.barCount = Math.max(20, Math.min(120, count || 65));
      this.resetBuffers();
    }

    setBoxSize(size) {
      this.boxSize = size || "medium";
      document.body.setAttribute('data-box-size', this.boxSize);
      this.resize();
    }

    setMode(mode) {
      this.mode = mode || "full";
      document.body.setAttribute('data-visualizer-mode', this.mode);
      this.resize();
      if (this.mode === "off") this.clearAll();
    }

    setTrackSeed(seedStr) {
      if (!seedStr) return;
      this.currentTrackId = seedStr;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      this.trackSeed = Math.abs(hash) || 1337;
      this.resetBuffers();
    }

    resetBuffers() {
      this.fullPeakHeights = [];
      this.boxPeakHeights = [];
      this.landscapePeakHeights = [];
      this.fullBarVariations = [];
      this.boxBarVariations = [];
      this.landscapeBarVariations = [];
    }

    generateBarVariations(count, seed = 1337) {
      const variations = new Float32Array(count);
      let s = Math.abs(seed) || 1337;
      const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      rnd(); rnd();
      for (let i = 0; i < count; i++) {
        const fraction = i / Math.max(1, count - 1);
        const h1 = Math.sin(fraction * Math.PI * 4.6) * 0.05;
        const h2 = Math.cos(fraction * Math.PI * 9.2) * 0.04;
        const alt = (i % 2 === 0 ? 0.035 : -0.035);
        const jitter = (rnd() - 0.5) * 0.16;
        variations[i] = Math.max(0.82, Math.min(1.14, 1.0 + h1 + h2 + alt + jitter));
      }
      return variations;
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      if (this.canvasFull && this.ctxFull) {
        const r = this.canvasFull.getBoundingClientRect();
        this.canvasFull.width = (r.width || window.innerWidth) * dpr;
        this.canvasFull.height = 76 * dpr;
        this.ctxFull.scale(dpr, dpr);
      }
      if (this.canvasBox && this.ctxBox) {
        let baseW = 148, baseH = 70;
        if (this.boxSize === "small") { baseW = 112; baseH = 52; }
        else if (this.boxSize === "large") { baseW = 184; baseH = 86; }
        const r = this.canvasBox.getBoundingClientRect();
        this.canvasBox.width = (r.width || baseW) * dpr;
        this.canvasBox.height = (r.height || baseH) * dpr;
        this.ctxBox.scale(dpr, dpr);
      }
      if (this.canvasLandscape && this.ctxLandscape) {
        const r = this.canvasLandscape.getBoundingClientRect();
        this.canvasLandscape.width = (r.width || 250) * dpr;
        this.canvasLandscape.height = (r.height || 160) * dpr;
        this.ctxLandscape.scale(dpr, dpr);
      }
      this.resetBuffers();
    }

    start() {
      if (!this.animationFrameId && this.mode !== "off") {
        this.lastTime = performance.now();
        this.lastFrameTime = this.lastTime;
        this.loop();
      }
    }

    stop() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.clearAll();
    }

    clearAll() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      if (this.ctxFull && this.canvasFull) this.ctxFull.clearRect(0, 0, this.canvasFull.width / dpr, this.canvasFull.height / dpr);
      if (this.ctxBox && this.canvasBox) this.ctxBox.clearRect(0, 0, this.canvasBox.width / dpr, this.canvasBox.height / dpr);
      if (this.ctxLandscape && this.canvasLandscape) this.ctxLandscape.clearRect(0, 0, this.canvasLandscape.width / dpr, this.canvasLandscape.height / dpr);
      this.resetBuffers();
    }

    isLandscape() {
      const mode = document.body.getAttribute('data-orientation-mode');
      if (mode === 'landscape') return true;
      if (mode === 'portrait') return false;
      return window.innerWidth > window.innerHeight;
    }

    drawBar(ctx, x, y, width, height) {
      if (height <= 1 || width <= 0) return;
      const r = Math.min(width * 0.5, height * 0.5);
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x, y + r);
      if (r > 0.5) {
        ctx.arcTo(x, y, x + r, y, r);
        ctx.arcTo(x + width, y, x + width, y + r, r);
      } else {
        ctx.lineTo(x, y);
        ctx.lineTo(x + width, y);
      }
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();
    }

    renderSpectrum(ctx, canvas, count, dpr, dt, maxHeight, bottomOffset, peakBuffer, variationBuffer) {
      const w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      const slot = w / count, barWidth = Math.max(1.6, slot * 0.55), gap = slot - barWidth;

      const currentTime = (window.musicEngine && window.musicEngine.audio) ? window.musicEngine.audio.currentTime : 0;
      const trackId = (window.musicEngine && window.musicEngine.getCurrentTrack()) ? window.musicEngine.getCurrentTrack().id : this.currentTrackId;
      const bars = window.PrecompiledVisualizer.getBars(trackId, currentTime, count, variationBuffer);

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `hsla(${this.hueOffset}, 46%, 60%, 0.88)`);
      grad.addColorStop(0.55, `hsla(${(this.hueOffset + 25) % 360}, 42%, 52%, 0.5)`);
      grad.addColorStop(1, `hsla(${(this.hueOffset + 50) % 360}, 38%, 40%, 0.1)`);
      ctx.fillStyle = grad;

      for (let i = 0; i < count; i++) {
        const targetHeight = Math.max(3, bars[i] * maxHeight);
        peakBuffer[i] = targetHeight >= peakBuffer[i] ? targetHeight : Math.max(targetHeight, peakBuffer[i] - (h * 2.8 * dt));
        const barHeight = peakBuffer[i], x = i * slot + (gap / 2), y = h - bottomOffset - barHeight;
        this.drawBar(ctx, x, y, barWidth, barHeight);
      }
    }

    loop() {
      if (this.mode === "off") { this.stop(); return; }
      this.animationFrameId = requestAnimationFrame(() => this.loop());

      const now = performance.now();
      if (now - this.lastFrameTime < this.frameInterval) return;
      this.lastFrameTime = now;

      const dt = Math.min((now - this.lastTime) / 1000, 0.08);
      this.lastTime = now;
      this.hueOffset = (this.hueOffset + dt * 28) % 360;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);

      if (this.isLandscape() && this.ctxLandscape && this.canvasLandscape) {
        const count = Math.max(20, Math.min(60, Math.round((this.barCount || 65) * 0.6)));
        if (this.landscapePeakHeights.length !== count) this.landscapePeakHeights = new Float32Array(count);
        if (!this.landscapeBarVariations || this.landscapeBarVariations.length !== count) this.landscapeBarVariations = this.generateBarVariations(count, this.trackSeed);
        this.renderSpectrum(this.ctxLandscape, this.canvasLandscape, count, dpr, dt, (this.canvasLandscape.height / dpr) - 12, 2, this.landscapePeakHeights, this.landscapeBarVariations);
      } else if (this.mode === "full" && this.ctxFull && this.canvasFull) {
        const count = this.barCount || 65;
        if (this.fullPeakHeights.length !== count) this.fullPeakHeights = new Float32Array(count);
        if (!this.fullBarVariations || this.fullBarVariations.length !== count) this.fullBarVariations = this.generateBarVariations(count, this.trackSeed);
        this.renderSpectrum(this.ctxFull, this.canvasFull, count, dpr, dt, (this.canvasFull.height / dpr) - 14, 0, this.fullPeakHeights, this.fullBarVariations);
      } else if (this.mode === "box" && this.ctxBox && this.canvasBox) {
        let ratio = this.boxSize === "small" ? 0.32 : this.boxSize === "large" ? 0.44 : 0.38;
        const count = Math.max(14, Math.min(48, Math.round((this.barCount || 65) * ratio)));
        if (this.boxPeakHeights.length !== count) this.boxPeakHeights = new Float32Array(count);
        if (!this.boxBarVariations || this.boxBarVariations.length !== count) this.boxBarVariations = this.generateBarVariations(count, this.trackSeed);
        this.renderSpectrum(this.ctxBox, this.canvasBox, count, dpr, dt, (this.canvasBox.height / dpr) - 12, 4, this.boxPeakHeights, this.boxBarVariations);
      }
    }
  }

  window.MusicVisualizer = MusicVisualizer;
})();
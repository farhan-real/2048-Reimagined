(function() {
  class MusicVisualizer {
    constructor() {
      this.canvasFull = document.getElementById('visualizer-full');
      this.canvasBox = document.getElementById('visualizer-box');
      this.canvasLandscape = document.getElementById('visualizer-landscape');
      this.ctxFull = this.canvasFull ? this.canvasFull.getContext('2d') : null;
      this.ctxBox = this.canvasBox ? this.canvasBox.getContext('2d') : null;
      this.ctxLandscape = this.canvasLandscape ? this.canvasLandscape.getContext('2d') : null;

      this.analyser = null;
      this.dataArray = null;
      this.animationFrameId = null;
      this.mode = "full";
      this.boxSize = "medium";
      this.barCount = 65;
      this.hueOffset = 0;
      this.lastTime = performance.now();
      this.lastFrameTime = 0;
      this.frameInterval = 40; // 1000ms / 25 FPS = 40ms

      this.fullPeakHeights = [];
      this.boxPeakHeights = [];
      this.landscapePeakHeights = [];
      this.fullBarVariations = [];
      this.boxBarVariations = [];
      this.landscapeBarVariations = [];
      this.trackSeed = 1337;

      this.rawBuffer = null;
      this.expandedBuffer = null;
      this.smoothedBuffer = null;

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

    setAnalyser(analyserNode) {
      this.analyser = analyserNode;
      if (this.analyser) {
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.12;
        this.analyser.minDecibels = -95;
        this.analyser.maxDecibels = -15;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    }

    setMode(mode) {
      this.mode = mode || "full";
      document.body.setAttribute('data-visualizer-mode', this.mode);
      this.resize();
      if (this.mode === "off") this.clearAll();
    }

    setTrackSeed(seedStr) {
      if (!seedStr) return;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      this.trackSeed = Math.abs(hash) || 1337;
      this.fullBarVariations = [];
      this.boxBarVariations = [];
      this.landscapeBarVariations = [];
    }

    resetBuffers() {
      this.fullPeakHeights = [];
      this.boxPeakHeights = [];
      this.landscapePeakHeights = [];
      this.fullBarVariations = [];
      this.boxBarVariations = [];
      this.landscapeBarVariations = [];
      this.rawBuffer = null;
      this.expandedBuffer = null;
      this.smoothedBuffer = null;
    }

    generateBarVariations(count, seed = 1337) {
      const variations = new Float32Array(count);
      let s = Math.abs(seed) || 1337;
      const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      rnd(); rnd(); rnd();

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
      this.fullPeakHeights = [];
      this.boxPeakHeights = [];
      this.landscapePeakHeights = [];
    }

    sampleFrequencies(count, treblePow, trebleMult, boost) {
      const minBin = 2, maxBin = Math.min(56, this.dataArray.length - 1);
      if (!this.rawBuffer || this.rawBuffer.length !== count) this.rawBuffer = new Float32Array(count);
      if (!this.expandedBuffer || this.expandedBuffer.length !== count) this.expandedBuffer = new Float32Array(count);

      let minFloor = 1.0, maxPeak = 0.0;
      for (let i = 0; i < count; i++) {
        const frac = i / Math.max(1, count - 1);
        const binIndex = minBin + Math.floor(Math.pow(frac, 1.25) * (maxBin - minBin));
        let sum = 0;
        for (let b = -1; b <= 1; b++) sum += this.dataArray[Math.max(minBin, Math.min(maxBin, binIndex + b))];
        const val = (sum / 3) / 255;
        const energy = Math.min(1.0, val * (1.0 + Math.pow(frac, treblePow) * trebleMult));
        this.rawBuffer[i] = energy;
        if (energy < minFloor) minFloor = energy;
        if (energy > maxPeak) maxPeak = energy;
      }

      const range = Math.max(0.15, maxPeak - (minFloor * 0.8));
      for (let i = 0; i < count; i++) {
        this.expandedBuffer[i] = Math.min(1.0, Math.pow(Math.max(0, (this.rawBuffer[i] - (minFloor * 0.8)) / range), 1.05) * boost);
      }
      return this.expandedBuffer;
    }

    smoothFrequencies(expanded, count) {
      if (!this.smoothedBuffer || this.smoothedBuffer.length !== count) this.smoothedBuffer = new Float32Array(count);
      const weights = [0.12, 0.24, 0.28, 0.24, 0.12];
      for (let i = 0; i < count; i++) {
        let sum = 0, wSum = 0;
        for (let offset = -2; offset <= 2; offset++) {
          const idx = i + offset;
          if (idx >= 0 && idx < count) {
            sum += expanded[idx] * weights[offset + 2];
            wSum += weights[offset + 2];
          }
        }
        this.smoothedBuffer[i] = sum / wSum;
      }
      return this.smoothedBuffer;
    }

    isLandscape() {
      const mode = document.body.getAttribute('data-orientation-mode');
      if (mode === 'landscape') return true;
      if (mode === 'portrait') return false;
      return window.innerWidth > window.innerHeight;
    }

    renderFull(dpr, dt) {
      const w = this.canvasFull.width / dpr, h = this.canvasFull.height / dpr;
      this.ctxFull.clearRect(0, 0, w, h);
      const count = this.barCount || 65, slot = w / count, barWidth = Math.max(1.6, slot * 0.55), gap = slot - barWidth;
      const smoothed = this.smoothFrequencies(this.sampleFrequencies(count, 0.7, 1.5, 1.35), count);

      if (this.fullPeakHeights.length !== count) this.fullPeakHeights = new Float32Array(count);
      if (!this.fullBarVariations || this.fullBarVariations.length !== count) this.fullBarVariations = this.generateBarVariations(count, this.trackSeed);

      const grad = this.ctxFull.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `hsla(${this.hueOffset}, 44%, 60%, 0.85)`);
      grad.addColorStop(0.5, `hsla(${(this.hueOffset + 20) % 360}, 40%, 52%, 0.45)`);
      grad.addColorStop(1, `hsla(${(this.hueOffset + 40) % 360}, 36%, 40%, 0.08)`);
      this.ctxFull.fillStyle = grad;
      this.ctxFull.beginPath();

      for (let i = 0; i < count; i++) {
        const normX = (i - count / 2) / (count / 2);
        const bellCurve = 0.20 + 0.80 * Math.exp(-Math.pow(normX / 0.56, 2));
        const targetHeight = Math.max(4, Math.min(h - 4, smoothed[i] * (h - 14) * bellCurve * (this.fullBarVariations[i] || 1.0)));
        this.fullPeakHeights[i] = targetHeight >= this.fullPeakHeights[i] ? targetHeight : Math.max(targetHeight, this.fullPeakHeights[i] - (h * 2.8 * dt));

        const barHeight = this.fullPeakHeights[i], x = i * slot + (gap / 2), y = h - barHeight;
        this.ctxFull.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0]);
      }
      this.ctxFull.fill();
    }

    renderLandscape(dpr, dt) {
      const w = this.canvasLandscape.width / dpr, h = this.canvasLandscape.height / dpr;
      this.ctxLandscape.clearRect(0, 0, w, h);
      const count = Math.max(20, Math.min(60, Math.round((this.barCount || 65) * 0.6)));
      const slot = w / count, barWidth = Math.max(2, slot * 0.58), gap = slot - barWidth;
      const smoothed = this.smoothFrequencies(this.sampleFrequencies(count, 0.7, 1.4, 1.3), count);

      if (this.landscapePeakHeights.length !== count) this.landscapePeakHeights = new Float32Array(count);
      if (!this.landscapeBarVariations || this.landscapeBarVariations.length !== count) this.landscapeBarVariations = this.generateBarVariations(count, this.trackSeed);

      const grad = this.ctxLandscape.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `hsla(${this.hueOffset}, 48%, 62%, 0.88)`);
      grad.addColorStop(0.6, `hsla(${(this.hueOffset + 25) % 360}, 42%, 52%, 0.5)`);
      grad.addColorStop(1, `hsla(${(this.hueOffset + 50) % 360}, 38%, 40%, 0.12)`);
      this.ctxLandscape.fillStyle = grad;
      this.ctxLandscape.beginPath();

      for (let i = 0; i < count; i++) {
        const normX = (i - count / 2) / (count / 2);
        const bellCurve = 0.25 + 0.75 * Math.exp(-Math.pow(normX / 0.60, 2));
        const targetHeight = Math.max(4, Math.min(h - 6, smoothed[i] * (h - 12) * bellCurve * (this.landscapeBarVariations[i] || 1.0)));
        this.landscapePeakHeights[i] = targetHeight >= this.landscapePeakHeights[i] ? targetHeight : Math.max(targetHeight, this.landscapePeakHeights[i] - (h * 2.8 * dt));

        const barHeight = this.landscapePeakHeights[i], x = i * slot + (gap / 2), y = h - 2 - barHeight;
        this.ctxLandscape.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 1, 1]);
      }
      this.ctxLandscape.fill();
    }

    loop() {
      if (this.mode === "off") { this.stop(); return; }
      this.animationFrameId = requestAnimationFrame(() => this.loop());
      if (!this.analyser || !this.dataArray) return;

      const now = performance.now();
      if (now - this.lastFrameTime < this.frameInterval) return;
      this.lastFrameTime = now;

      const dt = Math.min((now - this.lastTime) / 1000, 0.08);
      this.lastTime = now;
      this.hueOffset = (this.hueOffset + dt * 28) % 360;
      this.analyser.getByteFrequencyData(this.dataArray);
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);

      if (this.isLandscape()) {
        if (this.ctxLandscape && this.canvasLandscape) this.renderLandscape(dpr, dt);
      } else if (this.mode === "full" && this.ctxFull && this.canvasFull) {
        this.renderFull(dpr, dt);
      }
    }
  }

  window.MusicVisualizer = MusicVisualizer;
})();
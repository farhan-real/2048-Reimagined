(function() {
  class MusicVisualizer {
    constructor() {
      this.canvasFull = document.getElementById('visualizer-full');
      this.canvasBox = document.getElementById('visualizer-box');
      this.ctxFull = this.canvasFull ? this.canvasFull.getContext('2d') : null;
      this.ctxBox = this.canvasBox ? this.canvasBox.getContext('2d') : null;

      this.analyser = null;
      this.dataArray = null;
      this.animationFrameId = null;
      this.mode = "full";
      this.boxSize = "medium";
      this.barCount = 65;
      this.hueOffset = 0;
      this.lastTime = performance.now();

      // Fast-Attack & Gravity Decay physics buffers (replaces sluggish averaging)
      this.fullPeakHeights = [];
      this.boxPeakHeights = [];

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
      this.fullPeakHeights = [];
      this.boxPeakHeights = [];
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
        this.analyser.smoothingTimeConstant = 0.12; // Ultra-snappy attack, no sluggish smoothing
        this.analyser.minDecibels = -95;
        this.analyser.maxDecibels = -15;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
      }
    }

    setMode(mode) {
      this.mode = mode || "full";
      document.body.setAttribute('data-visualizer-mode', this.mode);
      this.resize();
      if (this.mode === "off") {
        this.clearAll();
      }
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      if (this.canvasFull && this.ctxFull) {
        const rect = this.canvasFull.getBoundingClientRect();
        this.canvasFull.width = (rect.width || window.innerWidth) * dpr;
        this.canvasFull.height = 76 * dpr;
        this.ctxFull.scale(dpr, dpr);
      }

      if (this.canvasBox && this.ctxBox) {
        let baseW = 148, baseH = 70;
        if (this.boxSize === "small") {
          baseW = 112; baseH = 52;
        } else if (this.boxSize === "large") {
          baseW = 184; baseH = 86;
        }

        const rect = this.canvasBox.getBoundingClientRect();
        this.canvasBox.width = (rect.width || baseW) * dpr;
        this.canvasBox.height = (rect.height || baseH) * dpr;
        this.ctxBox.scale(dpr, dpr);
      }
      this.fullPeakHeights = [];
      this.boxPeakHeights = [];
    }

    start() {
      if (!this.animationFrameId && this.mode !== "off") {
        this.lastTime = performance.now();
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
      const dpr = window.devicePixelRatio || 1;
      if (this.ctxFull && this.canvasFull) {
        this.ctxFull.clearRect(0, 0, this.canvasFull.width / dpr, this.canvasFull.height / dpr);
      }
      if (this.ctxBox && this.canvasBox) {
        this.ctxBox.clearRect(0, 0, this.canvasBox.width / dpr, this.canvasBox.height / dpr);
      }
    }

    loop() {
      if (this.mode === "off") {
        this.stop();
        return;
      }

      this.animationFrameId = requestAnimationFrame(() => this.loop());
      if (!this.analyser || !this.dataArray) return;

      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.hueOffset = (this.hueOffset + dt * 28) % 360;

      this.analyser.getByteFrequencyData(this.dataArray);
      const dpr = window.devicePixelRatio || 1;

      // Active musical frequencies (skipping DC offset bin 0 and empty >10kHz bins)
      const minBin = 2;
      const maxBin = Math.min(56, this.dataArray.length - 1);

      if (this.mode === "full" && this.ctxFull && this.canvasFull) {
        const width = this.canvasFull.width / dpr;
        const height = this.canvasFull.height / dpr;
        this.ctxFull.clearRect(0, 0, width, height);

        const count = this.barCount || 65;
        const slot = width / count;
        const barWidth = Math.max(1.6, slot * 0.55);
        const gap = slot - barWidth;
        const topMargin = 12; // Headroom to prevent top clipping
        const maxUsableHeight = height - topMargin;
        const decaySpeed = height * 2.8; // Gravity drop speed (pixels/second)

        // 1. Raw Acoustic Sampling with Frequency Compensation
        const rawBars = new Float32Array(count);
        let minFloor = 1.0;
        let maxPeak = 0.0;

        for (let i = 0; i < count; i++) {
          const fraction = i / (count - 1);
          const binIndex = minBin + Math.floor(Math.pow(fraction, 1.25) * (maxBin - minBin));

          let rawSum = 0;
          for (let b = -1; b <= 1; b++) {
            const idx = Math.max(minBin, Math.min(maxBin, binIndex + b));
            rawSum += this.dataArray[idx];
          }
          const rawVal = (rawSum / 3) / 255;
          const trebleBoost = 1.0 + Math.pow(fraction, 0.7) * 1.5;
          const energy = Math.min(1.0, rawVal * trebleBoost);

          rawBars[i] = energy;
          if (energy < minFloor) minFloor = energy;
          if (energy > maxPeak) maxPeak = energy;
        }

        // 2. Dynamic Contrast Expansion: makes constant-volume chiptunes (Keygen 31, Colorful Troupe) bounce dynamically
        const range = Math.max(0.15, maxPeak - (minFloor * 0.8));
        const expandedBars = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          const normalized = Math.max(0, (rawBars[i] - (minFloor * 0.8)) / range);
          expandedBars[i] = Math.min(1.0, Math.pow(normalized, 1.05) * 1.35);
        }

        // 3. Smooth Gaussian spatial filter (smooth flowing curve, no jagged mountain spikes)
        const smoothedBars = new Float32Array(count);
        const weights = [0.12, 0.24, 0.28, 0.24, 0.12];
        for (let i = 0; i < count; i++) {
          let sum = 0, wSum = 0;
          for (let offset = -2; offset <= 2; offset++) {
            const idx = i + offset;
            if (idx >= 0 && idx < count) {
              const w = weights[offset + 2];
              sum += expandedBars[idx] * w;
              wSum += w;
            }
          }
          smoothedBars[i] = sum / wSum;
        }

        if (this.fullPeakHeights.length !== count) {
          this.fullPeakHeights = new Float32Array(count);
        }

        // 4. Gaussian Bell Curve Envelope & Fast-Attack / Gravity Decay Physics
        for (let i = 0; i < count; i++) {
          const fraction = i / (count - 1);
          const normX = (i - count / 2) / (count / 2); // -1.0 to +1.0

          // Bell curve: center rises high, flanks taper smoothly
          const bellCurve = 0.20 + 0.80 * Math.exp(-Math.pow(normX / 0.56, 2));
          const targetHeight = Math.max(4, Math.min(maxUsableHeight, smoothedBars[i] * bellCurve * maxUsableHeight));

          // Fast-Attack / Gravity Decay physics
          if (targetHeight >= this.fullPeakHeights[i]) {
            this.fullPeakHeights[i] = targetHeight; // Instant snap on note attack
          } else {
            this.fullPeakHeights[i] = Math.max(targetHeight, this.fullPeakHeights[i] - (decaySpeed * dt));
          }

          const barHeight = this.fullPeakHeights[i];
          const x = i * slot + (gap / 2);
          const y = height - barHeight;

          // Muted, non-jarring pastel rainbow gradient
          const hue = (this.hueOffset + fraction * 300) % 360;
          const grad = this.ctxFull.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, `hsla(${hue}, 44%, 60%, 0.85)`);
          grad.addColorStop(0.5, `hsla(${(hue + 20) % 360}, 40%, 52%, 0.45)`);
          grad.addColorStop(1, `hsla(${(hue + 40) % 360}, 36%, 40%, 0.08)`);

          this.ctxFull.fillStyle = grad;
          this.ctxFull.beginPath();
          this.ctxFull.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0]);
          this.ctxFull.fill();
        }

      } else if (this.mode === "box" && this.ctxBox && this.canvasBox) {
        const width = this.canvasBox.width / dpr;
        const height = this.canvasBox.height / dpr;
        this.ctxBox.clearRect(0, 0, width, height);

        let countRatio = 0.38;
        if (this.boxSize === "small") countRatio = 0.32;
        if (this.boxSize === "large") countRatio = 0.44;

        const count = Math.max(14, Math.min(48, Math.round((this.barCount || 65) * countRatio)));
        const slot = width / count;
        const barWidth = Math.max(1.8, slot * 0.55);
        const gap = slot - barWidth;
        const topMargin = 8;
        const maxUsableHeight = height - topMargin;
        const decaySpeed = height * 2.8;

        const rawBars = new Float32Array(count);
        let minFloor = 1.0, maxPeak = 0.0;

        for (let i = 0; i < count; i++) {
          const fraction = i / (count - 1);
          const binIndex = minBin + Math.floor(Math.pow(fraction, 1.25) * (maxBin - minBin));
          let rawSum = 0;
          for (let b = -1; b <= 1; b++) {
            const idx = Math.max(minBin, Math.min(maxBin, binIndex + b));
            rawSum += this.dataArray[idx];
          }
          const rawVal = (rawSum / 3) / 255;
          const trebleBoost = 1.0 + Math.pow(fraction, 0.7) * 1.4;
          const energy = Math.min(1.0, rawVal * trebleBoost);
          rawBars[i] = energy;
          if (energy < minFloor) minFloor = energy;
          if (energy > maxPeak) maxPeak = energy;
        }

        const range = Math.max(0.15, maxPeak - (minFloor * 0.8));
        const expandedBars = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          const normalized = Math.max(0, (rawBars[i] - (minFloor * 0.8)) / range);
          expandedBars[i] = Math.min(1.0, Math.pow(normalized, 1.05) * 1.3);
        }

        if (this.boxPeakHeights.length !== count) {
          this.boxPeakHeights = new Float32Array(count);
        }

        for (let i = 0; i < count; i++) {
          const fraction = i / (count - 1);
          const normX = (i - count / 2) / (count / 2);
          const bellCurve = 0.22 + 0.78 * Math.exp(-Math.pow(normX / 0.58, 2));

          const targetHeight = Math.max(4, Math.min(maxUsableHeight, expandedBars[i] * bellCurve * maxUsableHeight));

          if (targetHeight >= this.boxPeakHeights[i]) {
            this.boxPeakHeights[i] = targetHeight;
          } else {
            this.boxPeakHeights[i] = Math.max(targetHeight, this.boxPeakHeights[i] - (decaySpeed * dt));
          }

          const barHeight = this.boxPeakHeights[i];
          const x = i * slot + (gap / 2);
          const y = height - 4 - barHeight;

          const hue = (this.hueOffset + fraction * 300) % 360;
          const grad = this.ctxBox.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, `hsla(${hue}, 44%, 60%, 0.85)`);
          grad.addColorStop(0.6, `hsla(${(hue + 25) % 360}, 40%, 50%, 0.45)`);
          grad.addColorStop(1, `hsla(${(hue + 50) % 360}, 36%, 38%, 0.1)`);

          this.ctxBox.fillStyle = grad;
          this.ctxBox.beginPath();
          this.ctxBox.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 1, 1]);
          this.ctxBox.fill();
        }
      }
    }
  }

  window.MusicVisualizer = MusicVisualizer;
})();
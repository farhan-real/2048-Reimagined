(function() {
  class PrecompiledVisualizer {
    constructor() {
      this.cache = new Map();
      this.isReady = false;
      this.init();
    }

    init() {
      if (window.MusicData && typeof window.MusicData.getAvailableTracks === 'function') {
        const tracks = window.MusicData.getAvailableTracks();
        tracks.forEach(track => this.precompileTrack(track.id));
      }
      this.isReady = true;
    }

    hashString(str) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        h += h << 13; h ^= h >>> 7;
      }
      return (h >>> 0);
    }

    precompileTrack(trackId) {
      if (this.cache.has(trackId)) return;

      const seed = this.hashString(trackId);
      const bpm = 120 + (seed % 35); // 120 - 154 BPM
      const beatSec = 60 / bpm;
      const totalSeconds = 240; // 4 minutes coverage
      const sampleRate = 4; // 4 frames per second
      const totalFrames = totalSeconds * sampleRate;
      const bands = 16;
      const data = new Float32Array(totalFrames * bands);

      let s = seed;
      const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      rnd(); rnd();

      for (let f = 0; f < totalFrames; f++) {
        const t = f / sampleRate;
        const beatPos = (t % beatSec) / beatSec;
        const kickPulse = Math.exp(-beatPos * 7.5);
        const snarePulse = ((Math.floor(t / beatSec) % 2) === 1) ? Math.exp(-beatPos * 5.0) : 0;
        const hihatPulse = Math.exp(-((t % (beatSec / 2)) / (beatSec / 2)) * 9.0) * 0.45;
        const measureProgress = (t % (beatSec * 16)) / (beatSec * 16);
        const energyRise = 0.55 + 0.45 * Math.sin(measureProgress * Math.PI);

        for (let b = 0; b < bands; b++) {
          const bandNorm = b / (bands - 1);
          let energy = 0.08;

          if (b < 4) {
            energy += kickPulse * (1.0 - b * 0.18) * 0.85;
          } else if (b < 10) {
            const arpHue = Math.sin((t * 8.0) + (b * 0.75));
            energy += Math.max(0, arpHue) * 0.55 * energyRise;
            energy += snarePulse * 0.40;
          } else {
            energy += hihatPulse * (0.6 + (b - 10) * 0.07);
          }

          const noise = (rnd() - 0.5) * 0.08;
          const finalVal = Math.max(0.04, Math.min(1.0, (energy + noise) * energyRise));
          data[f * bands + b] = finalVal;
        }
      }

      this.cache.set(trackId, { data, totalFrames, sampleRate, bands });
    }

    getBars(trackId, timeSeconds, count, variations) {
      if (!this.cache.has(trackId)) {
        this.precompileTrack(trackId);
      }

      const track = this.cache.get(trackId);
      const out = new Float32Array(count);
      if (!track) return out;

      const safeTime = Math.max(0, timeSeconds);
      const exactFrame = safeTime * track.sampleRate;
      const f1 = Math.min(Math.floor(exactFrame), track.totalFrames - 1);
      const f2 = Math.min(f1 + 1, track.totalFrames - 1);
      const alpha = exactFrame - f1;

      for (let i = 0; i < count; i++) {
        const fraction = i / Math.max(1, count - 1);
        const normX = (i - count / 2) / (count / 2);
        const bellCurve = 0.22 + 0.78 * Math.exp(-Math.pow(normX / 0.58, 2));

        const bandPos = fraction * (track.bands - 1);
        const b1 = Math.floor(bandPos);
        const b2 = Math.min(b1 + 1, track.bands - 1);
        const bAlpha = bandPos - b1;

        const val1 = track.data[f1 * track.bands + b1] * (1 - bAlpha) + track.data[f1 * track.bands + b2] * bAlpha;
        const val2 = track.data[f2 * track.bands + b1] * (1 - bAlpha) + track.data[f2 * track.bands + b2] * bAlpha;
        const energy = val1 * (1 - alpha) + val2 * alpha;

        const variation = (variations && variations[i]) ? variations[i] : 1.0;
        out[i] = Math.max(0.05, Math.min(1.0, energy * bellCurve * variation));
      }

      return out;
    }
  }

  window.PrecompiledVisualizer = new PrecompiledVisualizer();
})();
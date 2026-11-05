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
      const bpm = 124 + (seed % 30);
      const beatSec = 60 / bpm;
      const totalSeconds = 240;
      const sampleRate = 4;
      const totalFrames = totalSeconds * sampleRate;
      const bands = 16;
      const data = new Float32Array(totalFrames * bands);

      let s = seed;
      const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      rnd(); rnd();

      for (let f = 0; f < totalFrames; f++) {
        const t = f / sampleRate;
        const beatPos = (t % beatSec) / beatSec;
        const kickPulse = Math.exp(-beatPos * 4.8);
        const snarePulse = ((Math.floor(t / beatSec) % 2) === 1) ? Math.exp(-beatPos * 3.8) : 0;
        const hihatPulse = Math.exp(-((t % (beatSec / 2)) / (beatSec / 2)) * 6.5) * 0.7;
        const measureProgress = (t % (beatSec * 16)) / (beatSec * 16);
        const energyRise = 0.75 + 0.25 * Math.sin(measureProgress * Math.PI);

        for (let b = 0; b < bands; b++) {
          let energy = 0.18;

          if (b < 4) {
            energy += kickPulse * (1.1 - b * 0.15) * 0.95;
          } else if (b < 10) {
            const arpHue = Math.sin((t * 7.5) + (b * 0.85));
            energy += (Math.max(0, arpHue) * 0.7 + 0.15) * energyRise;
            energy += snarePulse * 0.55;
          } else {
            energy += hihatPulse * (0.75 + (b - 10) * 0.08);
          }

          const noise = (rnd() - 0.5) * 0.06;
          const finalVal = Math.max(0.12, Math.min(1.0, (energy + noise) * energyRise));
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
        const bellCurve = 0.35 + 0.65 * Math.exp(-Math.pow(normX / 0.62, 2));

        const bandPos = fraction * (track.bands - 1);
        const b1 = Math.floor(bandPos);
        const b2 = Math.min(b1 + 1, track.bands - 1);
        const bAlpha = bandPos - b1;

        const val1 = track.data[f1 * track.bands + b1] * (1 - bAlpha) + track.data[f1 * track.bands + b2] * bAlpha;
        const val2 = track.data[f2 * track.bands + b1] * (1 - bAlpha) + track.data[f2 * track.bands + b2] * bAlpha;
        const rawEnergy = val1 * (1 - alpha) + val2 * alpha;

        const boosted = Math.min(1.0, Math.pow(rawEnergy, 0.75) * 1.35);
        const variation = (variations && variations[i]) ? variations[i] : 1.0;
        out[i] = Math.max(0.08, Math.min(1.0, boosted * bellCurve * variation));
      }

      return out;
    }
  }

  window.PrecompiledVisualizer = new PrecompiledVisualizer();
})();
(function() {
  class PrecompiledVisualizer {
    constructor() {
      this.trackSeeds = new Map();
      this.init();
    }

    init() {
      if (window.MusicData && typeof window.MusicData.getAvailableTracks === 'function') {
        const tracks = window.MusicData.getAvailableTracks();
        tracks.forEach(track => this.registerTrack(track.id));
      }
    }

    hashString(str) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        h += h << 13; h ^= h >>> 7;
      }
      return (h >>> 0);
    }

    registerTrack(trackId) {
      if (!this.trackSeeds.has(trackId)) {
        const seed = this.hashString(trackId);
        const bpm = 128 + (seed % 30);
        this.trackSeeds.set(trackId, { seed, bpm, beatSec: 60 / bpm });
      }
    }

    getBars(trackId, timeSeconds, count, variations) {
      if (!this.trackSeeds.has(trackId)) {
        this.registerTrack(trackId);
      }
      const info = this.trackSeeds.get(trackId) || { seed: 1337, bpm: 136, beatSec: 60 / 136 };
      const out = new Float32Array(count);
      const t = Math.max(0, timeSeconds);
      const beatSec = info.beatSec;

      // Fast-attack kick transient on every beat
      const beatPos = (t % beatSec) / beatSec;
      const kick = Math.exp(-beatPos * 8.5);

      // Sharp snare crack on beats 2 and 4
      const beatIndex = Math.floor(t / beatSec);
      const isSnareBeat = (beatIndex % 2) === 1;
      const snare = isSnareBeat ? Math.exp(-beatPos * 7.0) : 0;

      // 16th-note rapid percussion ticks
      const sixteenthSec = beatSec / 4;
      const sixteenthPos = (t % sixteenthSec) / sixteenthSec;
      const tick = Math.exp(-sixteenthPos * 11.0);

      // Fast-cycling chiptune arpeggios dancing across frequency bands
      const arpPhase = t * (info.bpm / 7.0);
      const measurePhase = (t % 16.0) / 16.0;
      const intensity = 0.75 + 0.25 * Math.sin(measurePhase * Math.PI * 2);

      for (let i = 0; i < count; i++) {
        const fraction = i / Math.max(1, count - 1);
        const normX = (i - count / 2) / (count / 2);
        const bell = 0.38 + 0.62 * Math.exp(-Math.pow(normX / 0.62, 2));

        let rawVal = 0.06;

        if (fraction < 0.22) {
          // Bass & Sub-bass: punchy kick impact and bass groove
          const bassGroove = Math.sin(t * 30.0 + fraction * 12.0) * 0.16;
          rawVal = (kick * 0.90 + Math.max(0, bassGroove) + 0.08);
        } else if (fraction < 0.68) {
          // Midrange: rapid chiptune lead sweeps and snare punch
          const arpWave = Math.sin(arpPhase + fraction * 15.0);
          const leadEnergy = Math.max(0, arpWave) * 0.70;
          const snareEnergy = snare * 0.65;
          rawVal = (leadEnergy + snareEnergy + tick * 0.25 + 0.07);
        } else {
          // Treble: rapid hi-hat chatter and shimmering transients
          const trebleSizzle = Math.sin(t * 50.0 + fraction * 25.0) * 0.14;
          rawVal = (tick * 0.78 + Math.max(0, trebleSizzle) + 0.06);
        }

        const boosted = Math.min(1.0, Math.pow(rawVal, 0.70) * 1.55 * intensity);
        const variation = (variations && variations[i]) ? variations[i] : 1.0;
        out[i] = Math.max(0.06, Math.min(1.0, boosted * bell * variation));
      }

      return out;
    }
  }

  window.PrecompiledVisualizer = new PrecompiledVisualizer();
})();
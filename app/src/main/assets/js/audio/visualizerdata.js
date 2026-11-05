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
        const bpm = 126 + (seed % 28);
        this.trackSeeds.set(trackId, { seed, bpm, beatSec: 60 / bpm });
      }
    }

    getBars(trackId, timeSeconds, count, variations) {
      if (!this.trackSeeds.has(trackId)) {
        this.registerTrack(trackId);
      }
      const info = this.trackSeeds.get(trackId) || { seed: 1337, bpm: 132, beatSec: 60 / 132 };
      const out = new Float32Array(count);
      const t = Math.max(0, timeSeconds);
      const beatSec = info.beatSec;

      // Full, punchy kick pulse with natural decay
      const beatPos = (t % beatSec) / beatSec;
      const kick = Math.exp(-beatPos * 3.8);

      // Pronounced snare snap on beats 2 and 4
      const beatIndex = Math.floor(t / beatSec);
      const isSnareBeat = (beatIndex % 2) === 1;
      const snare = isSnareBeat ? Math.exp(-beatPos * 3.2) : 0;

      // Active 16th-note rhythm & hi-hat groove
      const sixteenthSec = beatSec / 4;
      const sixteenthPos = (t % sixteenthSec) / sixteenthSec;
      const tick = Math.exp(-sixteenthPos * 4.5);

      // Fast, continuous chiptune arpeggio melodies across bands
      const arpPhase = t * (info.bpm / 6.0);
      const measurePhase = (t % 16.0) / 16.0;
      const intensity = 0.82 + 0.18 * Math.sin(measurePhase * Math.PI * 2);

      for (let i = 0; i < count; i++) {
        const fraction = i / Math.max(1, count - 1);
        const normX = (i - count / 2) / (count / 2);
        // Generous bell curve ensuring outer flanks stay lively
        const bell = 0.48 + 0.52 * Math.exp(-Math.pow(normX / 0.68, 2));

        let energy = 0.32; // Solid musical baseline so bars never flatline

        if (fraction < 0.25) {
          // Bass & Sub-bass: heavy kick impact + rhythmic bassline drive
          const bassDrive = Math.sin(t * 26.0 + fraction * 8.0) * 0.22;
          energy = 0.35 + (kick * 0.58) + Math.max(0, bassDrive);
        } else if (fraction < 0.70) {
          // Midrange: prominent synth leads, chords, and snare punch
          const arpWave = Math.sin(arpPhase + fraction * 14.0);
          const leadSynth = Math.max(0, arpWave) * 0.48;
          const snareHit = snare * 0.42;
          energy = 0.32 + leadSynth + snareHit + (tick * 0.15);
        } else {
          // Treble: persistent hi-hat sizzle and percussion sheen
          const trebleGroove = Math.sin(t * 40.0 + fraction * 20.0) * 0.18;
          energy = 0.28 + (tick * 0.52) + Math.max(0, trebleGroove);
        }

        // Dynamic contrast boost ensuring peaks hit 85% - 98%
        const boosted = Math.min(1.0, Math.pow(energy, 0.78) * 1.38 * intensity);
        const variation = (variations && variations[i]) ? variations[i] : 1.0;
        out[i] = Math.max(0.18, Math.min(1.0, boosted * bell * variation));
      }

      return out;
    }
  }

  window.PrecompiledVisualizer = new PrecompiledVisualizer();
})();
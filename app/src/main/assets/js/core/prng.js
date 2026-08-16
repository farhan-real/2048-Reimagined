(function() {
  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    h += h << 13; h ^= h >>> 7;
    h += h << 3;  h ^= h >>> 17;
    return (h += h << 5) >>> 0;
  }

  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class DeterministicRNG {
    constructor(baseSeed = 1337) {
      this.baseSeed = baseSeed;
    }

    getTileSpawn(grid, moveCount, isDeterministic, vacantCells) {
      if (!isDeterministic) {
        const randomCell = vacantCells[Math.floor(Math.random() * vacantCells.length)];
        const val = Math.random() < 0.9 ? 2 : 4;
        return { cell: randomCell, val };
      }

      let boardSignature = "";
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          boardSignature += (grid[r][c] ? grid[r][c].value : 0) + ",";
        }
      }

      const stateKey = `${this.baseSeed}_turn${moveCount}_${boardSignature}`;
      const seed = hashString(stateKey);
      const rng = mulberry32(seed);

      const val = rng() < 0.9 ? 2 : 4;
      const cellIndex = Math.floor(rng() * vacantCells.length);

      return {
        cell: vacantCells[cellIndex],
        val
      };
    }
  }

  window.DeterministicRNG = DeterministicRNG;
})();
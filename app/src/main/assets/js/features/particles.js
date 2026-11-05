(function() {
  class Particle {
    constructor(x, y, vx, vy, color, duration) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.decayFriction = 0.93;
      this.size = Math.random() * 2.5 + 1.2;
      this.life = duration;
      this.maxLife = duration;
      this.alpha = 1.0;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= this.decayFriction;
      this.vy *= this.decayFriction;
      this.life -= dt * 1000;
      this.alpha = Math.max(0, this.life / this.maxLife);
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class ParticleEngine {
    constructor() {
      this.canvas = document.getElementById('particle-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.lastTime = performance.now();
      this.animationFrameId = null;

      this.cachedGap = 10;
      this.cachedCellSize = 90;
      this.cachedDensity = 20;
      this.cachedLife = 450;
      this.cachedEnabled = true;

      window.addEventListener('resize', () => this.resize());
      this.bindSettingEvents();
      this.resize();
    }

    bindSettingEvents() {
      const toggle = document.getElementById('toggle-particles');
      const density = document.getElementById('slider-part-density');
      const life = document.getElementById('slider-part-life');

      if (toggle) toggle.addEventListener('change', () => { this.cachedEnabled = toggle.checked; });
      if (density) density.addEventListener('input', () => { this.cachedDensity = parseInt(density.value) || 20; });
      if (life) life.addEventListener('input', () => { this.cachedLife = parseInt(life.value) || 450; });
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      this.canvas.width = rect.width * this.dpr;
      this.canvas.height = rect.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);

      const board = document.getElementById('board-container');
      if (board) {
        const style = getComputedStyle(board);
        this.cachedGap = parseFloat(style.getPropertyValue('--gap')) || 10;
        this.cachedCellSize = parseFloat(style.getPropertyValue('--cell-size')) || 90;
      }
    }

    spawnMergeBurst(col, row, color) {
      if (!this.cachedEnabled) return;

      const gap = this.cachedGap;
      const cellSize = this.cachedCellSize;
      const xStart = col * (cellSize + gap) + gap;
      const yStart = row * (cellSize + gap) + gap;
      const centerX = xStart + cellSize / 2;
      const centerY = yStart + cellSize / 2;

      const count = this.cachedDensity;
      const duration = this.cachedLife;

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const cos = Math.cos(theta), sin = Math.sin(theta);
        const halfSize = cellSize / 2;

        let px = centerX + Math.sign(cos) * halfSize;
        let py = centerY + (Math.abs(cos) > Math.abs(sin) ? Math.sign(cos) * halfSize * (sin / cos) : Math.sign(sin) * halfSize);
        if (Math.abs(sin) >= Math.abs(cos)) {
          px = centerX + Math.sign(sin) * halfSize * (cos / sin);
          py = centerY + Math.sign(sin) * halfSize;
        }

        const offsetDist = Math.random() * 4 + 1;
        px += cos * offsetDist;
        py += sin * offsetDist;

        const velocityScalar = Math.random() * 85 + 75;
        this.particles.push(new Particle(px, py, cos * velocityScalar, sin * velocityScalar, color, duration));
      }

      if (!this.animationFrameId) {
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
      }
    }

    clear() {
      this.particles = [];
      this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    loop(currentTime) {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update(dt);
        if (p.life <= 0) this.particles.splice(i, 1);
        else p.draw(this.ctx);
      }

      if (this.particles.length > 0) {
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
      } else {
        this.animationFrameId = null;
      }
    }
  }

  window.ParticleEngine = ParticleEngine;
})();
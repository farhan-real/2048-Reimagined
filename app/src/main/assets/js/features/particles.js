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

    draw(ctx, currentTheme) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      if (currentTheme !== 'classic' && currentTheme !== 'pastel_pink') {
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.color;
      }
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

      window.addEventListener('resize', () => this.resize());
      this.resize();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * this.dpr;
      this.canvas.height = rect.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
    }

    spawnMergeBurst(col, row, color, currentTheme) {
      const toggle = document.getElementById('toggle-particles');
      const isParticlesEnabled = toggle ? toggle.checked : true;
      if (!isParticlesEnabled) return;

      const board = document.getElementById('board-container');
      const gap = parseFloat(getComputedStyle(board).getPropertyValue('--gap')) || 10;
      const cellSize = parseFloat(getComputedStyle(board).getPropertyValue('--cell-size')) || 90;

      const xStart = col * (cellSize + gap) + gap;
      const yStart = row * (cellSize + gap) + gap;
      const centerX = xStart + cellSize / 2;
      const centerY = yStart + cellSize / 2;

      const count = parseInt(document.getElementById('slider-part-density').value) || 20;
      const duration = parseInt(document.getElementById('slider-part-life').value) || 450;

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const halfSize = cellSize / 2;

        let px, py;
        if (Math.abs(cos) > Math.abs(sin)) {
          px = centerX + Math.sign(cos) * halfSize;
          py = centerY + Math.sign(cos) * halfSize * (sin / cos);
        } else {
          px = centerX + Math.sign(sin) * halfSize * (cos / sin);
          py = centerY + Math.sign(sin) * halfSize;
        }

        const offsetDist = Math.random() * 4 + 1;
        px += cos * offsetDist;
        py += sin * offsetDist;

        const velocityScalar = Math.random() * 85 + 75;
        const vx = cos * velocityScalar;
        const vy = sin * velocityScalar;

        this.particles.push(new Particle(px, py, vx, vy, color, duration));
      }

      if (!this.animationFrameId) {
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t, currentTheme));
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

    loop(currentTime, currentTheme) {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update(dt);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        } else {
          p.draw(this.ctx, currentTheme);
        }
      }

      if (this.particles.length > 0) {
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t, currentTheme));
      } else {
        this.animationFrameId = null;
      }
    }
  }

  window.ParticleEngine = ParticleEngine;
})();
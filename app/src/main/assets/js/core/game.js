(function() {
  class GameEngine {
    constructor(uiController) {
      this.ui = uiController;
      this.grid = Array(4).fill(null).map(() => Array(4).fill(null));
      this.score = 0;
      this.bestScore = 0;
      this.moveCount = 0;
      this.gameSeed = Date.now();
      this.undoState = null;
      this.isMoving = false;
      this.gameOverLeaderboardId = null;

      this.tilesContainer = document.getElementById('tiles-container');
      this.particles = new window.ParticleEngine();
      this.prng = new window.DeterministicRNG(this.gameSeed);

      this.timer = new window.GameTimer((formatted) => {
        if (this.ui.timerEl) this.ui.timerEl.textContent = formatted;
      });

      this.setupGameEvents();
      this.loadGameState();
      this.updateUndoButtonState();
    }

    setupGameEvents() {
      this.ui.btnRestart.addEventListener('click', () => this.restart());
      this.ui.retryOverlayBtn.addEventListener('click', () => this.restart());
      this.ui.btnUndo.addEventListener('click', () => this.undo());
      this.ui.resetBestBtn.addEventListener('click', () => {
        this.ui.showConfirmDialog({
          title: "Reset High Score?",
          message: "Are you sure you want to reset your high score back to 0?",
          confirmText: "Reset Score",
          onConfirm: () => {
            this.bestScore = 0;
            window.storage.setBestScore(0);
            this.ui.bestEl.textContent = '0';
            this.saveState();
            this.ui.triggerHaptic(this.ui.getMergeHaptic());
          }
        });
      });
    }

    spawnTile() {
      const vacant = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (this.grid[r][c] === null) vacant.push({ r, c });
        }
      }
      if (vacant.length > 0) {
        const isDeterministic = this.ui.isDeterministic();
        const { cell, val } = this.prng.getTileSpawn(this.grid, this.moveCount, isDeterministic, vacant);
        const tile = new window.Tile(cell.r, cell.c, val);
        this.grid[cell.r][cell.c] = tile;
        this.tilesContainer.appendChild(tile.element);
        setTimeout(() => tile.element.classList.remove('tile-new'), 150);
      }
    }

    updateUndoButtonState() {
      if (this.undoState) {
        this.ui.btnUndo.removeAttribute('disabled');
      } else {
        this.ui.btnUndo.setAttribute('disabled', 'true');
      }
    }

    restart() {
      this.clearDOMGrid();
      this.grid = Array(4).fill(null).map(() => Array(4).fill(null));
      this.score = 0;
      this.moveCount = 0;
      this.gameSeed = Date.now();
      this.prng = new window.DeterministicRNG(this.gameSeed);
      this.undoState = null;
      this.gameOverLeaderboardId = null;
      this.updateUndoButtonState();

      this.timer.reset();
      this.timer.resume();
      this.ui.gameoverOverlay.classList.remove('active');
      this.particles.clear();

      this.spawnTile();
      this.spawnTile();
      this.saveState();
      this.updateScoreUI();
    }

    clearDOMGrid() {
      this.tilesContainer.querySelectorAll('.tile').forEach(t => t.remove());
    }

    undo() {
      if (!this.undoState || this.isMoving) return;
      this.ui.triggerHaptic(this.ui.getSlideHaptic());

      if (this.gameOverLeaderboardId && window.leaderboard) {
        window.leaderboard.deleteEntry(this.gameOverLeaderboardId);
        this.gameOverLeaderboardId = null;
        if (this.ui && this.ui.leaderboard) this.ui.leaderboard.render();
      }

      this.clearDOMGrid();
      this.grid = Array(4).fill(null).map(() => Array(4).fill(null));
      this.score = this.undoState.score;
      this.moveCount = this.undoState.moveCount;
      this.gameSeed = this.undoState.gameSeed || this.gameSeed;
      this.prng = new window.DeterministicRNG(this.gameSeed);

      if (this.undoState.timeSeconds !== undefined) {
        this.timer.setTimeSeconds(this.undoState.timeSeconds);
        this.timer.resume();
      }

      this.ui.gameoverOverlay.classList.remove('active');
      this.particles.clear();

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = this.undoState.board[r][c];
          if (val) {
            const t = new window.Tile(r, c, val);
            t.element.classList.add('no-transition');
            this.grid[r][c] = t;
            this.tilesContainer.appendChild(t.element);
            setTimeout(() => t.element.classList.remove('no-transition', 'tile-new'), 50);
          }
        }
      }

      this.undoState = null;
      this.updateUndoButtonState();
      this.saveState();
      this.updateScoreUI();
    }

    move(direction) {
      if (this.isMoving || this.isGameOver()) return;

      const snapshot = {
        score: this.score,
        moveCount: this.moveCount,
        gameSeed: this.gameSeed,
        timeSeconds: this.timer.getElapsedSeconds(),
        board: this.grid.map(row => row.map(tile => tile ? tile.value : null))
      };

      const vector = this.getDirectionVector(direction);
      const traversals = this.buildTraversals(vector);
      let moved = false;
      let scoreGained = 0;
      const burstPoints = [];

      this.grid.forEach(row => row.forEach(tile => {
        if (tile) tile.mergedThisTurn = false;
      }));

      requestAnimationFrame(() => {
        traversals.rows.forEach(r => {
          traversals.cols.forEach(c => {
            const tile = this.grid[r][c];
            if (!tile) return;

            let currR = r, currC = c;
            let nextR = currR + vector.y, nextC = currC + vector.x;
            let farthestR = currR, farthestC = currC;
            let mergeTarget = null;

            while (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4) {
              const candidate = this.grid[nextR][nextC];
              if (candidate) {
                if (candidate.value === tile.value && !candidate.mergedThisTurn) {
                  mergeTarget = candidate;
                }
                break;
              }
              farthestR = nextR;
              farthestC = nextC;
              nextR += vector.y;
              nextC += vector.x;
            }

            if (mergeTarget) {
              this.grid[currR][currC] = null;
              tile.row = mergeTarget.row;
              tile.col = mergeTarget.col;
              tile.element.classList.add('tile-moving');
              tile.updatePosition();

              mergeTarget.mergedThisTurn = true;
              const newValue = tile.value * 2;
              scoreGained += newValue;
              burstPoints.push({ r: mergeTarget.row, c: mergeTarget.col, val: newValue });

              const tileToDestroy = tile;
              const targetTileToUpdate = mergeTarget;
              const slideSpeed = this.ui.getSlideSpeed();

              setTimeout(() => {
                tileToDestroy.destroy();
                targetTileToUpdate.updateValue(newValue);
              }, slideSpeed);
              moved = true;
            } else if (farthestR !== currR || farthestC !== currC) {
              this.grid[currR][currC] = null;
              this.grid[farthestR][farthestC] = tile;
              tile.row = farthestR;
              tile.col = farthestC;
              tile.element.classList.add('tile-moving');
              tile.updatePosition();
              moved = true;
            }
          });
        });

        if (moved) {
          this.isMoving = true;
          this.moveCount++;
          this.undoState = snapshot;
          this.updateUndoButtonState();
          this.ui.triggerHaptic(this.ui.getSlideHaptic());
          if (window.sound) window.sound.playSlide();

          const slideSpeed = this.ui.getSlideSpeed();
          setTimeout(() => {
            if (scoreGained > 0) {
              this.score += scoreGained;
              this.updateScoreUI(scoreGained);
              this.ui.triggerHaptic(this.ui.getMergeHaptic());
              if (window.sound) window.sound.playMerge();
              burstPoints.forEach(pt => {
                const style = getComputedStyle(document.body);
                const particleColor = style.getPropertyValue(`--t${pt.val}-particle`).trim() || 'var(--accent-color)';
                this.particles.spawnMergeBurst(pt.c, pt.r, particleColor, this.ui.getCurrentTheme());
              });
            } else {
              this.updateScoreUI();
            }

            this.spawnTile();
            this.saveState();

            if (this.isGameOver()) {
              this.timer.pause();
              this.ui.triggerHaptic(20);
              if (window.sound) window.sound.playGameOver();
              this.gameOverLeaderboardId = window.leaderboard ? window.leaderboard.addEntry(this.score, this.timer.getElapsedSeconds()) : null;
              this.ui.finalScoreEl.textContent = this.score;
              if (this.ui.finalTimeEl) {
                this.ui.finalTimeEl.textContent = this.timer.formatTime(this.timer.getElapsedSeconds());
              }
              this.ui.gameoverOverlay.classList.add('active');
            }

            this.isMoving = false;
            this.grid.forEach(row => row.forEach(t => {
              if (t) t.element.classList.remove('tile-moving');
            }));
          }, slideSpeed + 10);
        }
      });
    }

    updateScoreUI(increment = 0) {
      this.ui.scoreEl.textContent = this.score;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        window.storage.setBestScore(this.bestScore);
      }
      this.ui.bestEl.textContent = this.bestScore;
      this.ui.showScoreIncrement(increment);
    }

    getDirectionVector(direction) {
      const vectors = {
        up:    { x: 0,  y: -1 },
        down:  { x: 0,  y: 1  },
        left:  { x: -1, y: 0  },
        right: { x: 1,  y: 0  }
      };
      return vectors[direction];
    }

    buildTraversals(vector) {
      const traversals = { rows: [0, 1, 2, 3], cols: [0, 1, 2, 3] };
      if (vector.x === 1) traversals.cols.reverse();
      if (vector.y === 1) traversals.rows.reverse();
      return traversals;
    }

    isGameOver() {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (this.grid[r][c] === null) return false;
        }
      }
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const t = this.grid[r][c];
          if (t) {
            if (r < 3 && this.grid[r + 1][c] && this.grid[r + 1][c].value === t.value) return false;
            if (c < 3 && this.grid[r][c + 1] && this.grid[r][c + 1].value === t.value) return false;
          }
        }
      }
      return true;
    }

    saveState() {
      const boardState = this.grid.map(row => row.map(tile => tile ? tile.value : null));
      const payload = {
        score: this.score,
        moveCount: this.moveCount,
        gameSeed: this.gameSeed,
        timeSeconds: this.timer.getElapsedSeconds(),
        currentTheme: this.ui.getCurrentTheme(),
        gameOverLeaderboardId: this.gameOverLeaderboardId,
        board: boardState,
        undoState: this.undoState ? {
          score: this.undoState.score,
          moveCount: this.undoState.moveCount,
          gameSeed: this.undoState.gameSeed,
          timeSeconds: this.undoState.timeSeconds,
          board: this.undoState.board
        } : null
      };
      window.storage.setGameState(payload);
    }

    loadGameState() {
      this.ui.loadSettings();
      try {
        const data = window.storage.getGameState();
        if (data && data.board && Array.isArray(data.board)) {
          this.score = data.score || 0;
          this.moveCount = data.moveCount || 0;
          this.gameSeed = data.gameSeed || Date.now();
          this.gameOverLeaderboardId = data.gameOverLeaderboardId || null;
          this.prng = new window.DeterministicRNG(this.gameSeed);
          this.bestScore = window.storage.getBestScore();

          if (data.timeSeconds !== undefined) {
            this.timer.setTimeSeconds(data.timeSeconds);
          }
          this.timer.resume();

          this.clearDOMGrid();
          this.grid = Array(4).fill(null).map(() => Array(4).fill(null));

          let tileCount = 0;
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              const val = data.board[r] ? data.board[r][c] : null;
              if (val) {
                const t = new window.Tile(r, c, val);
                t.element.classList.add('no-transition');
                this.grid[r][c] = t;
                this.tilesContainer.appendChild(t.element);
                tileCount++;
                setTimeout(() => t.element.classList.remove('no-transition', 'tile-new'), 50);
              }
            }
          }

          this.undoState = data.undoState ? {
            score: data.undoState.score,
            moveCount: data.undoState.moveCount,
            gameSeed: data.undoState.gameSeed,
            timeSeconds: data.undoState.timeSeconds,
            board: data.undoState.board
          } : null;

          this.ui.setTheme(data.currentTheme || "neon_amoled", () => this.saveState());
          this.updateScoreUI();
          if (tileCount >= 2) return;
        }
      } catch (e) {}

      this.ui.setTheme("neon_amoled", () => this.saveState());
      this.restart();
    }
  }

  window.GameEngine = GameEngine;
})();
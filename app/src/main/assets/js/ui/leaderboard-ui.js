(function() {
  class LeaderboardUI {
    constructor(parentUI) {
      this.parent = parentUI;
      this.listEl = document.getElementById('leaderboard-list');
    }

    render() {
      if (!window.leaderboard) return;
      const entries = window.leaderboard.getEntries();
      this.listEl.innerHTML = "";

      if (entries.length === 0) {
        this.listEl.innerHTML = `
          <div class="leaderboard-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4; margin-bottom:6px;">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            <div>No games recorded yet</div>
            <div style="font-size:0.7rem; opacity:0.5; margin-top:2px;">Complete a game to claim your rank!</div>
          </div>
        `;
        return;
      }

      entries.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = "leaderboard-item";

        const rankClass = index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "rank-n";
        const formattedDate = window.leaderboard.formatDate(item.timestamp);
        const formattedTime = window.leaderboard.formatDuration(item.timeSeconds);

        row.innerHTML = `
          <div class="leaderboard-rank ${rankClass}">#${index + 1}</div>
          <div class="leaderboard-details">
            <div class="leaderboard-score">${item.score.toLocaleString()}</div>
            <div class="leaderboard-date">${formattedDate}</div>
          </div>
          <div class="leaderboard-time-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${formattedTime}</span>
          </div>
          <button class="leaderboard-delete-btn" aria-label="Delete Entry">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        `;

        const deleteBtn = row.querySelector('.leaderboard-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.parent.showConfirmDialog({
            title: "Delete Entry?",
            message: `Remove score of ${item.score.toLocaleString()} from the leaderboard?`,
            confirmText: "Delete",
            onConfirm: () => {
              window.leaderboard.deleteEntry(item.id || item.timestamp);
              this.render();
              this.parent.triggerHaptic(this.parent.settings.mergeHapticVal);
            }
          });
        });

        this.listEl.appendChild(row);
      });
    }
  }

  window.LeaderboardUI = LeaderboardUI;
})();
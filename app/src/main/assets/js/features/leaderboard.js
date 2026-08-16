(function() {
  class Leaderboard {
    constructor() {
      this.entries = window.storage.getLeaderboard();
    }

    addEntry(score, timeSeconds) {
      if (score <= 0) return false;

      const newEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        score: score,
        timeSeconds: timeSeconds,
        timestamp: Date.now()
      };

      this.entries.push(newEntry);

      // Sort by Score DESC, then Time ASC (faster = better)
      this.entries.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeSeconds - b.timeSeconds;
      });

      // Keep only top 5 entries
      this.entries = this.entries.slice(0, 5);
      window.storage.setLeaderboard(this.entries);
      return true;
    }

    deleteEntry(id) {
      this.entries = this.entries.filter(entry => entry.id !== id && String(entry.timestamp) !== String(id));
      window.storage.setLeaderboard(this.entries);
    }

    getEntries() {
      return this.entries;
    }

    clear() {
      this.entries = [];
      window.storage.setLeaderboard([]);
    }

    formatDate(timestamp) {
      const d = new Date(timestamp);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
    }

    formatDuration(totalSeconds) {
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = Math.floor(totalSeconds % 60);

      if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  window.Leaderboard = Leaderboard;
})();
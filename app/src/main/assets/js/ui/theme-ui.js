(function() {
  const THEME_SECTIONS = [
    {
      theme: "Cyberpunk",
      variants: [
        { key: "cyberpunk", name: "Cyberpunk Night", mode: "Dark" },
        { key: "cyberlight", name: "Cyberpunk Daylight", mode: "Light" }
      ]
    },
    {
      theme: "Sakura",
      variants: [
        { key: "sakura", name: "Sakura Night", mode: "Dark" },
        { key: "sakuralight", name: "Sakura Blossom", mode: "Light" }
      ]
    },
    {
      theme: "Seaway",
      variants: [
        { key: "seaway", name: "Seaway Abyss", mode: "Dark" },
        { key: "oceanbreeze", name: "Ocean Breeze", mode: "Light" }
      ]
    },
    {
      theme: "Nature & Forest",
      variants: [
        { key: "forest", name: "Emerald Forest", mode: "Dark" },
        { key: "gardendawn", name: "Garden Dawn", mode: "Light" }
      ]
    },
    {
      theme: "Cosmos & Space",
      variants: [
        { key: "nebula", name: "Deep Nebula", mode: "Dark" },
        { key: "supernova", name: "Supernova Flare", mode: "Dark" },
        { key: "celestial", name: "Celestial Dawn", mode: "Light" }
      ]
    },
    {
      theme: "Neon AMOLED",
      variants: [
        { key: "neon_amoled", name: "Neon AMOLED", mode: "OLED" },
        { key: "neonlight", name: "Neon Daylight", mode: "Light" }
      ]
    },
    {
      theme: "Terminal",
      variants: [
        { key: "terminal", name: "Phosphor CRT", mode: "Dark" },
        { key: "terminallight", name: "Matrix Paper", mode: "Light" }
      ]
    },
    {
      theme: "Synthwave",
      variants: [
        { key: "synthwave", name: "Synthwave Night", mode: "Dark" }
      ]
    },
    {
      theme: "Minimal & Classic",
      variants: [
        { key: "classic", name: "Classic Sand", mode: "Light" },
        { key: "nordicfrost", name: "Nordic Frost", mode: "Light" },
        { key: "pastel_pink", name: "Pastel Pink", mode: "Light" },
        { key: "pastel_amoled", name: "Pastel AMOLED", mode: "OLED" },
        { key: "the_void", name: "The Void", mode: "OLED" }
      ]
    }
  ];

  const THEMES = {};
  THEME_SECTIONS.forEach(section => {
    section.variants.forEach(v => {
      THEMES[v.key] = v;
    });
  });

  class ThemeUI {
    constructor(parentUI) {
      this.parent = parentUI;
      this.currentTheme = "neon_amoled";

      this.themeTriggerBtn = document.getElementById('theme-dropdown-btn');
      this.themeDropdownWrapper = document.getElementById('theme-dropdown-wrapper');
      this.themeDropdownList = document.getElementById('theme-dropdown-list');
      this.themeCurrentLbl = document.getElementById('theme-current-lbl');

      this.setupEvents();
    }

    setupEvents() {
      this.themeTriggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.themeDropdownWrapper.classList.toggle('active');
      });

      document.addEventListener('click', () => {
        this.themeDropdownWrapper.classList.remove('active');
      });
    }

    buildDropdown(onSelect) {
      this.themeDropdownList.innerHTML = "";

      THEME_SECTIONS.forEach(section => {
        const header = document.createElement('div');
        header.className = "dropdown-section-header";
        header.textContent = section.theme;
        this.themeDropdownList.appendChild(header);

        section.variants.forEach(t => {
          const item = document.createElement('div');
          item.className = "dropdown-item" + (this.currentTheme === t.key ? " selected" : "");

          const meta = document.createElement('div');
          meta.className = "theme-item-meta";

          const nameSpan = document.createElement('span');
          nameSpan.className = "theme-name-text";
          nameSpan.textContent = t.name;

          const badge = document.createElement('span');
          badge.className = "theme-variant-badge";
          badge.textContent = t.mode;

          meta.appendChild(nameSpan);
          meta.appendChild(badge);

          const radio = document.createElement('div');
          radio.className = "radio-indicator";

          item.appendChild(meta);
          item.appendChild(radio);

          item.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setTheme(t.key, onSelect);
            this.themeDropdownWrapper.classList.remove('active');
          });

          this.themeDropdownList.appendChild(item);
        });
      });
    }

    setTheme(themeKey, onSelect) {
      if (!THEMES[themeKey]) themeKey = "neon_amoled";
      this.currentTheme = themeKey;
      this.themeCurrentLbl.textContent = THEMES[themeKey].name;
      document.body.setAttribute('data-theme', themeKey);
      this.buildDropdown(onSelect);
      if (onSelect) onSelect(themeKey);
    }
  }

  window.ThemeUI = ThemeUI;
})();
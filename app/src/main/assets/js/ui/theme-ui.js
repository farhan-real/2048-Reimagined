(function() {
  const THEME_SECTIONS = [
    {
      category: "Nature & Earth",
      variants: [
        { id: "forest", name: "Forest", darkKey: "forest", lightKey: "gardendawn" },
        { id: "ocean", name: "Ocean", darkKey: "seaway", lightKey: "oceanbreeze" },
        { id: "sakura", name: "Sakura Bloom", darkKey: "sakura", lightKey: "sakuralight" },
        { id: "autumn", name: "Autumn Maple", darkKey: "autumn", lightKey: "autumnlight" }
      ]
    },
    {
      category: "Space & Cosmos",
      variants: [
        { id: "nebula", name: "Stellar Nebula", darkKey: "nebula", lightKey: "celestial" },
        { id: "supernova", name: "Supernova", darkKey: "supernova", lightKey: "supernovalight" }
      ]
    },
    {
      category: "Cyber & Retro",
      variants: [
        { id: "cyberpunk", name: "Cyberpunk", darkKey: "cyberpunk", lightKey: "cyberlight" },
        { id: "synthwave", name: "Synthwave", darkKey: "synthwave", lightKey: "sunsetsynth" },
        { id: "neon", name: "Neon Glow", darkKey: "neon_amoled", lightKey: "neonlight" },
        { id: "terminal", name: "Terminal", darkKey: "terminal", lightKey: "terminallight" }
      ]
    },
    {
      category: "Aesthetic & Minimal",
      variants: [
        { id: "pastel", name: "Pastel Rainbow", darkKey: "pastel_amoled", lightKey: "pastellight" },
        { id: "pastelpink", name: "Pastel Pink", darkKey: "pastelpinkdark", lightKey: "pastel_pink" },
        { id: "nordicfrost", name: "Nordic Frost", darkKey: "nordicdark", lightKey: "nordicfrost" },
        { id: "classic", name: "Classic Sand", darkKey: "classicdark", lightKey: "classic" },
        { id: "thevoid", name: "The Void", darkKey: "the_void" }
      ]
    }
  ];

  const THEMES = {};
  THEME_SECTIONS.forEach(s => {
    s.variants.forEach(v => {
      if (v.darkKey) THEMES[v.darkKey] = { name: `${v.name} (Dark)`, variant: v, mode: "dark" };
      if (v.lightKey) THEMES[v.lightKey] = { name: `${v.name} (Light)`, variant: v, mode: "light" };
    });
  });

  const MOON_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const SUN_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

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
        header.textContent = section.category;
        this.themeDropdownList.appendChild(header);

        section.variants.forEach(variant => {
          const isSelected = this.currentTheme === variant.darkKey || this.currentTheme === variant.lightKey;
          const currentMode = this.currentTheme === variant.lightKey ? "light" : "dark";

          const item = document.createElement('div');
          item.className = "dropdown-item" + (isSelected ? " selected" : "");

          const meta = document.createElement('div');
          meta.className = "theme-item-meta";

          const nameSpan = document.createElement('span');
          nameSpan.className = "theme-name-text";
          nameSpan.textContent = variant.name;
          meta.appendChild(nameSpan);

          if (variant.darkKey && variant.lightKey) {
            const toggle = document.createElement('div');
            toggle.className = "theme-mode-toggle";
            toggle.setAttribute('data-mode', isSelected ? currentMode : "dark");
            toggle.innerHTML = `
              <div class="mode-toggle-slider"></div>
              <button class="mode-toggle-btn mode-btn-dark" aria-label="Dark Mode">${MOON_ICON}</button>
              <button class="mode-toggle-btn mode-btn-light" aria-label="Light Mode">${SUN_ICON}</button>
            `;

            toggle.querySelector('.mode-btn-dark').addEventListener('click', (e) => {
              e.stopPropagation();
              this.setTheme(variant.darkKey, onSelect);
            });

            toggle.querySelector('.mode-btn-light').addEventListener('click', (e) => {
              e.stopPropagation();
              this.setTheme(variant.lightKey, onSelect);
            });

            meta.appendChild(toggle);
          } else {
            const fixedBadge = document.createElement('div');
            fixedBadge.className = "theme-fixed-badge";
            fixedBadge.innerHTML = variant.darkKey ? MOON_ICON : SUN_ICON;
            meta.appendChild(fixedBadge);
          }

          const radio = document.createElement('div');
          radio.className = "radio-indicator";

          item.appendChild(meta);
          item.appendChild(radio);

          item.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetKey = (isSelected && this.currentTheme === variant.lightKey)
              ? (variant.lightKey || variant.darkKey)
              : (variant.darkKey || variant.lightKey);
            this.setTheme(targetKey, onSelect);
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
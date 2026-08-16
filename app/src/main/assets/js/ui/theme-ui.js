(function() {
  const THEMES = {
    neon_amoled: { name: "Neon AMOLED" },
    rainbow_amoled: { name: "Pastel AMOLED" },
    cyberpunk: { name: "Cyberpunk" },
    synthwave: { name: "Synthwave" },
    seaway: { name: "Seaway" },
    pastel_pink: { name: "Pastel Pink" },
    the_void: { name: "The Void" },
    terminal: { name: "Terminal" },
    sakura: { name: "Sakura Night" },
    supernova: { name: "Supernova" },
    classic: { name: "Classic Sand" }
  };

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
      Object.keys(THEMES).forEach(key => {
        const t = THEMES[key];
        const item = document.createElement('div');
        item.className = "dropdown-item" + (this.currentTheme === key ? " selected" : "");

        const label = document.createElement('span');
        label.textContent = t.name;

        const radio = document.createElement('div');
        radio.className = "radio-indicator";

        item.appendChild(label);
        item.appendChild(radio);

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setTheme(key, onSelect);
          this.themeDropdownWrapper.classList.remove('active');
        });

        this.themeDropdownList.appendChild(item);
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
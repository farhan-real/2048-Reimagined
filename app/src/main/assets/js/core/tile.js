(function() {
  class Tile {
    constructor(row, col, value) {
      this.row = row;
      this.col = col;
      this.value = value;
      this.mergedThisTurn = false;
      this.element = this.createDOMElement();
    }

    createDOMElement() {
      const el = document.createElement('div');
      el.className = "tile tile-new";

      el.style.setProperty('--row', this.row);
      el.style.setProperty('--col', this.col);

      el.dataset.value = this.value;
      el.textContent = this.value;

      const digits = this.value.toString().length;
      if (digits > 2) {
        el.setAttribute('data-digits', digits);
      }

      return el;
    }

    updatePosition() {
      this.element.style.setProperty('--row', this.row);
      this.element.style.setProperty('--col', this.col);
    }

    updateValue(newValue) {
      this.value = newValue;
      this.element.dataset.value = newValue;
      this.element.textContent = newValue;

      const digits = newValue.toString().length;
      if (digits > 2) {
        this.element.setAttribute('data-digits', digits);
      } else {
        this.element.removeAttribute('data-digits');
      }

      this.element.classList.remove('tile-new', 'tile-merged');
      void this.element.offsetWidth;
      this.element.classList.add('tile-merged');

      setTimeout(() => {
        this.element.classList.remove('tile-merged');
      }, 170);
    }

    destroy() {
      this.element.remove();
    }
  }

  window.Tile = Tile;
})();
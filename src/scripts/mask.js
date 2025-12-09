// Это не трогать работает и пусть
export default function maskPlate(inputEl) {
  if (!inputEl) return;

  const TEMPLATE = 'XX0000XX';
  const templateChars = TEMPLATE.split(''); // ['X','X','0','0','0','0','X','X']
  const slotCount = templateChars.length;
  const slotTypes = templateChars.map((c) => (c === 'X' ? 'L' : 'D')); // L = letter, D = digit

  // typed stores only the real characters in the order they fill template slots
  let typed = ''; // e.g. 'SS1'

  // helper: build visual value from typed
  function buildMasked(typedStr) {
    let masked = '';
    let tIdx = 0;
    for (let i = 0; i < slotCount; i++) {
      if (tIdx < typedStr.length) {
        masked += typedStr[tIdx];
        tIdx++;
      } else {
        masked += TEMPLATE[i]; // show placeholder X or 0
      }
    }
    return masked;
  }

  // helper: find the visual caret position after typed length n
  function caretPositionForTypedLength(n) {
    // caret should go to the first template position after consuming n typed chars
    let count = 0;
    for (let i = 0; i < slotCount; i++) {
      if (count === n) return i;
      count += i < slotCount ? 1 : 0; // each slot corresponds to one typed char
    }
    return slotCount;
  }

  // Put typed into dataset so SearchForm can read it
  function syncDataset() {
    inputEl.dataset.typed = typed;
  }

  // Render the visual representation
  function render(posAfterTyped = null) {
    const masked = buildMasked(typed);
    inputEl.value = masked;
    syncDataset();

    // set caret
    // default: put caret at first remaining slot, or end
    let caret = masked.search(/[X0]/);
    if (caret === -1) caret = masked.length;
    if (typeof posAfterTyped === 'number') {
      // ensure caret within bounds
      caret = Math.min(Math.max(0, posAfterTyped), masked.length);
    }
    inputEl.setSelectionRange(caret, caret);
  }

  // initialize
  inputEl.placeholder = TEMPLATE; // visual helper when empty
  typed = '';
  render(0);

  // handle keydown: we fully control allowed input (sequential)
  inputEl.addEventListener('keydown', (e) => {
    // allow navigation keys, ctrl/cmd combos, tab, etc.
    const navKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Tab',
    ];
    if (navKeys.includes(e.key)) return;

    // handle Backspace (remove last typed char) and Delete (remove last typed char)
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (typed.length > 0) {
        typed = typed.slice(0, -1);
        render();
      }
      return;
    }

    // if it's a single printable character
    if (e.key.length === 1) {
      const nextIndex = typed.length; // next template slot to fill
      if (nextIndex >= slotCount) {
        // full already
        e.preventDefault();
        return;
      }

      const expected = slotTypes[nextIndex]; // 'L' or 'D'
      const ch = e.key;

      if (expected === 'L' && /[A-Za-z]/.test(ch)) {
        e.preventDefault();
        typed += ch.toUpperCase();
        // caret should go after the inserted char -> position nextIndex+1
        render(nextIndex + 1);
        return;
      }

      if (expected === 'D' && /[0-9]/.test(ch)) {
        e.preventDefault();
        typed += ch;
        render(nextIndex + 1);
        return;
      }

      // if character doesn't match expected type — ignore it
      e.preventDefault();
      return;
    }

    // for any other keys (Fn, etc.) just ignore here (allow default)
  });

  // handle paste — sanitize and insert as many as fit sequentially
  inputEl.addEventListener('paste', (ev) => {
    ev.preventDefault();
    const clipboard =
      (ev.clipboardData || window.clipboardData).getData('text') || '';
    const clean = clipboard.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    let i = 0;
    while (typed.length < slotCount && i < clean.length) {
      const nextIndex = typed.length;
      const expected = slotTypes[nextIndex];
      const ch = clean[i];
      if (
        (expected === 'L' && /[A-Z]/.test(ch)) ||
        (expected === 'D' && /[0-9]/.test(ch))
      ) {
        typed += ch;
      }
      i++;
    }
    render();
  });

  // prevent direct typing/manipulation by input methods that bypass keydown: keep input read-only-like
  inputEl.addEventListener('input', () => {
    // input event can happen from IME or some browsers; we reconcile by rebuilding typed from dataset if possible
    // If someone typed with an IME and input.value changed, sanitize: extract only A-Z0-9 in order and refill typed respecting slot types
    const raw = (inputEl.value || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();
    // reconstruct typed from raw but respect template order
    let newTyped = '';
    let ri = 0;
    while (newTyped.length < slotCount && ri < raw.length) {
      const expected = slotTypes[newTyped.length];
      const ch = raw[ri];
      if (
        (expected === 'L' && /[A-Z]/.test(ch)) ||
        (expected === 'D' && /[0-9]/.test(ch))
      ) {
        newTyped += ch;
      }
      ri++;
    }
    typed = newTyped;
    render();
  });

  // expose simple state object (optional)
  return {
    get typed() {
      return typed;
    },
    set typed(v) {
      typed = String(v || '')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(0, slotCount);
      render();
    },
  };
}

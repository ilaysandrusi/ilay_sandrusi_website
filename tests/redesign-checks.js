// Browser checks for the redesign (no test runner in this repo).
// Paste into the page (dev server), then: await window.__redesignChecks.<name>()
// Each check returns a list of failures; [] means it passed.
(() => {
  const C = (window.__redesignChecks = window.__redesignChecks || {});
  const finish = () => document.getAnimations().forEach((a) => { try { a.finish(); } catch (_) {} });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  C._finish = finish;
  C._wait = wait;

  C.fonts = async () => {
    const f = [];
    await document.fonts.ready;
    const h1 = document.querySelector('h1');
    if (!h1 || !getComputedStyle(h1).fontFamily.replace(/"/g, '').startsWith('Fredoka')) f.push('h1 font is not Fredoka');
    if (!getComputedStyle(document.body).fontFamily.replace(/"/g, '').startsWith('Varela Round')) f.push('body font is not Varela Round');
    if (!document.fonts.check('700 40px Fredoka', 'א')) f.push('Fredoka 700 Hebrew not loaded');
    if (!document.fonts.check('16px "Varela Round"', 'א')) f.push('Varela Round Hebrew not loaded');
    const suez = [...document.body.querySelectorAll('*')].filter((el) => getComputedStyle(el).fontFamily.includes('Suez'));
    if (suez.length) f.push(`${suez.length} elements still use Suez`);
    let hot = false;
    for (const sh of document.styleSheets) {
      let rules; try { rules = sh.cssRules; } catch (_) { continue; }
      for (const r of rules) {
        if (r.selectorText && /\.btn-primary:hover/.test(r.selectorText)) {
          const bs = r.style.boxShadow || '';
          if (/255,\s*75,\s*38|ff4b26|--shadow-hot/i.test(bs)) hot = true;
        }
      }
    }
    if (!hot) f.push('.btn-primary:hover has no orange shadow');
    if (innerWidth >= 900) {
      const nav = document.querySelector('.scene-nav');
      if (nav && nav.getBoundingClientRect().left < innerWidth / 2) f.push('scene-nav dots are on the left');
    }
    return f;
  };
})();

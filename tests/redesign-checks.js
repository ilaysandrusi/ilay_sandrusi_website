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

  C.heroStatic = async () => {
    const f = [];
    const stage = document.getElementById('stage');
    if (!stage) return ['#stage missing'];
    stage.classList.remove('is-boot');
    finish();
    await wait(50);
    const text = document.querySelector('.hero-text');
    if (!text) f.push('.hero-text missing');
    else if (innerWidth >= 1200 && text.getBoundingClientRect().left < stage.getBoundingClientRect().right - 1) f.push('hero text is not right of the stage');
    const win = document.getElementById('win');
    if (!win) f.push('#win missing');
    else if (getComputedStyle(win).boxShadow !== 'none') f.push('window has a shadow');
    const svgs = [...document.querySelectorAll('.win .dot svg')];
    if (svgs.length !== 3) f.push(`expected 3 dot icons, got ${svgs.length}`);
    if (svgs.some((s) => getComputedStyle(s).opacity !== '1')) f.push('dot icons are not always visible');
    const imgs = [...document.querySelectorAll('.win .char img, .alone img')];
    if (imgs.length < 3) f.push('character images missing');
    await Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    if (imgs.some((i) => !i.naturalWidth)) f.push('a character image did not load');
    const badge = document.querySelector('.win .badge');
    if (!badge || badge.textContent.trim() !== 'עובד על זה עכשיו') f.push('badge text wrong');
    for (const [sel, txt] of [['.mx-note', 'יש פה מספיק מקום לפרויקט שלך'], ['.closed-note', 'בלי החלון אני לא יכול ללוות אתכם למטה. תשאירו אותו פתוח?'], ['#reopen', 'פתחו לי את החלון']]) {
      const el = document.querySelector(sel);
      if (!el || el.textContent.trim() !== txt) f.push(`${sel} text wrong`);
    }
    return f;
  };

  // Run on a fresh load.
  C.windowStates = async () => {
    const f = [];
    const stage = document.getElementById('stage'), win = document.getElementById('win'), bar = document.getElementById('bar');
    const click = (act) => stage.querySelector(`.dot[data-act="${act}"]`).click();
    const rect = () => { const r = win.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); };
    const states = ['is-boot', 'is-min', 'is-max', 'is-closed'];
    await wait(1500); finish();
    if (stage.classList.contains('is-boot')) f.push('window still booting after 1500ms');
    click('max'); await wait(60); finish();
    if (!stage.classList.contains('is-max')) f.push('max did not maximize');
    if (getComputedStyle(document.querySelector('.mx-note')).opacity !== '1') f.push('mx-note not shown when maximized');
    click('max'); await wait(60); finish();
    if (stage.classList.contains('is-max')) f.push('second max click did not restore');
    const before = rect();
    click('min'); await wait(750);
    const docked = rect();
    if (docked[2] !== 290 || docked[0] !== 24) f.push(`docked rect wrong: ${docked}`);
    bar.click(); await wait(750); finish();
    const back = rect();
    if (back.some((v, i) => Math.abs(v - before[i]) > 1)) f.push(`restore rect ${back} != ${before}`);
    click('close'); await wait(60); finish();
    if (getComputedStyle(document.querySelector('#closedBox .closed-note')).opacity !== '1') f.push('closed note not shown');
    if (getComputedStyle(document.getElementById('reopen')).animationName !== 'beat') f.push('reopen does not pulse');
    document.getElementById('reopen').click(); await wait(60); finish();
    if (states.some((s) => stage.classList.contains(s))) f.push(`after reopen stage is ${stage.className}`);
    // Review Focus 1: rapid clicks must not leave it stuck
    click('min'); click('min'); click('min'); await wait(800);
    const s1 = stage.classList.contains('is-min');
    if (s1) bar.click(); else click('min');
    await wait(800);
    if (stage.classList.contains('is-min') === s1) f.push('window stuck after rapid clicks');
    if (stage.classList.contains('is-min')) { bar.click(); await wait(800); }
    // Esc returns to normal
    click('max'); await wait(60);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await wait(60);
    if (stage.classList.contains('is-max')) f.push('Esc did not restore');
    return f;
  };
})();

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

  // Drag the window by its bar with synthetic pointer events.
  C._drag = (dx, dy) => {
    const bar = document.getElementById('bar'), r = document.getElementById('win').getBoundingClientRect();
    const ev = (t, x, y) => bar.dispatchEvent(new PointerEvent(t, { bubbles: true, clientX: x, clientY: y, button: 0, pointerId: 1 }));
    const x = r.left + 150, y = r.top + 20;
    ev('pointerdown', x, y); ev('pointermove', x + dx, y + dy); ev('pointerup', x + dx, y + dy);
  };

  // Run at 1366x820 on a fresh load; resizes to 1024 is done by the caller afterwards via dragResize.
  C.drag = async () => {
    const f = [];
    const stage = document.getElementById('stage'), win = document.getElementById('win'), bar = document.getElementById('bar');
    const click = (act) => stage.querySelector(`.dot[data-act="${act}"]`).click();
    const R = (el) => { const r = el.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; };
    const same = (a, b) => ['l', 't', 'r', 'b'].every((k) => Math.abs(a[k] - b[k]) <= 1);
    await wait(1500); finish();
    const h = document.querySelector('.hero').getBoundingClientRect();
    const area = { l: h.left + 12, t: h.top + 12, r: h.left + h.width / 2 - 12, b: h.bottom - 12 };
    const inside = (x) => x.l >= area.l - 1 && x.t >= area.t - 1 && x.r <= area.r + 1 && x.b <= area.b + 1;
    C._drag(-2000, 2000); finish();
    const d = R(win);
    if (!inside(d)) f.push(`dragged rect outside area: ${JSON.stringify(d)}`);
    if (Math.abs(d.l - area.l) > 1 || Math.abs(d.b - area.b) > 1) f.push('drag did not clamp to bottom-left corner');
    click('max'); await wait(60); finish();
    if (!inside(R(win))) f.push(`max rect outside area: ${JSON.stringify(R(win))}`);
    click('max'); await wait(60); finish();
    if (!same(R(win), d)) f.push('unmax did not return to dragged spot');
    click('min'); await wait(800);
    bar.click(); await wait(800); finish();
    if (!same(R(win), d)) f.push('restore did not return to dragged spot');
    click('close'); await wait(60); finish();
    if (!same(R(document.getElementById('closedBox')), d)) f.push('closed box not at dragged spot');
    document.getElementById('reopen').click(); await wait(60); finish();
    if (!same(R(win), d)) f.push('reopen did not return to dragged spot');
    return f;
  };

  // Review Focus 2: call after C.drag(), once at 1024x760 and once at 375x812.
  C.dragResize = async () => {
    const f = [];
    await wait(1200); finish(); // emulated resizes reach the page late
    const win = document.getElementById('win');
    const r = win.getBoundingClientRect(), h = document.querySelector('.hero').getBoundingClientRect();
    if (innerWidth >= 960) {
      if (r.left < h.left + 11 || r.right > h.left + h.width / 2 - 11 || r.bottom > h.bottom - 11) f.push(`after resize window left its area: ${Math.round(r.left)},${Math.round(r.right)}`);
    } else {
      const t = win.style.translate;
      if (t && t !== '0px 0px' && t !== 'none' && t !== '0px') f.push(`narrow screen keeps a drag offset: ${t}`);
      const before = win.getBoundingClientRect();
      C._drag(-80, 60); finish();
      const after = win.getBoundingClientRect();
      if (Math.abs(before.left - after.left) > 1 || Math.abs(before.top - after.top) > 1) f.push('window can be dragged on a narrow screen');
    }
    return f;
  };
})();

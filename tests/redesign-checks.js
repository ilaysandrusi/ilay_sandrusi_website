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

  // ---------- rope descent ----------
  const climb = () => { if (window.__climbForTest) window.__climbForTest(); };
  const tieExpected = () => {
    const w = document.getElementById('win').getBoundingClientRect();
    if (innerWidth < 960) return { x: w.left + w.width / 2, y: w.bottom - 2 };
    const h = document.querySelector('.hero').getBoundingClientRect();
    const aL = h.left + 12, aR = h.left + h.width / 2 - 12;
    const minC = aL + w.width / 2, maxC = aR - w.width / 2;
    const side = maxC > minC ? Math.min(1, Math.max(0, (w.left + w.width / 2 - minC) / (maxC - minC))) : 0.5;
    return { x: (w.right - 16) + ((w.left + 16) - (w.right - 16)) * side, y: w.bottom - 2 };
  };

  // Run on a fresh load at the size under test.
  C.rope = async () => {
    const f = [];
    if (!window.__climbForTest) return ['__climbForTest not exposed'];
    document.documentElement.style.scrollBehavior = 'auto';
    await wait(1500); finish();
    const c = document.getElementById('climber'), rope = document.getElementById('rope'), send = document.getElementById('send');
    if (!c || !rope || !send) return ['#climber / #rope / #send missing'];
    scrollTo(0, 200); climb(); await wait(700); climb();
    const H = document.documentElement.scrollHeight - innerHeight;
    let prev = null, maxJ = 0, tieErr = 0;
    for (let y = 200; y <= H; y += 10) {
      scrollTo(0, y); climb();
      const L = parseFloat(c.style.left);
      if (prev !== null) maxJ = Math.max(maxJ, Math.abs(L - prev));
      prev = L;
      if (!c.classList.contains('landed') && parseFloat(rope.style.height) > 0) {
        const t = tieExpected();
        tieErr = Math.max(tieErr, Math.abs(parseFloat(rope.style.left) - t.x), Math.abs(parseFloat(rope.style.top) - t.y));
      }
    }
    if (maxJ > 4) f.push(`climber jumps ${maxJ.toFixed(1)}px sideways`);
    if (tieErr > 1) f.push(`rope top is ${tieErr.toFixed(1)}px off the tie point`);
    if (!c.classList.contains('landed')) f.push('not landed at the end');
    const b = send.getBoundingClientRect(), cr = c.getBoundingClientRect();
    const dc = Math.abs((cr.top + cr.height / 2) - (b.top + b.height / 2));
    if (dc > 1) f.push(`landing off center by ${dc.toFixed(1)}px`);
    if (innerWidth >= 1200) {
      const gap = b.left - (parseFloat(c.style.left) + c.offsetWidth);
      if (Math.abs(gap - 14) > 1) f.push(`gap to button is ${gap.toFixed(1)}px`);
    }
    // only while the window is open
    scrollTo(0, 0); climb(); await wait(100);
    document.querySelector('.dot[data-act="min"]').click(); await wait(800);
    scrollTo(0, 1500); climb();
    if (document.body.classList.contains('away')) f.push('descends while the window is minimized');
    scrollTo(0, 0); climb(); document.getElementById('bar').click(); await wait(800); finish();
    // tie point follows the window's place in its area (desktop)
    if (innerWidth >= 960) {
      for (const [dx, want] of [[4000, 'left'], [-4000, 'right']]) {
        C._drag(dx, 0); finish();
        scrollTo(0, 200); climb(); await wait(700); climb();
        const w = document.getElementById('win').getBoundingClientRect();
        const fromEdge = want === 'left' ? parseFloat(rope.style.left) - w.left : w.right - parseFloat(rope.style.left);
        if (Math.abs(fromEdge - 16) > 1) f.push(`window at area ${want === 'left' ? 'right' : 'left'} end: rope ${fromEdge.toFixed(1)}px from ${want} edge`);
        scrollTo(0, 0); climb(); await wait(100);
      }
    }
    return f;
  };

  // Review Focus 3: run right after loading with #contact in the URL.
  C.ropeHash = async () => {
    const f = [];
    climb();
    const c = document.getElementById('climber').getBoundingClientRect(), w = document.querySelector('.win .char').getBoundingClientRect();
    if (!document.body.classList.contains('away') && document.getElementById('stage').classList.contains('is-boot') === false) f.push('not away after loading at #contact');
    const overlap = !(c.right < w.left || c.left > w.right || c.bottom < w.top || c.top > w.bottom);
    if (overlap) f.push('climber starts inside the window instead of its planned spot');
    return f;
  };

  // Run at 1366x820 on a fresh load.
  C.sections = async () => {
    const f = [];
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible'));
    await wait(100); finish();
    const landing = document.querySelector('[data-choice="landing"]');
    if (!landing) f.push('choice "landing" missing');
    else {
      landing.click(); await wait(100);
      document.querySelectorAll('[data-fit]').forEach((p) => {
        const fits = p.dataset.fit.split(/\s+/).includes('landing');
        if (fits === p.classList.contains('locked')) f.push(`plan lock state wrong for data-fit="${p.dataset.fit}"`);
      });
      if (!location.search.includes('need=landing')) f.push('URL does not get need=landing');
    }
    const form = document.getElementById('contact-form');
    if (!form || !form.getAttribute('action').includes('formsubmit.co')) f.push('contact form action changed');
    const aboutText = document.querySelector('.about .about-inner, .about [data-about-col]');
    const heroText = document.querySelector('.hero-text');
    if (aboutText && heroText && innerWidth >= 1200) {
      const d = Math.abs(aboutText.getBoundingClientRect().right - heroText.getBoundingClientRect().right);
      if (d > 2) f.push(`about column right edge off the hero text by ${d.toFixed(0)}px`);
    } else if (!aboutText) f.push('about column not found');
    if (innerWidth >= 1200) {
      const head = document.querySelector('#contact h2'), fr = form && form.getBoundingClientRect();
      if (head && fr && !(fr.left < head.getBoundingClientRect().left && fr.right <= head.getBoundingClientRect().left + 1)) f.push('contact is not two columns (form left of heading)');
      const grid = document.querySelector('#plans .rail');
      if (grid && getComputedStyle(grid).gridTemplateColumns.split(' ').length !== 4) f.push('plans grid is not 4 columns at 1366');
    }
    const strays = [...document.querySelectorAll('img[src*="character/"]')].filter((i) => !i.closest('#stage') && !i.closest('#climber'));
    if (strays.length) f.push(`character image outside hero/climber: ${strays.length}`);
    const tape = document.querySelector('#work .tape');
    if (document.querySelector('#work .work-empty') && (!tape || tape.textContent.trim() !== 'בבנייה')) f.push('work empty state has no "בבנייה" tape');
    const num = document.querySelector('#plans .num');
    if (num && !getComputedStyle(num).webkitTextStrokeWidth.startsWith('2')) f.push('plan numbers are not outlined');
    if (getComputedStyle(document.querySelector('#about')).paddingTop.replace('px', '') < 100) f.push('about section spacing too small');
    return f;
  };

  // ---------- final-review fixes ----------
  // Maximize stays fully on screen (call at 375 and at 1024 on a fresh load).
  C.maxOnScreen = async () => {
    const f = [];
    await wait(1500); finish();
    document.querySelector('.dot[data-act="max"]').click(); await wait(80); finish();
    const r = document.getElementById('win').getBoundingClientRect();
    if (r.left < 0 || r.right > innerWidth) f.push(`maximized window off screen: ${Math.round(r.left)}..${Math.round(r.right)} of ${innerWidth}`);
    const x = document.querySelector('.dot[data-act="close"]').getBoundingClientRect();
    if (x.left < 0) f.push('× button off screen when maximized');
    document.querySelector('.dot[data-act="max"]').click(); await wait(80); finish();
    return f;
  };
  // Maximized then resized across 960px: refit (call at 1366, then it resizes itself via the caller).
  C.maxAfterResize = async () => {
    const f = [];
    await wait(1400);
    dispatchEvent(new Event('resize')); // a hidden preview pane does not deliver resize events by itself
    await wait(50); finish();
    const r = document.getElementById('win').getBoundingClientRect();
    if (r.left < 0 || r.right > innerWidth) f.push(`after resize the maximized window is off screen: ${Math.round(r.left)}..${Math.round(r.right)}`);
    return f;
  };
  // Review Focus 3: loaded at #contact, after the boot: no slide from the off-screen window.
  C.noSlideWhenScrolled = async () => {
    const f = [];
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, document.getElementById('contact').offsetTop); // the hash jump does not run in a hidden pane
    await wait(1600); finish();
    // make the window "open" again while the hero is far above: minimize, then restore from the dock
    document.querySelector('.dot[data-act="min"]').click(); await wait(800); climb();
    document.getElementById('bar').click(); await wait(700);
    climb(); // first frame after it is open again
    const t1 = parseFloat(document.getElementById('climber').style.top);
    await wait(700); climb();
    const t2 = parseFloat(document.getElementById('climber').style.top);
    if (Math.abs(t1 - t2) > 1) f.push(`climber slides in after boot (${t1.toFixed(0)} → ${t2.toFixed(0)})`);
    return f;
  };
  // Form status readable on the cream card.
  C.statusReadable = async () => {
    const f = [];
    const s = document.getElementById('contact-status');
    for (const k of ['ok', 'err']) {
      s.className = 'form-status ' + k; s.textContent = 'בדיקה';
      const [r, g, b] = getComputedStyle(s).color.match(/\d+/g).map(Number);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (lum > 0.45) f.push(`status "${k}" color too light on the card (luminance ${lum.toFixed(2)})`);
    }
    s.className = 'form-status'; s.textContent = '';
    return f;
  };
  // Hidden controls are not reachable.
  C.hiddenNotReachable = async () => {
    const f = [];
    await wait(1500); finish();
    const vis = (el) => getComputedStyle(el).visibility !== 'hidden';
    if (vis(document.getElementById('reopen'))) f.push('#reopen reachable while the window is open');
    if (vis(document.querySelector('.closed-note'))) f.push('closed note visible to screen readers while open');
    if (vis(document.querySelector('.mx-note'))) f.push('maximize note visible to screen readers while not maximized');
    if (vis(document.querySelector('.away-sign'))) f.push('away sign visible to screen readers while home');
    document.querySelector('.dot[data-act="close"]').click(); await wait(800); finish();
    if (vis(document.getElementById('win'))) f.push('window buttons reachable while closed');
    if (!vis(document.getElementById('reopen'))) f.push('#reopen not reachable while closed');
    document.getElementById('reopen').click(); await wait(80); finish();
    if (!vis(document.getElementById('win'))) f.push('window not visible after reopen');
    return f;
  };

  // Review Focus 4 + 5: header link to #contact, then the form status grows.
  C.ropeLink = async () => {
    const f = [];
    // smooth scrolling and rAF are paused in a hidden preview pane: jump instantly and run the frame by hand
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, 0); await wait(1600); finish();
    document.querySelector('.site-header a[href$="#contact"]').click();
    await wait(300); climb();
    const c = document.getElementById('climber'), send = document.getElementById('send');
    const dist = () => { const a = c.getBoundingClientRect(), b = send.getBoundingClientRect(); return Math.abs((a.top + a.height / 2) - (b.top + b.height / 2)); };
    if (!document.body.classList.contains('away')) f.push('not away after the #contact link');
    scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); await wait(400); climb();
    if (!c.classList.contains('landed')) f.push('not landed after reaching the bottom');
    const status = document.getElementById('contact-status');
    status.textContent = 'שורה ארוכה מאוד לבדיקה שמשנה את הגובה של הטופס ושל מה שמתחתיו בעמוד הזה';
    status.style.display = 'block';
    await wait(200); climb(); // rAF is paused in a hidden preview pane; run the frame by hand
    if (dist() > 1) f.push(`after the status text the climber is ${dist().toFixed(1)}px off the button`);
    status.textContent = '';
    return f;
  };
})();

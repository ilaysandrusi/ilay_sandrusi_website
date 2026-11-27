// The hero window: open delay, × − ⤢ buttons, minimize-to-corner morph, closed state.

export interface Area { left: number; right: number; top: number; bottom: number }

export interface HeroWindow {
  stage: HTMLElement;
  win: HTMLElement;
  inWinChar: HTMLElement;
  hero: HTMLElement;
  isOpen(): boolean;
  dragEnabled(): boolean;
  area(): Area;
  onChange(cb: () => void): void;
  pos: { x: number; y: number };
}

const OPEN_DELAY = 1200;
const MORPH_MS = 620;
const EASE = "cubic-bezier(.22,1,.36,1)";
type State = "min" | "max" | "closed" | null;
interface Box { left: number; top: number; width: number; height: number; radius: string }

export function initHeroWindow(): HeroWindow | null {
  const stage = document.getElementById("stage");
  const win = document.getElementById("win");
  const bar = document.getElementById("bar");
  const reopen = document.getElementById("reopen");
  const hero = stage?.closest<HTMLElement>(".hero");
  const inWinChar = win?.querySelector<HTMLElement>(".char");
  if (!stage || !win || !bar || !reopen || !hero || !inWinChar) return null;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // same breakpoint as the 960px @media in SceneOpen.astro (side-by-side layout, window can be dragged)
  const wide = matchMedia("(min-width: 960px)");
  // window sizes come from the CSS variables on .stage in SceneOpen.astro, so they are set in one place
  const stageCss = getComputedStyle(stage);
  // the fallbacks are today's sizes, in case a variable is renamed in the CSS
  const cssPx = (name: string, fallback: number) => parseFloat(stageCss.getPropertyValue(name)) || fallback;
  const WIN = cssPx("--win", 320), WIN_LIFT = cssPx("--win-lift", 10), WIN_MAX_W = cssPx("--win-max-w", 560), WIN_MAX_H = cssPx("--win-max-h", 430);
  const listeners: Array<() => void> = [];
  const changed = () => listeners.forEach((cb) => cb());
  const has = (c: string) => stage.classList.contains(c);

  const closedBox = document.getElementById("closedBox");
  const pos = { x: 0, y: 0 }; // where the visitor left the window, as an offset from home
  let userMoved = false;

  // desktop default spot: near the start of the left area, top lined up with the headline block
  const heroText = hero.querySelector<HTMLElement>(".hero-text");
  const placeDefault = () => {
    const st = stage.getBoundingClientRect(), b = area();
    const homeLeft = st.left + st.width / 2 - WIN / 2, homeTop = st.top + st.height / 2 - WIN / 2 - WIN_LIFT; // .win margins
    const wantLeft = b.left + 60;
    const wantTop = (heroText ? heroText.getBoundingClientRect().top : homeTop) + 26;
    pos.x = Math.min(b.right - WIN - homeLeft, Math.max(b.left - homeLeft, wantLeft - homeLeft));
    pos.y = Math.min(b.bottom - WIN - homeTop, Math.max(b.top - homeTop, wantTop - homeTop));
  };

  const area = (): Area => {
    const h = hero.getBoundingClientRect(), pad = 12;
    return { left: h.left + pad, right: h.left + h.width / 2 - pad, top: h.top + pad, bottom: h.bottom - pad };
  };

  // every state starts from the remembered spot; maximized grows around it, kept inside the area
  // when the box is wider than the area, pin it to the area's start so the × button stays on screen
  const fit = (lo: number, hi: number, v: number) => (lo > hi ? lo : Math.min(hi, Math.max(lo, v)));
  const applyPos = () => {
    let tx = pos.x, ty = pos.y;
    if (!wide.matches) {
      tx = 0; ty = 0; // stacked layout: the window stays centered in its stage
    } else if (has("is-max")) {
      const st = stage.getBoundingClientRect(), b = area();
      const W = Math.min(WIN_MAX_W, innerWidth * 0.92), H = WIN_MAX_H; // 0.92: the 92vw cap in the CSS
      const cx = st.left + st.width / 2, cy = st.top + st.height / 2;
      tx = fit(b.left - (cx - W / 2), b.right - (cx + W / 2), pos.x);
      ty = fit(b.top - (cy - H / 2), b.bottom - (cy + H / 2), pos.y);
    }
    win.style.translate = `${tx}px ${ty}px`;
    if (closedBox) closedBox.style.translate = `${pos.x}px ${pos.y}px`;
  };

  // ---- glide between two on-screen boxes; the classes hold the end state ----
  let morphing = false;
  const box = (r: DOMRect): Box => ({ left: r.left, top: r.top, width: r.width, height: r.height, radius: getComputedStyle(win).borderRadius });
  // the boxes are measured on screen, so the remembered offset (translate) must not be added on top during the glide
  const frame = (b: Box): Keyframe => ({ position: "fixed", left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`, bottom: "auto", margin: "0px", translate: "0px 0px", borderRadius: b.radius });
  const morph = (from: Box, to: Box, done?: () => void) => {
    morphing = true;
    win.style.transition = "none";
    const ms = reduce ? 0 : MORPH_MS;
    const a = win.animate([frame(from), frame(to)], { duration: ms, easing: EASE });
    let over = false;
    const finish = () => {
      if (over) return;
      over = true;
      a.cancel();
      win.style.transition = "";
      morphing = false;
      done?.();
      changed();
    };
    a.onfinish = finish;
    setTimeout(finish, ms + 60); // safety net if the finish event is late
  };

  const minimize = () => {
    const from = box(win.getBoundingClientRect());
    win.style.transition = "none";
    stage.classList.remove("is-max", "is-closed");
    stage.classList.add("is-min");
    morph(from, box(win.getBoundingClientRect())); // the class has already docked it
  };
  const restore = (then: State) => {
    const from = box(win.getBoundingClientRect());
    win.style.transition = "none";
    win.classList.add("restoring"); // the face stays on while it grows; the window's content fades in at the end
    stage.classList.remove("is-min");
    applyPos(); // back to the remembered spot, not the offset it had while maximized
    void win.offsetWidth;
    const to = box(win.getBoundingClientRect());
    morph(from, to, () => {
      win.classList.remove("restoring");
      if (then) { stage.classList.add(`is-${then}`); applyPos(); }
    });
  };
  const set = (s: State) => {
    if (morphing) return;
    const wasMin = has("is-min");
    if (s === "min") { if (!wasMin) minimize(); return; }
    if (wasMin) { restore(s); return; }
    stage.classList.remove("is-max", "is-closed");
    if (s) stage.classList.add(`is-${s}`);
    applyPos();
    changed();
  };

  stage.querySelectorAll<HTMLButtonElement>(".win .dot").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const act = b.dataset.act;
      if (act === "min") { set(has("is-min") ? null : "min"); return; }
      const next: State = act === "close" ? "closed" : "max";
      set(has(`is-${next}`) ? null : next);
    })
  );
  let justDragged = false;
  bar.addEventListener("click", () => { if (justDragged) return; if (has("is-min")) set(null); });

  // ---- drag by the bar, desktop only, inside the left half of the hero ----
  let drag: { x: number; y: number; dx: number; dy: number; base: Omit<Box, "radius">; moved: boolean } | null = null;
  const syncDragMode = () => {
    document.documentElement.classList.toggle("can-drag", wide.matches);
    if (!wide.matches) { pos.x = 0; pos.y = 0; userMoved = false; }
    else if (!userMoved) placeDefault();
    applyPos();
    changed();
  };
  bar.addEventListener("pointerdown", (e) => {
    if (!wide.matches || e.button !== 0 || morphing) return;
    if ((e.target as Element).closest(".dot")) return;
    if (["is-min", "is-max", "is-closed", "is-boot"].some(has)) return;
    const r = win.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, dx: pos.x, dy: pos.y, base: { left: r.left - pos.x, top: r.top - pos.y, width: r.width, height: r.height }, moved: false };
    try { bar.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    win.classList.add("dragging");
  });
  bar.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const b = area(), mx = e.clientX - drag.x, my = e.clientY - drag.y;
    if (Math.abs(mx) + Math.abs(my) > 3) { drag.moved = true; userMoved = true; }
    pos.x = Math.min(b.right - drag.base.width - drag.base.left, Math.max(b.left - drag.base.left, drag.dx + mx));
    pos.y = Math.min(b.bottom - drag.base.height - drag.base.top, Math.max(b.top - drag.base.top, drag.dy + my));
    applyPos();
    changed();
  });
  const endDrag = (e: PointerEvent) => {
    if (!drag) return;
    justDragged = drag.moved;
    setTimeout(() => { justDragged = false; }, 0);
    drag = null;
    win.classList.remove("dragging");
    try { bar.releasePointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
  };
  bar.addEventListener("pointerup", endDrag);
  bar.addEventListener("pointercancel", endDrag);
  wide.addEventListener("change", syncDragMode);
  syncDragMode();
  // keep it inside the area if the screen size changes
  addEventListener("resize", () => {
    if (wide.matches && !userMoved && !has("is-min")) placeDefault();
    if (has("is-max")) { applyPos(); changed(); return; }
    if (!wide.matches || (!pos.x && !pos.y) || has("is-min")) return;
    const r = (has("is-closed") && closedBox ? closedBox : win).getBoundingClientRect(), b = area();
    if (r.right > b.right) pos.x -= r.right - b.right;
    if (r.bottom > b.bottom) pos.y -= r.bottom - b.bottom;
    if (r.left < b.left) pos.x += b.left - r.left;
    applyPos();
    changed();
  });
  reopen.addEventListener("click", () => set(null));
  document.getElementById("appIcon")?.addEventListener("click", () => set(null)); // minimized app icon opens the window
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const t = e.target;
    if (t instanceof HTMLElement && (t.closest("input, textarea, select") || t.isContentEditable)) return; // typing in the form
    set(null);
  });

  // ---- open after the headline had a moment ----
  if (reduce) {
    stage.classList.remove("is-boot");
  } else {
    setTimeout(() => {
      stage.classList.add("is-opening");
      stage.classList.remove("is-boot");
      changed();
      setTimeout(() => stage.classList.remove("is-opening"), 1200);
    }, OPEN_DELAY);
  }

  return {
    stage, win, inWinChar, hero,
    isOpen: () => !has("is-min") && !has("is-closed") && !has("is-boot"),
    dragEnabled: () => wide.matches,
    area,
    onChange: (cb) => { listeners.push(cb); },
    pos,
  };
}

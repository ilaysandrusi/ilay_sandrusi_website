// The character leaves the hero window on a rope and lands next to the send button.
// The path is planned from the landing spot, so it arrives exactly when the button does.
import type { HeroWindow } from "./hero-window";

const ROPE_AT = 0.75; // rope column inside the sprite (ilay_character.py ROPE_X)
const EXIT_MS = 520;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => 1 - Math.pow(1 - k, 3);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Position through transform (CSS reads --x / --y / --r): moving with top/left counts as a layout shift on every scroll frame.
const moveTo = (el: HTMLElement, x: number, y: number) => {
  el.style.setProperty("--x", `${x}px`);
  el.style.setProperty("--y", `${y}px`);
};

export function initRopeDescent(hero: HeroWindow): void {
  const climber = document.getElementById("climber");
  const rope = document.getElementById("rope");
  const send = document.getElementById("send");
  if (!climber || !rope || !send) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // phones get no rope: he just waits by the send button, pointing
  const phone = matchMedia("(max-width: 767px)");
  const still = () => reduce || phone.matches;
  let away = false, landed = false, raf = 0, exitT0 = -Infinity, first = true, landedAt = Infinity;

  const setLanded = (v: boolean) => {
    if (v === landed) return;
    landed = v;
    climber.classList.toggle("landed", v);
  };
  const setAway = (v: boolean) => {
    if (v === away) return;
    away = v;
    // slide out of the window only when he is visibly in it; otherwise appear on his planned spot
    const r = hero.inWinChar.getBoundingClientRect();
    const onScreen = r.bottom > 0 && r.top < innerHeight;
    exitT0 = v && !first && onScreen ? performance.now() : -Infinity;
    document.body.classList.toggle("away", v);
    if (!v) setLanded(false);
  };

  // landing spot (viewport x, page y): left of the button, centered on it
  const landing = (cw: number, ch: number, sY: number) => {
    const b = send.getBoundingClientRect();
    let x = b.left - cw - 14;
    if (x < 6) x = Math.max(4, b.left - cw * 0.45); // no room: stand on the button's empty left end
    return { x, pageY: b.top + sY + b.height / 2 - ch * 0.5 };
  };

  // the mobile WhatsApp bar covers the bottom of the screen on phones
  const bottomBar = document.querySelector<HTMLElement>(".mobile-bar");
  const safeBottom = () => (bottomBar && getComputedStyle(bottomBar).display !== "none" ? bottomBar.getBoundingClientRect().height : 0);

  const placeReduced = () => {
    const cw = climber.offsetWidth, ch = climber.offsetHeight;
    const b = send.getBoundingClientRect();
    const show = hero.isOpen() && b.bottom > 0 && b.top < innerHeight - safeBottom();
    climber.classList.toggle("rm-show", show);
    setLanded(show);
    if (!show) return;
    const l = landing(cw, ch, scrollY);
    moveTo(climber, l.x, l.pageY - scrollY);
  };

  const place = () => {
    raf = 0;
    if (still()) {
      setAway(false);
      rope.style.height = "0px";
      climber.style.setProperty("--r", "0deg");
      placeReduced();
      return;
    }
    climber.classList.remove("rm-show");
    const vh = innerHeight, sY = scrollY, cw = climber.offsetWidth, ch = climber.offsetHeight;
    const s0 = hero.hero.offsetHeight * 0.12;
    setAway(sY > s0 && hero.isOpen());
    first = false;
    if (!away) return;

    // rope tie point on the window's bottom edge: right end of the area -> left corner, left end -> right corner
    const w = hero.win.getBoundingClientRect();
    let side = 0.5;
    if (hero.dragEnabled()) {
      const a = hero.area();
      const minC = a.left + w.width / 2, maxC = a.right - w.width / 2;
      side = maxC > minC ? clamp01((w.left + w.width / 2 - minC) / (maxC - minC)) : 0.5;
    }
    const tieX = lerp(w.right - 16, w.left + 16, side);
    const tiePageY = w.bottom - 2 + sY;

    const land = landing(cw, ch, sY);
    const maxScroll = document.documentElement.scrollHeight - vh;
    // touch down as soon as he and the button both fit on screen (lowest spot above the bottom edge / bar)
    let yEnd = Math.max(84, vh - safeBottom() - 8 - ch);
    let sEnd = land.pageY - yEnd;
    if (sEnd > maxScroll) { sEnd = maxScroll; yEnd = land.pageY - maxScroll; }
    sEnd = Math.max(sEnd, s0 + 1);

    const p = clamp01((sY - s0) / (sEnd - s0));
    let x = lerp(tieX - cw * ROPE_AT, land.x, ease(p));
    let y = lerp(tiePageY - s0 + 18, yEnd, p);
    // once landed, a layout change under the button (e.g. the form status) keeps him landed; scrolling back up releases him
    const isLanded = sY >= sEnd - 0.5 || (landed && sY >= landedAt - 0.5);
    if (isLanded && !landed) landedAt = sY;
    if (isLanded) { x = land.x; y = land.pageY - sY; }
    setLanded(isLanded);

    const k = clamp01((performance.now() - exitT0) / EXIT_MS);
    if (k < 1) {
      const r = hero.inWinChar.getBoundingClientRect(), e = ease(k);
      x = lerp(r.left + (r.width - cw) / 2, x, e);
      y = lerp(r.bottom - ch, y, e);
      raf = requestAnimationFrame(place);
    }
    moveTo(climber, x, y);

    const ax = tieX, ay = tiePageY - sY;
    const dx = x + cw * ROPE_AT - ax, dy = y + 6 - ay;
    const showRope = !landed && dy > 0;
    const ang = -Math.atan2(dx, dy);
    moveTo(rope, ax, ay);
    rope.style.height = `${showRope ? Math.hypot(dx, dy) : 0}px`;
    rope.style.setProperty("--r", `${ang}rad`);
    climber.style.setProperty("--r", `${showRope ? Math.max(-12, Math.min(12, ang * 57.3 * 0.5)) : 0}deg`);
  };

  const req = () => { if (!raf) raf = requestAnimationFrame(place); };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  phone.addEventListener("change", req);
  hero.onChange(req);
  new ResizeObserver(req).observe(document.body); // e.g. the form status text moves the button
  place();
  if (import.meta.env.DEV) (window as unknown as { __climbForTest: () => void }).__climbForTest = place;
}

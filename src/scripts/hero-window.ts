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
}

const OPEN_DELAY = 1200;
const MORPH_MS = 620;
const EASE = "cubic-bezier(.22,1,.36,1)";
type State = "min" | "max" | "closed" | null;
interface Box { left: number; top: number; width: number; height: number }

export function initHeroWindow(): HeroWindow | null {
  const stage = document.getElementById("stage");
  const win = document.getElementById("win");
  const bar = document.getElementById("bar");
  const reopen = document.getElementById("reopen");
  const hero = stage?.closest<HTMLElement>(".hero");
  const inWinChar = win?.querySelector<HTMLElement>(".char");
  if (!stage || !win || !bar || !reopen || !hero || !inWinChar) return null;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 960px)");
  const listeners: Array<() => void> = [];
  const changed = () => listeners.forEach((cb) => cb());
  const has = (c: string) => stage.classList.contains(c);

  const area = (): Area => {
    const h = hero.getBoundingClientRect(), pad = 12;
    return { left: h.left + pad, right: h.left + h.width / 2 - pad, top: h.top + pad, bottom: h.bottom - pad };
  };

  // ---- glide between two on-screen boxes; the classes hold the end state ----
  let morphing = false;
  const box = (r: DOMRect): Box => ({ left: r.left, top: r.top, width: r.width, height: r.height });
  const frame = (b: Box): Keyframe => ({ position: "fixed", left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`, bottom: "auto", margin: "0px" });
  const dock = (): Box => {
    const r = win.getBoundingClientRect(); // already docked by the class
    return box(r);
  };
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
    morph(from, dock());
  };
  const restore = (then: State) => {
    const from = box(win.getBoundingClientRect());
    win.style.transition = "none";
    stage.classList.remove("is-min");
    void win.offsetWidth;
    const to = box(win.getBoundingClientRect());
    morph(from, to, () => { if (then) stage.classList.add(`is-${then}`); });
  };
  const set = (s: State) => {
    if (morphing) return;
    const wasMin = has("is-min");
    if (s === "min") { if (!wasMin) minimize(); return; }
    if (wasMin) { restore(s); return; }
    stage.classList.remove("is-max", "is-closed");
    if (s) stage.classList.add(`is-${s}`);
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
  bar.addEventListener("click", () => { if (has("is-min")) set(null); });
  reopen.addEventListener("click", () => set(null));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(null); });

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
  };
}

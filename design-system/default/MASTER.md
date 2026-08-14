# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** בניית אתרים איליי  
**Stack:** Astro (static), Hebrew RTL  
**Generated via:** ui-ux-pro-max (then brand-locked)  
**Updated:** 2026-08-13

---

## Brand lock (do not auto-replace)

Pro Max suggested Liquid Glass + indigo + Noto Sans Hebrew.  
**Rejected for this project.** Keep the live neo-editorial system:

| Role | Hex | Token |
|------|-----|-------|
| Paper | `#f6f1e7` | `--paper` |
| Paper soft | `#efe7d8` | `--paper-soft` |
| Ink | `#171410` | `--ink` |
| Ink soft | `#5a5348` | `--ink-soft` |
| Accent / CTA | `#ff4b26` | `--accent` |
| Accent dark | `#d93a1a` | `--accent-dark` |
| Card | `#fffdf8` | `--card` |

**Typography:** Suez One (display) + Heebo (body) — keep.

**Pattern in use:** cinematic funnel — Open (meet Ilay) → About → Choose → Plans (not stacked marketing sections).

**Style keywords:** neo-brutal editorial, high contrast ink/paper, accent punch, personal/humble Hebrew voice.

---

## Pro Max checklist (enforced)

- [x] Skip link + `#main` landmark
- [x] Visible `:focus-visible` rings (accent, 3px)
- [x] Touch targets ≥44×44px (buttons, nav, scene dots hit area, mobile bar)
- [x] ≥8px gap between touch targets
- [x] `cursor: pointer` on clickables; clear `:active` feedback
- [x] Transitions 150–300ms; `prefers-reduced-motion` + noscript reveal fallback
- [x] `touch-action: manipulation`; `overscroll-behavior` on body/rail
- [x] Safe-area insets for fixed header + mobile bar
- [x] No emoji structural icons (SVG / CSS markers)
- [x] Body/secondary contrast tuned for WCAG AA on paper and ink scenes
- [x] One primary CTA hierarchy in hero; sticky WhatsApp/call on mobile

## Avoid

- Purple/indigo redesign, glassmorphism takeover, dark-mode flip
- Card spam in hero, emoji as icons, removing focus outlines
- Hover-only interactions without keyboard/touch equivalents

## Spacing rhythm

`--space-xs` 4px · `--space-sm` 8px · `--space-md` 16px · `--space-lg` 24px · `--space-xl` 32px · `--space-2xl` 48px

# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** בניית אתרים איליי  
**Stack:** Astro (static), Hebrew RTL  
**Generated via:** ui-ux-pro-max (then brand-locked)  
**Updated:** 2026-11-27

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

**Typography:** Fredoka 500/600/700 (headings, buttons, anything bold) + Varela Round (body, one weight only). Suez One only for the "איליי." logo and the faint "א." mark. Self-hosted through @fontsource (see `src/layouts/Layout.astro`) — keep.

**Pattern in use:** cinematic funnel — Open (meet Ilay, with the character's window) → Work → About → Choose → Plans → Contact form (not stacked marketing sections). The section list for the menu and footer is `src/data/nav.ts`.

**Style keywords:** neo-brutal editorial, high contrast ink/paper, accent punch, personal/humble Hebrew voice.

---

## Pro Max checklist (enforced)

- [x] Skip link + `#main` landmark
- [x] Visible `:focus-visible` rings (accent, 3px)
- [x] Touch targets ≥44×44px (buttons, nav, window buttons hit area, mobile bar)
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

Section padding: `--sp-section` (light sections) and `--sp-section-lg` (dark sections). Side margin: the global `.container` (20px, 32px from 768px). Section titles: the global `.scene-title`. Header height: `--header-h` (62px, 74px from 768px). All in `src/styles/global.css`.

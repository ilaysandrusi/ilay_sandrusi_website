/**
 * The home page sections, in page order. The header menu and the footer both read this list,
 * so adding, renaming or moving a section is one change here (plus the section's own component).
 * `id` must match the section's id="" in its component.
 */
export const sections = [
  { id: "work", label: "פרויקטים" },
  { id: "about", label: "עליי" },
  { id: "choose", label: "בחירה" },
  { id: "plans", label: "מסלולים" },
  { id: "contact", label: "פרטים" },
] as const;

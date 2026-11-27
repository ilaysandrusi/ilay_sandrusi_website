/**
 * Portfolio projects, shown in the "תיק עבודות" section in this order.
 * While the list is empty, the section shows the slow carousel of site types instead.
 *
 * To add a project:
 * 1. Put its screenshot in src/assets/work (png, jpg or webp; any size, it is resized at build time).
 * 2. Add an entry below, with `image` set to the file name, e.g. "my-shop.png".
 *
 * Do not invent portfolio items: only real, launched sites.
 */
export type Project = {
  name: string;
  /** Short line above the description, e.g. "חנות אונליין". */
  kind: string;
  text: string;
  /** File name in src/assets/work. Without it the card shows a placeholder. */
  image?: string;
  imageAlt: string;
  /** Link to the live site; the card opens it in a new tab. */
  href?: string;
};

export const projects: Project[] = [];

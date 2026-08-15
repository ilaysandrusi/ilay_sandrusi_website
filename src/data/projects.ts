/** Drop screenshots in /public/work, then fill name, kind, text, image, href. */
export type Project = {
  name: string;
  kind: string;
  text: string;
  image?: string;
  imageAlt: string;
  href?: string;
};

/** Empty until real launched sites are ready. Do not invent portfolio items. */
export const projects: Project[] = [];

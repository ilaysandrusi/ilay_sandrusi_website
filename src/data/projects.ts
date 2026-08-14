/** Drop screenshots in /public/work, then fill name, kind, text, image, href. */
export type Project = {
  name: string;
  kind: string;
  text: string;
  image?: string;
  imageAlt: string;
  href?: string;
};

export const projects: Project[] = [
  {
    name: "פרויקט ראשון",
    kind: "",
    text: "",
    image: "",
    imageAlt: "",
  },
  {
    name: "פרויקט שני",
    kind: "",
    text: "",
    image: "",
    imageAlt: "",
  },
];

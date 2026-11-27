import { getCollection } from "astro:content";

export { instagramLink } from "./contact";

/** Published guides, newest first. Drafts are included only in dev. */
export async function getGuides() {
  const all = await getCollection("guides", ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

const dateFormat = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatDate = (date: Date) => dateFormat.format(date);

import type { APIRoute } from "astro";
import { getGuides } from "../data/guides";

/** Built at deploy time, so every published guide is listed without manual edits. */
export const GET: APIRoute = async ({ site }) => {
  const rawBase = import.meta.env.BASE_URL;
  const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
  const abs = (path: string) => new URL(`${base}${path}`, site).href;
  const guides = (await getGuides()).filter((g) => !g.data.draft);

  const day = (d: Date) => d.toISOString().slice(0, 10);
  const changed = (g: (typeof guides)[number]) => g.data.updated ?? g.data.date;
  // the blog index changes when a guide is added or updated
  const newest = guides.map(changed).sort((a, b) => b.getTime() - a.getTime())[0];

  const urls = [
    { loc: abs(""), changefreq: "monthly", priority: "1.0" },
    { loc: abs("blog/"), ...(newest ? { lastmod: day(newest) } : {}), changefreq: "weekly", priority: "0.8" },
    ...guides.map((g) => ({
      loc: abs(`blog/${g.id}/`),
      lastmod: day(changed(g)),
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${"lastmod" in u ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

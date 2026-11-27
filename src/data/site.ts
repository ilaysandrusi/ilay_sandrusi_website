/** Site-wide values and URL helpers. Pages and components import from here instead of repeating them. */

export const siteName = "איליי סנדרוסי";

/** Page title for every page except the home page: "בלוג" → "בלוג · איליי סנדרוסי". */
export const pageTitle = (title: string) => `${title} · ${siteName}`;

const rawBase = import.meta.env.BASE_URL;
/** The site's base path with a trailing slash, e.g. "/ilay_sandrusi_website/". */
export const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

/** Full URL of a path inside the site: absUrl("blog/", Astro.site). */
export const absUrl = (path: string, site: URL | undefined) => new URL(`${base}${path.replace(/^\//, "")}`, site).href;

/** Path of a file in /public: publicPath("character/think.png"). */
export const publicPath = (path: string) => `${base}${path.replace(/^\//, "")}`;

/** "" on the home page (section links just scroll), the base path on any other page (they lead back home). */
export const homePrefix = (pathname: string) => {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return path === base ? "" : base;
};

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Guides: one Markdown file per guide in src/content/guides.
 * Files that start with "_" are ignored (see _תבנית.md).
 */
const guides = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    /** Set when the guide changes after it was published; search engines read it as the last update. */
    updated: z.coerce.date().optional(),
    /** Short topic label shown as a pill, e.g. "Claude Code". */
    tag: z.string().optional(),
    /** Optional video shown under the title. Paths are inside /public, e.g. "media/my-guide/guide.mp4". */
    video: z.string().optional(),
    poster: z.string().optional(),
    /** Video length for search engines, ISO 8601, e.g. "PT1M32S" for 1:32. */
    videoDuration: z.string().optional(),
    videoNote: z.string().optional(),
    /** Credit line under the video (music licence, etc). May contain links. */
    videoCredit: z.string().optional(),
    /** Drafts show only in `npm run dev`, never on the live site. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };

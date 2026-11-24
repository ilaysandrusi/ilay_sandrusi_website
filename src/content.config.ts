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
    /** Short topic label shown as a pill, e.g. "Claude Code". */
    tag: z.string().optional(),
    /** Link to the Instagram post or reel this guide belongs to. */
    instagram: z.string().url().optional(),
    /** Drafts show only in `npm run dev`, never on the live site. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };

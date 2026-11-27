// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://ilaysandrusi.github.io',
  base: '/ilay_sandrusi_website/',
  vite: {
    build: {
      // keep font files as separate files: inlined into the CSS they made every page download all of them up front
      assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
    },
  },
});
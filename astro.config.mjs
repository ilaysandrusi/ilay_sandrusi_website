// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      // Allow access through the Cloudflare quick-tunnel preview URL.
      allowedHosts: [".trycloudflare.com"],
    },
  },
});

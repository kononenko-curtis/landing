// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kononenko.duckdns.org',
  // Emit /page/index.html instead of /page.html, so nginx's try_files serves
  // clean URLs with no rewrite rules of its own.
  build: { format: 'directory' },
  compressHTML: true,
});

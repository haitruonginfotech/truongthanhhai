import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.SITE_URL || 'https://truongthanhhai.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
});

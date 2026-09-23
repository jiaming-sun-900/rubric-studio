import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // The live demo is served from a sub-path on GitHub Pages
  // (/rubric-studio/), so the deploy workflow builds with BASE_PATH set to it.
  // Everything else, `npm run dev` included, stays at the domain root. Both the
  // router basename and the reload in Layout read the result back off
  // import.meta.env.BASE_URL.
  //
  // Deep links also need the host to answer unknown paths with index.html, the
  // usual single-page-app rule. Without it, opening /dashboard directly is a
  // 404 from the static server before the router ever runs. The workflow
  // covers that on Pages by shipping a copy of index.html as 404.html.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})

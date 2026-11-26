import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'node:fs'

// `vite preview` (used by the Playwright e2e suite) sends the same security
// headers as production, read straight from vercel.json, so the browser
// tests run under the real Content-Security-Policy instead of none.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
const productionHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === '/(.*)').headers
    .filter((h) => h.key !== 'Strict-Transport-Security')
    .map((h) => [h.key, h.value]),
)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Link previews (WhatsApp, Discord, X…) need an absolute image URL, so
  // index.html uses %SITE_URL%. Set VITE_SITE_URL to the live address
  // (e.g. https://codequest.example.com) in the host's environment.
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '')

  return {
  plugins: [
    react(),
    {
      name: 'site-url-in-html',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
  ],
  preview: { headers: productionHeaders },
  build: {
    // The main chunk holds the curriculum content (100 worlds + 28 side
    // quests, growing as side quests gain real hands-on lessons) and all 4
    // locales' translations, which genuinely are needed on first paint for
    // the dashboard's progress counts — so raw size here keeps climbing as
    // content grows, not a red flag by itself. Gzip size is what actually
    // matters for load time. Ranked Mode, Settings, the character rig, the
    // login calendar, and compiled-language lessons are already split into
    // their own lazy-loaded chunks (see the `lazy()` imports in App.jsx).
    // TODO once all 28 side quests are done: split sidequests.js into a
    // lazy-loaded per-quest chunk, with just {id, name, icon, lessonCount}
    // kept in the main bundle for the dashboard's progress math — see
    // ROADMAP.md "Shrink the main bundle".
    chunkSizeWarningLimit: 900,
  },
  }
})

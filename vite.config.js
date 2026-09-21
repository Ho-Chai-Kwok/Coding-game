import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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
  build: {
    // The main chunk holds the curriculum content (100 worlds + 28 side
    // quests) and all 4 locales' translations, which genuinely are needed
    // on first paint for the dashboard's progress counts — so ~540kB raw
    // here is expected, not a red flag. It gzips down to ~170kB, which is
    // what actually matters for load time. Ranked Mode, Settings, the
    // character rig, and the login calendar are already split into their
    // own lazy-loaded chunks (see the `lazy()` imports in App.jsx).
    chunkSizeWarningLimit: 600,
  },
  }
})

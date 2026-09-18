import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
})

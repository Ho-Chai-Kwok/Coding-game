import { defineConfig } from "@playwright/test";

// CQ-19: browser-level repros for CQ-01 (sandbox timeout/hang), CQ-04
// (routing/Back button), and CQ-05 (locked-screen overflow on a phone
// viewport) — the three bugs from docs/QA_REPORT.md that only show up with a
// real browser, not a unit test. Builds the app and serves the static
// dist/ output, same as production, rather than the dev server, so this
// also catches build-only breakage.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
  },
  webServer: {
    // vite preview serves the already-built dist/ as static files — same
    // as production — with no extra dependency (serve's own compression
    // dependency carries an unresolved advisory as of this writing).
    command: "npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});

import { defineConfig } from "@playwright/test";

// Daily health check against the LIVE site (not a local build) — see
// tests/live/ and .github/workflows/daily-health.yml. Point it elsewhere
// with LIVE_URL=https://... npx playwright test -c playwright.live.config.js
export default defineConfig({
  testDir: "./tests/live",
  timeout: 60000,
  workers: 1,
  retries: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.LIVE_URL || "https://codequest-learnfromzero.vercel.app",
  },
});

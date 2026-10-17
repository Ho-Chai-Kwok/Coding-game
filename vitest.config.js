import { defineConfig } from "vitest/config";

// Unit tests only here — see tests/e2e/ (Playwright) for the browser-level
// CQ-01/CQ-04/CQ-05 repros. Kept as a separate config/runner from
// vite.config.js on purpose: these tests run in plain Node, no browser,
// no dev server.
export default defineConfig({
  test: {
    include: ["src/**/*.test.js"],
    environment: "node",
    // Only 3 small test files — one fork avoids the overhead/flakiness of
    // spawning several worker processes under CI or a loaded machine.
    pool: "forks",
    forks: { singleFork: true },
  },
});

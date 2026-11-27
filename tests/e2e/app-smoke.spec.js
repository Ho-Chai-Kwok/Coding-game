import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAndEnter, completedThrough } from "./helpers.js";

// Launch-readiness checks across the whole app (not one bug repro):
//   - every main screen renders with no JS errors and no CSP violations,
//     under the same security headers production sends (vercel.json)
//   - axe-core finds no critical/serious accessibility violations (CQ-10f)
//   - progress survives a reload (guest mode's only storage)
//   - the Practice Gym (CQ-08) is separate from the main path

const SCREENS = [
  ["Home", "#/"],
  ["Learn", "#/learn"],
  ["Side Quests", "#/quests"],
  ["Practice", "#/practice"],
  ["Ranked", "#/ranked"],
  ["Characters", "#/characters"],
  ["Calendar", "#/calendar"],
  ["Code Helper", "#/helper"],
  ["Settings", "#/settings"],
  ["Kernel Dash", "#/kernel-dash"],
];

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" || /Content Security Policy/i.test(text)) {
      // Guest mode has no Supabase project configured in CI; network
      // failures to outside services are not app errors.
      if (/Failed to load resource|net::ERR_/i.test(text)) return;
      errors.push(`console: ${text}`);
    }
  });
  return errors;
}

test("production security headers are sent", async ({ page }) => {
  const res = await page.goto("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

for (const scheme of ["light", "dark"]) for (const [name, hash] of SCREENS) {
  test(`${name} screen (${scheme}) renders with no errors and no serious a11y violations`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const errors = watchErrors(page);
    await seedAndEnter(page, completedThrough(2, 5), "javascript");
    await page.goto(`/${hash}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    await expect(page.locator("#root")).not.toBeEmpty();
    // A crash would leave an error boundary / blank main.
    await expect(page.locator("main")).toHaveCount(1);

    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = axe.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(
      serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) e.g. ${v.nodes[0]?.target.join(" ")}`),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("a JavaScript lesson can be passed and progress survives a reload", async ({ page }) => {
  const errors = watchErrors(page);
  await seedAndEnter(page, {}, "javascript");
  await page.goto("/#/learn/w/1/l/1-1", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const skip = page.locator("text=/^skip/i").first();
  if (await skip.count()) await skip.click().catch(() => {});

  // World 1, lesson 1: print exactly "Hello, World!". Typed for real
  // (the editor blocks paste), then Run.
  const editor = page.locator(".code-challenge__editor textarea, .code-challenge__editor [contenteditable], textarea").first();
  await editor.click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type('console.log("Hello, World!");');
  await page.getByRole("button", { name: /run code/i }).first().click();
  await expect(page.locator("text=/Hello, World!/").last()).toBeVisible();
  await page.getByRole("button", { name: /continue/i }).click();

  const savedProgress = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("codequest-progress") || "{}").worldsState ?? {});
  await expect.poll(savedProgress).toMatchObject({ "1-1": "completed" });

  await page.reload({ waitUntil: "networkidle" });
  await expect.poll(savedProgress).toMatchObject({ "1-1": "completed" });
  await page.goto("/#/learn/w/1", { waitUntil: "networkidle" });
  const skip2 = page.locator("text=/^skip/i").first();
  if (await skip2.count()) await skip2.click().catch(() => {});
  // Stage 2 is open after the reload, so the unlock was saved too.
  await expect(page.locator(".level-node").nth(1)).toBeEnabled();
  expect(errors).toEqual([]);
});

test("Practice Gym is a separate section, closed for a brand-new player", async ({ page }) => {
  await seedAndEnter(page, {}, "javascript");
  await page.goto("/#/learn", { waitUntil: "networkidle" });
  const gym = page.locator(".world-map__gym");
  await expect(gym).toHaveCount(1);
  await expect(page.locator(".world-map__chapter:not(.world-map__gym) .world-card")).toHaveCount(100);
  await expect(gym.locator(".world-card")).toHaveCount(50);
  await expect(gym.locator(".world-card:not([disabled])")).toHaveCount(0);
});

test("Practice Gym opens after World 1 and a drill world can be entered", async ({ page }) => {
  await seedAndEnter(page, completedThrough(1, 5), "javascript");
  await page.goto("/#/learn", { waitUntil: "networkidle" });
  const gym = page.locator(".world-map__gym");
  await expect(gym.locator(".world-card:not([disabled])")).toHaveCount(50);
  await gym.locator(".world-card").last().click();
  await page.waitForTimeout(500);
  expect(page.url()).toMatch(/#\/learn\/w\/150/);
  const skip = page.locator("text=/^skip/i").first();
  if (await skip.count()) await skip.click().catch(() => {});
  await expect(page.locator(".level-node").first()).toBeEnabled();
});

test("after a redeploy, a missing old chunk triggers one reload instead of a crash", async ({ page }) => {
  await seedAndEnter(page, completedThrough(1, 5), "javascript");
  let blocked = 0;
  // Simulate the old deploy's file being gone: the first request for the
  // Settings chunk 404s, later ones (after the reload) succeed.
  await page.route(/\/assets\/Settings-[^/]+\.js$/, (route) => {
    if (blocked++ === 0) return route.fulfill({ status: 404, body: "gone" });
    return route.continue();
  });
  await page.evaluate(() => { window.location.hash = "#/settings"; });
  await expect(page.locator(".settings, [class*='settings']").first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".error-boundary")).toHaveCount(0);
  expect(blocked).toBeGreaterThanOrEqual(2);
});

test("Home counts worlds, not every lesson in the game", async ({ page }) => {
  await seedAndEnter(page, completedThrough(2, 5), "javascript");
  await page.goto("/#/", { waitUntil: "networkidle" });
  await expect(page.locator(".mode-select__progress-label")).toHaveText("2/100 worlds complete");
});

test("a Python player's first topic intro shows Python, not JavaScript", async ({ page }) => {
  await seedAndEnter(page, {}, "python");
  await page.goto("/#/learn", { waitUntil: "networkidle" });
  await page.locator(".world-card").first().click();
  const intro = page.locator(".topic-intro");
  await expect(intro.locator(".topic-intro__topic-label")).toHaveText(/print\(\)/);
  await expect(intro).not.toContainText("console.log");
  await expect(intro.locator(".topic-intro__caption")).toHaveText('Like this: print("Hello!")', { timeout: 10000 });
});

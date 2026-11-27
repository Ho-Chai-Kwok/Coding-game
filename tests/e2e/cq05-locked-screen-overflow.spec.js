import { test, expect } from "@playwright/test";
import { seedAndEnter } from "./helpers.js";

// CQ-05: on a phone-width screen, the locked Quests and locked Ranked
// screens (both shown to a brand-new guest, before the skill gate opens
// them) overflowed horizontally and the bottom nav sat off-screen.

test.use({ viewport: { width: 390, height: 844 } });

test("locked Quests screen has no horizontal overflow at 390px", async ({ page }) => {
  await seedAndEnter(page, {}); // fresh guest, 0 lessons completed
  await page.locator("text=/^quests$/i").first().click();
  await page.waitForTimeout(500);

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("locked Ranked screen has no horizontal overflow at 390px", async ({ page }) => {
  await seedAndEnter(page, {}); // fresh guest, below the skill gate
  const rankedTab = page.locator("text=/^ranked$/i").first();
  await rankedTab.click();
  await page.waitForTimeout(500);

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("bottom nav stays within the viewport on the locked Ranked screen", async ({ page }) => {
  await seedAndEnter(page, {});
  await page.locator("text=/^ranked$/i").first().click();
  await page.waitForTimeout(500);

  const nav = page.locator("nav, [class*=nav]").last();
  const box = await nav.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y + box.height).toBeLessThanOrEqual(844 + 1); // +1px rounding slack
});

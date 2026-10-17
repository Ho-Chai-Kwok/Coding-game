import { test, expect } from "@playwright/test";
import { seedAndEnter, completedThrough } from "./helpers.js";

// CQ-04: screen changes never touched browser history, so the Back
// button (and Android's hardware Back) just left the site entirely.
// Navigation now pushes a hash per screen, and reloading a deep link
// reconstructs the same screen instead of resetting to Home.

test("reloading a deep link into a lesson lands back on that exact lesson", async ({ page }) => {
  await seedAndEnter(page, completedThrough(1, 5));
  await page.locator("text=/^learn$/i").first().click();
  await page.waitForTimeout(500);
  await page.locator(".world-card").first().click();
  await page.waitForTimeout(500);
  const skipBtn = page.locator("text=/^skip/i").first();
  if (await skipBtn.count()) await skipBtn.click().catch(() => {});
  await page.locator(".level-node").first().click();
  await page.waitForTimeout(500);

  expect(page.url()).toMatch(/#\/learn\/w\/1\/l\/1-1/);

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  expect(page.url()).toMatch(/#\/learn\/w\/1\/l\/1-1/);
  // Still actually showing a lesson, not kicked back to the world map.
  await expect(page.locator(".code-challenge__editor, .quiz-challenge")).toHaveCount(1);
});

test("browser Back from a lesson goes to the world map, not out of the app", async ({ page }) => {
  await seedAndEnter(page, completedThrough(1, 5));
  await page.locator("text=/^learn$/i").first().click();
  await page.waitForTimeout(500);
  await page.locator(".world-card").first().click();
  await page.waitForTimeout(500);
  const skipBtn = page.locator("text=/^skip/i").first();
  if (await skipBtn.count()) await skipBtn.click().catch(() => {});
  await page.locator(".level-node").first().click();
  await page.waitForTimeout(500);

  await page.goBack();
  await page.waitForTimeout(500);
  // Back from a lesson should land on World 1's map (level nodes visible
  // again), and the app must still be the page we're on.
  expect(page.url()).toContain("/#/learn/w/1");
  await expect(page.locator(".level-node").first()).toBeVisible();

  await page.goBack();
  await page.waitForTimeout(500);
  // Back again from World 1's own map goes to the worlds list (#/learn),
  // one level up — not all the way to Home in a single step.
  expect(new URL(page.url()).hash).toBe("#/learn");

  await page.goBack();
  await page.waitForTimeout(500);
  // One more Back from the worlds list finally reaches Home, still
  // inside the app the whole way.
  expect(new URL(page.url()).hash).toMatch(/^#\/?$/);
});

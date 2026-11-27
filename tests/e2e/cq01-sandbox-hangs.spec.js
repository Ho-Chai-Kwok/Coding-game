import { test, expect } from "@playwright/test";
import { seedAndEnter, completedThrough } from "./helpers.js";

// CQ-01 / CQ-01b: a learner's code used to run on the main thread (JS),
// or could reach the real page (Python's `import js`), or had no
// thread-independent bound at all (React). All three now get a friendly
// timeout instead of freezing the tab, and none can touch real progress.

test("JS: an infinite loop times out with a friendly message, UI stays responsive", async ({ page }) => {
  await seedAndEnter(page, completedThrough(1, 0), "javascript");
  await page.locator("text=/^learn$/i").first().click();
  await page.waitForTimeout(500);
  await page.locator(".world-card").first().click();
  await page.waitForTimeout(500);
  const skipBtn = page.locator("text=/^skip/i").first();
  if (await skipBtn.count()) await skipBtn.click().catch(() => {});
  await page.locator(".level-node").first().click();
  await page.waitForTimeout(500);

  const editor = page.locator(".code-challenge__editor");
  await expect(editor).toHaveCount(1, { timeout: 5000 });
  await editor.fill("while(true){}");
  await page.locator(".code-challenge__run").click();

  // The page must stay responsive the whole time the loop runs — not just
  // eventually recover after it throws.
  const responsive = await Promise.race([
    page.evaluate(() => 1).then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 1500)),
  ]);
  expect(responsive).toBe(true);

  await expect(page.locator(".code-challenge__result-detail")).toContainText(/too long|never stops/i, {
    timeout: 6000,
  });
});

test("Python: `while True: pass` times out, and `import js` can't touch progress", async ({ page }) => {
  await seedAndEnter(page, completedThrough(1, 0));
  await page.locator("text=/^learn$/i").first().click();
  await page.waitForTimeout(500);
  await page.locator(".world-card").first().click();
  await page.waitForTimeout(500);
  const skipBtn = page.locator("text=/^skip/i").first();
  if (await skipBtn.count()) await skipBtn.click().catch(() => {});
  await page.locator(".level-node").first().click();
  await page.waitForTimeout(500);

  const editor = page.locator(".code-challenge__editor");
  await expect(editor).toHaveCount(1, { timeout: 5000 });

  await editor.fill("while True:\n    pass");
  await page.locator(".code-challenge__run").click();
  const responsive = await Promise.race([
    page.evaluate(() => 1).then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 1500)),
  ]);
  expect(responsive).toBe(true);
  await expect(page.locator(".code-challenge__result-detail")).toContainText(/too long|never stops/i, {
    timeout: 20000,
  });

  await editor.fill('import js\njs.localStorage.clear()\nprint("done")');
  await page.locator(".code-challenge__run").click();
  await page.waitForTimeout(9000);
  const progressAfter = await page.evaluate(() => localStorage.getItem("codequest-progress"));
  expect(progressAfter).toBeTruthy();
});

test("React: while(true){} inside a component times out without freezing the page", async ({ page }) => {
  await seedAndEnter(page, completedThrough(3, 5));
  await page.locator("text=/^quests$/i").first().click();
  await page.waitForTimeout(3500);
  await page.locator("text=/^React$/i").first().click();
  await page.waitForTimeout(800);

  // Lesson 1 is a quiz; answer it to unlock lesson 2, the first code lesson.
  await page.locator(".quest-lesson-row").first().click();
  await page.waitForTimeout(600);
  const correctOption = page.locator("text=/User interfaces, from reusable components/i").first();
  if (await correctOption.count()) {
    await correctOption.click();
    await page.waitForTimeout(500);
    await page.locator(".quiz-challenge__continue").click().catch(() => {});
    await page.waitForTimeout(800);
  }

  const editor = page.locator(".code-challenge__editor");
  await expect(editor).toHaveCount(1, { timeout: 5000 });
  await editor.fill("function Bad() {\n  while(true){}\n  return <h1>stuck</h1>;\n}\nrender(<Bad />);");
  await page.locator(".code-challenge__run").click();

  const responsive = await Promise.race([
    page.evaluate(() => 1).then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 1500)),
  ]);
  expect(responsive).toBe(true);

  await expect(page.locator(".code-challenge__result-detail")).toContainText(/too long|never stops/i, {
    timeout: 20000,
  });
  // The real proof the page isn't still blocked underneath: a normal
  // Playwright command has to actually complete.
  await expect(page.locator(".code-challenge__run")).toBeVisible({ timeout: 2000 });
});

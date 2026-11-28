import { test, expect } from "@playwright/test";
import { seedAndEnter } from "./helpers.js";

// Kernel Dash's game loop moves things by setting styles every frame. A CSS
// transition on those same properties restarts every frame and never gets
// past its start value, so obstacles sat frozen above the track (invisible)
// while collisions still happened. These check what the player actually SEES.

async function startRun(page) {
  await seedAndEnter(page, {}, "javascript");
  await page.goto("/#/kernel-dash", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /start run/i }).click();
}

test("obstacles visibly travel down the track", async ({ page }) => {
  await startRun(page);
  const obstacle = page.locator(".kernel-dash__obstacle").first();
  await obstacle.waitFor({ timeout: 5000 });
  const track = await page.locator(".kernel-dash__track").boundingBox();
  const y1 = (await obstacle.boundingBox()).y;
  await page.waitForTimeout(600);
  const y2 = (await obstacle.boundingBox())?.y;
  expect(y2, "obstacle moved down on screen").toBeGreaterThan(y1 + 50);
  expect(y2, "obstacle is inside the visible track").toBeGreaterThan(track.y);
});

test("nothing the game loop moves every frame has a CSS transition on it", async ({ page }) => {
  await startRun(page);
  await page.locator(".kernel-dash__obstacle").first().waitFor({ timeout: 5000 });
  // The flash-question bar only exists mid-question, so check its rule by
  // rendering a probe element with the same class.
  const transitions = await page.evaluate(() => {
    // "Does this element animate `prop`?" — transition-property defaults to
    // "all" with a 0s duration, so check each property's actual duration.
    const animates = (cs, prop) => {
      const props = cs.transitionProperty.split(",").map((x) => x.trim());
      const durs = cs.transitionDuration.split(",").map((x) => parseFloat(x));
      return props.some((p, i) => (p === prop || p === "all") && durs[i % durs.length] > 0);
    };
    const probe = document.createElement("div");
    probe.className = "kernel-dash__flash-bar-fill";
    document.querySelector(".kernel-dash__track").appendChild(probe);
    const bar = animates(getComputedStyle(probe), "width");
    probe.remove();
    const obstacle = animates(getComputedStyle(document.querySelector(".kernel-dash__obstacle")), "top");
    return { obstacle, bar };
  });
  expect(transitions.obstacle, "obstacle `top` must not transition").toBe(false);
  expect(transitions.bar, "timer bar `width` must not transition").toBe(false);
});

// Shared setup for the e2e repros — seeds localStorage the same way a
// returning player with some progress would look, then lands on Home as
// a guest. Kept in one place so each spec doesn't re-derive the shape of
// a progress save (see src/utils/progressSerialize.js).
export async function seedAndEnter(page, worldsState = {}, language = "python") {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(({ ws, language }) => {
    localStorage.setItem(
      "codequest-progress",
      JSON.stringify({
        onboardingComplete: true,
        onboardingAnswers: { experience: "beginner", goal: "fun", language },
        language,
        selectedCharacter: "pixel",
        isGuest: true,
        worldsState: ws,
      }),
    );
    // The actual flag AuthContext.jsx reads (GUEST_STORAGE_KEY) — set
    // directly rather than clicking the real guest button, so this
    // doesn't break every time that button's copy changes (it already
    // has once, for CQ-15).
    localStorage.setItem("codequest-guest", "true");
  }, { ws: worldsState, language });
  await page.reload({ waitUntil: "networkidle" });
}

export function completedThrough(world, level) {
  const ws = {};
  for (let w = 1; w <= world; w++) {
    const max = w < world ? 5 : level;
    for (let l = 1; l <= max; l++) ws[`${w}-${l}`] = "completed";
  }
  return ws;
}

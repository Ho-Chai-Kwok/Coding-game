import { describe, expect, test } from "vitest";
import { getRankInfo, getDifficultyLevel, rankPosition, TIERS, PROMOTION_SHIELD_MATCHES } from "./rank";

// CQ-19: rank math drives both the Ranked UI and matchmaking difficulty —
// a wrong tier/division here is visible immediately after every match.

describe("getRankInfo", () => {
  test("negative or zero points clamp to the bottom of Bronze", () => {
    expect(getRankInfo(-500).label).toBe("Bronze III");
    expect(getRankInfo(0).label).toBe("Bronze III");
  });

  test("exactly on a tier boundary lands in that tier, division III", () => {
    const info = getRankInfo(1000);
    expect(info.tierName).toBe("Silver");
    expect(info.division).toBe("III");
    expect(info.progressPercent).toBe(0);
  });

  test("just under a tier boundary stays in the lower tier", () => {
    expect(getRankInfo(999).tierName).toBe("Bronze");
  });

  test("the top tier (Grandmaster) has no division and no pointsToNext", () => {
    const info = getRankInfo(TIERS[TIERS.length - 1].min + 50);
    expect(info.isMaxTier).toBe(true);
    expect(info.division).toBe("");
    expect(info.pointsToNext).toBeNull();
  });

  test("progressPercent is always between 0 and 100", () => {
    for (const points of [0, 500, 1000, 1999, 3500, 5999, 9999]) {
      const { progressPercent } = getRankInfo(points);
      expect(progressPercent).toBeGreaterThanOrEqual(0);
      expect(progressPercent).toBeLessThanOrEqual(100);
    }
  });
});

describe("getDifficultyLevel", () => {
  test("maps Bronze to 1 and Grandmaster to 7", () => {
    expect(getDifficultyLevel(0)).toBe(1);
    expect(getDifficultyLevel(TIERS[TIERS.length - 1].min)).toBe(TIERS.length);
  });

  test("never returns a level outside 1..number of tiers", () => {
    for (const points of [-1000, 0, 2500, 100000]) {
      const level = getDifficultyLevel(points);
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(TIERS.length);
    }
  });
});

describe("rankPosition", () => {
  test("a higher tier always outranks any division of a lower tier", () => {
    const silverIII = rankPosition(getRankInfo(1000));
    const bronzeI = rankPosition(getRankInfo(999));
    expect(silverIII).toBeGreaterThan(bronzeI);
  });

  test("within the same tier, a later division outranks an earlier one", () => {
    const low = rankPosition(getRankInfo(1000));
    const high = rankPosition(getRankInfo(1900));
    expect(high).toBeGreaterThanOrEqual(low);
  });
});

test("the promotion shield constant is a small positive number of matches", () => {
  expect(PROMOTION_SHIELD_MATCHES).toBeGreaterThan(0);
  expect(PROMOTION_SHIELD_MATCHES).toBeLessThan(10);
});

import { describe, it, expect } from "vitest";
import {
  spawnObstacle,
  HAZARD_TYPES,
  COLLECTIBLE_TYPES,
  FIRST_FLASH_QUESTION_MS,
  FLASH_QUESTION_INTERVAL_MS,
  FLASH_QUESTION_TIME_MS,
} from "./kernelDashEngine.js";

describe("Kernel Dash spawning", () => {
  it("only spawns collectibles while it's calm (question up, or just answered)", () => {
    for (let i = 0; i < 2000; i++) {
      const o = spawnObstacle(true);
      expect(COLLECTIBLE_TYPES.has(o.type), o.type).toBe(true);
    }
  });

  it("still spawns every kind of hazard normally", () => {
    const seen = new Set();
    for (let i = 0; i < 2000; i++) seen.add(spawnObstacle(false).type);
    for (const t of HAZARD_TYPES) expect(seen.has(t), t).toBe(true);
  });
});

describe("Kernel Dash flash questions", () => {
  it("come early and often", () => {
    expect(FIRST_FLASH_QUESTION_MS).toBeLessThanOrEqual(8000);
    // One question starts at least every ~17s.
    expect(FLASH_QUESTION_INTERVAL_MS + FLASH_QUESTION_TIME_MS).toBeLessThanOrEqual(17000);
  });
});

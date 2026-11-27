import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { computeStreak } from "./streak";

// CQ-19: the streak math is exactly the kind of off-by-one-day logic that's
// easy to silently break, and it's visible to every daily player.

function mockToday(isoDate) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${isoDate}T12:00:00Z`));
}

describe("computeStreak", () => {
  beforeEach(() => mockToday("2026-03-15"));
  afterEach(() => vi.useRealTimers());

  test("first time ever playing (no prior date) starts the streak at 1", () => {
    expect(computeStreak(0, undefined)).toEqual({ streak: 1, lastPlayedDate: "2026-03-15" });
  });

  test("playing again later the same day doesn't double-count", () => {
    expect(computeStreak(4, "2026-03-15")).toEqual({ streak: 4, lastPlayedDate: "2026-03-15" });
  });

  test("playing the day after the last play extends the streak by 1", () => {
    expect(computeStreak(4, "2026-03-14")).toEqual({ streak: 5, lastPlayedDate: "2026-03-15" });
  });

  test("missing a day (gap of 2+) resets the streak to 1, not 0", () => {
    expect(computeStreak(10, "2026-03-12")).toEqual({ streak: 1, lastPlayedDate: "2026-03-15" });
  });

  test("a long-unused save (null/undefined date) doesn't crash and starts fresh", () => {
    expect(computeStreak(0, null)).toEqual({ streak: 1, lastPlayedDate: "2026-03-15" });
  });
});

import { describe, expect, it } from "vitest";
import { MAIN_PATH_WORLD_COUNT, worlds } from "./levels.js";
import { isGymWorld, isPracticeGymOpen, isWorldOpen, splitWorlds, unlockGymWorld } from "./practiceGym.js";

const completeWorld1 = (ws) =>
  ws.map((w) => (w.id === 1 ? { ...w, levels: w.levels.map((l) => ({ ...l, status: "completed" })) } : w));

describe("Practice Gym", () => {
  it("main path is the 100 hand-built worlds, gym is the rest", () => {
    const { mainPath, gym } = splitWorlds(worlds);
    expect(MAIN_PATH_WORLD_COUNT).toBe(100);
    expect(mainPath).toHaveLength(100);
    expect(gym).toHaveLength(worlds.length - 100);
    expect(gym.every((w) => isGymWorld(w.id))).toBe(true);
    expect(mainPath.at(-1).id).toBe(100);
  });

  it("is closed for a brand-new player", () => {
    expect(isPracticeGymOpen(worlds)).toBe(false);
    const gymWorld = worlds.find((w) => isGymWorld(w.id));
    expect(isWorldOpen(gymWorld, worlds)).toBe(false);
    expect(unlockGymWorld(worlds, gymWorld.id)).toBe(worlds);
  });

  it("opens every drill world once World 1 is finished", () => {
    const ws = completeWorld1(worlds);
    expect(isPracticeGymOpen(ws)).toBe(true);
    const last = ws.at(-1);
    expect(isWorldOpen(last, ws)).toBe(true);
    const unlocked = unlockGymWorld(ws, last.id);
    const w = unlocked.find((x) => x.id === last.id);
    expect(w.status).toBe("unlocked");
    expect(w.levels[0].status).toBe("unlocked");
    expect(w.levels[1].status).toBe("locked");
  });

  it("never opens locked main-path worlds early", () => {
    const ws = completeWorld1(worlds);
    const w50 = ws.find((w) => w.id === 50);
    expect(isWorldOpen(w50, ws)).toBe(false);
    expect(unlockGymWorld(ws, 50)).toBe(ws);
  });
});

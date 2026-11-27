// Practice Gym (QA_REPORT.md CQ-08, owner decision O2): the generated drill
// worlds live outside the main learning path as optional extra practice.
// They open once the learner has finished World 1, so a brand-new player
// starts on the guided path, and after that every drill is available
// without first clearing 100 worlds.
import { MAIN_PATH_WORLD_COUNT } from "./levels.js";

export function isGymWorld(worldId) {
  return worldId > MAIN_PATH_WORLD_COUNT;
}

export function isPracticeGymOpen(worlds) {
  const first = worlds.find((w) => w.id === 1);
  return Boolean(first && first.levels.every((l) => l.status === "completed"));
}

export function splitWorlds(worlds) {
  return {
    mainPath: worlds.filter((w) => !isGymWorld(w.id)),
    gym: worlds.filter((w) => isGymWorld(w.id)),
  };
}

// Whether a world can be entered right now, gym rules included.
export function isWorldOpen(world, worlds) {
  if (world.status !== "locked") return true;
  return isGymWorld(world.id) && isPracticeGymOpen(worlds);
}

// Returns a copy of `worlds` with this gym world (and its first stage)
// unlocked, or the same array if nothing needs to change.
export function unlockGymWorld(worlds, worldId) {
  const target = worlds.find((w) => w.id === worldId);
  if (!target || target.status !== "locked" || !isGymWorld(worldId) || !isPracticeGymOpen(worlds)) {
    return worlds;
  }
  return worlds.map((w) => {
    if (w.id !== worldId) return w;
    const levels = w.levels.map((l, i) => (i === 0 && l.status === "locked" ? { ...l, status: "unlocked" } : l));
    return { ...w, status: "unlocked", levels };
  });
}

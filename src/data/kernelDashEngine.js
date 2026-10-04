// Kernel Dash — pure game logic (no React, no DOM), kept separate from the
// component the same way every other mode in this app splits puzzle/rule
// logic from rendering. An original 3-lane endless runner: your Byteborn
// dashes through the Kernel (the city inside the computer — same lore as
// the character roster), dodging code-themed hazards, collecting syntax
// bits for bonus points, with speed and spawn rate both ramping up over
// time. Every constant below is the one place to retune difficulty.

export const LANE_COUNT = 3;
export const TRACK_LENGTH = 420; // px an obstacle travels from spawn to the player's row

export const BASE_SPEED = 230; // px/sec at the very start
export const MAX_SPEED = 640; // px/sec hard cap, so it never becomes literally unplayable
export const SPEED_RAMP_PER_SEC = 5.5; // speed gained per second of survival, per second elapsed

export const BASE_SPAWN_MS = 1500;
export const MIN_SPAWN_MS = 520;
export const SPAWN_RAMP_MS_PER_SEC = 8; // spawn interval shrinks by this much per second elapsed

export const JUMP_MS = 520;
export const DUCK_MS = 520;
export const HIT_WINDOW = 34; // px of slack around the player's row for a collision/pickup to register

export const SCORE_PER_PX = 0.045; // converts distance traveled into score
export const COLLECTIBLE_SCORE = { semicolon: 12, brace: 30 };

// One obstacle/collectible at a time per spawn (never two lanes blocked at
// once) — keeps every spawn guaranteed-dodgeable rather than needing a
// solver to rule out unfair combinations.
const SPAWN_POOL = [
  { type: "bug", weight: 3 }, // jump over
  { type: "error", weight: 3 }, // duck under
  { type: "wall", weight: 2 }, // switch lanes
  { type: "semicolon", weight: 3 }, // collectible
  { type: "brace", weight: 1 }, // rare, bigger collectible
];
const SPAWN_TOTAL_WEIGHT = SPAWN_POOL.reduce((s, p) => s + p.weight, 0);

export const HAZARD_TYPES = new Set(["bug", "error", "wall"]);
export const COLLECTIBLE_TYPES = new Set(["semicolon", "brace"]);

let nextId = 1;

export function speedAt(elapsedSeconds) {
  return Math.min(MAX_SPEED, BASE_SPEED + elapsedSeconds * SPEED_RAMP_PER_SEC);
}

export function spawnIntervalAt(elapsedSeconds) {
  return Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - elapsedSeconds * SPAWN_RAMP_MS_PER_SEC);
}

export function spawnObstacle() {
  let roll = Math.random() * SPAWN_TOTAL_WEIGHT;
  let type = SPAWN_POOL[0].type;
  for (const p of SPAWN_POOL) {
    if (roll < p.weight) {
      type = p.type;
      break;
    }
    roll -= p.weight;
  }
  return { id: nextId++, type, lane: Math.floor(Math.random() * LANE_COUNT), distance: 0, resolved: false };
}

// Whether the player's current action clears a hazard of this type.
export function clearsHazard(type, action) {
  if (type === "bug") return action === "jump";
  if (type === "error") return action === "duck";
  // "wall" spans the full lane height — nothing but being in a different
  // lane gets you past it.
  if (type === "wall") return false;
  return true;
}

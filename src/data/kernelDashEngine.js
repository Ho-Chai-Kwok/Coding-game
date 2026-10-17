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
export const MIN_SPAWN_MS = 600;
export const SPAWN_RAMP_MS_PER_SEC = 8; // spawn interval shrinks by this much per second elapsed

// Jump/duck lock the player out of a second jump/duck until it finishes
// (see doJump/doDuck in KernelDash.jsx) — kept comfortably shorter than
// MIN_SPAWN_MS so even two same-lane hazards back to back at max
// difficulty always leave a real window to react to the second one,
// rather than the two floors meeting exactly and occasionally not.
export const JUMP_MS = 420;
export const DUCK_MS = 420;
export const HIT_WINDOW = 40; // px of slack around the player's row for a collision/pickup to register

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

// CQ-17: a flat multiplier, not a separate speed curve, so Easy mode
// stays the exact same game — just more reaction time — rather than a
// different ramp a player would have to re-learn switching back.
export const EASY_SPEED_MULTIPLIER = 0.65;

export function speedAt(elapsedSeconds, easy = false) {
  const speed = Math.min(MAX_SPEED, BASE_SPEED + elapsedSeconds * SPEED_RAMP_PER_SEC);
  return easy ? speed * EASY_SPEED_MULTIPLIER : speed;
}

export function spawnIntervalAt(elapsedSeconds, easy = false) {
  const interval = Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - elapsedSeconds * SPAWN_RAMP_MS_PER_SEC);
  return easy ? interval / EASY_SPEED_MULTIPLIER : interval;
}

// `excludeWall`: during a flash question, a wall forcing the player out
// of a lane would unfairly fight with needing to be in a *specific* lane
// to answer — jump/duck hazards and collectibles don't have that
// conflict (they never force a lane change), so only walls are held back.
export function spawnObstacle(excludeWall = false) {
  const pool = excludeWall ? SPAWN_POOL.filter((p) => p.type !== "wall") : SPAWN_POOL;
  const totalWeight = excludeWall ? pool.reduce((s, p) => s + p.weight, 0) : SPAWN_TOTAL_WEIGHT;
  let roll = Math.random() * totalWeight;
  let type = pool[0].type;
  for (const p of pool) {
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

// ---- Flash questions ---------------------------------------------
// Periodically, instead of a dodgeable obstacle, the run stops for a
// multiple-choice question: each of the 3 lanes is labeled with an
// answer, and whichever lane the player is standing in when the timer
// runs out is their answer — right, and the run continues; wrong, and
// it ends, same stakes as hitting a wall. Reuses the existing ranked
// question bank (see rankedQuestionBank.js) rather than a separate
// question set, picking difficulty from the SAME elapsed-time curve
// that drives obstacle speed/spawn-rate, so "harder as you survive
// longer" means one consistent thing across the whole mode.
export const FIRST_FLASH_QUESTION_MS = 14000; // give the player a clean run before the first one
export const FLASH_QUESTION_INTERVAL_MS = 22000; // roughly how often another one shows up
export const FLASH_QUESTION_TIME_MS = 6500; // how long the player has to pick a lane
export const FLASH_QUESTION_BONUS = 40; // score bonus for a correct answer

// Maps elapsed survival time to a ranked difficulty level (1-7, same
// scale as rank.js / rankedQuestionBank.js) — early questions pull from
// Bronze/Silver, later ones climb toward Diamond+ as a run goes long.
export function flashQuestionLevelAt(elapsedSeconds) {
  if (elapsedSeconds < 25) return 1;
  if (elapsedSeconds < 50) return 2;
  if (elapsedSeconds < 80) return 3;
  if (elapsedSeconds < 115) return 4;
  if (elapsedSeconds < 150) return 5;
  if (elapsedSeconds < 190) return 6;
  return 7;
}

// Reduces a 4-option ranked question down to exactly LANE_COUNT (3)
// options — always keeping the correct one — and assigns each to a
// lane. `rng` is a 0..1 generator so callers can keep this deterministic
// (tests, replays) or pass Math.random for real play.
export function buildFlashQuestion(question, rng = Math.random) {
  const wrongIndexes = question.options
    .map((_, i) => i)
    .filter((i) => i !== question.correctIndex);
  // Fisher-Yates on just the wrong indexes, keep the first two.
  for (let i = wrongIndexes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [wrongIndexes[i], wrongIndexes[j]] = [wrongIndexes[j], wrongIndexes[i]];
  }
  const chosenIndexes = [question.correctIndex, ...wrongIndexes.slice(0, LANE_COUNT - 1)];
  for (let i = chosenIndexes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [chosenIndexes[i], chosenIndexes[j]] = [chosenIndexes[j], chosenIndexes[i]];
  }
  return {
    topic: question.topic,
    text: question.question,
    explanation: question.explanation,
    lanes: chosenIndexes.map((optIndex, lane) => ({
      lane,
      text: question.options[optIndex],
      isCorrect: optIndex === question.correctIndex,
    })),
  };
}

// Ranked Mode game modes: metadata for the mode-select/rotation screen,
// character-archetype mechanical bonuses (characters.js only carries the
// flavor-text "ability" — this file is what actually applies it), and the
// puzzle pools each mode draws from (reusing the same curriculum content
// as Learning Mode/Side Quests so nothing new has to be hand-authored
// twice, the same "don't author dual content" reasoning as extraWorlds.js).

import { worlds } from "./levels";

export const MODE_IDS = {
  CODE_RACE: "code-race",
  BUG_HUNT: "bug-hunt",
  PREDICT_OUTPUT: "predict-output",
  CODE_GOLF: "code-golf",
  SHOWDOWN: "showdown",
  DEBUG_DUEL: "debug-duel",
  CHAOS_ROUND: "chaos-round",
  RELAY: "relay",
};

export const RANKED_MODES = [
  {
    id: MODE_IDS.CODE_RACE,
    icon: "🏎️",
    color: "linear-gradient(160deg, #facc15, #f97316)",
    archetype: "Speedrunner",
    alwaysAvailable: true,
    playable: true,
  },
  {
    id: MODE_IDS.BUG_HUNT,
    icon: "🐞",
    color: "linear-gradient(160deg, #34d399, #0ea5e9)",
    archetype: "Debugger",
    alwaysAvailable: true,
    playable: true,
  },
  {
    id: MODE_IDS.PREDICT_OUTPUT,
    icon: "🔮",
    color: "linear-gradient(160deg, #818cf8, #4f46e5)",
    archetype: "Analyst",
    alwaysAvailable: false,
    playable: true,
  },
  {
    id: MODE_IDS.CODE_GOLF,
    icon: "⛳",
    color: "linear-gradient(160deg, #2dd4bf, #0891b2)",
    archetype: "Refactorer",
    alwaysAvailable: false,
    playable: true,
  },
  {
    id: MODE_IDS.SHOWDOWN,
    icon: "🥊",
    color: "linear-gradient(160deg, #38bdf8, #6366f1)",
    archetype: "Architect",
    alwaysAvailable: false,
    playable: true,
  },
  {
    id: MODE_IDS.DEBUG_DUEL,
    icon: "⚔️",
    color: "linear-gradient(160deg, #f87171, #b91c1c)",
    archetype: "Tank",
    alwaysAvailable: false,
    playable: true,
  },
  {
    id: MODE_IDS.CHAOS_ROUND,
    icon: "🌀",
    color: "linear-gradient(160deg, #c084fc, #22d3ee)",
    archetype: "Wildcard",
    alwaysAvailable: false,
    playable: true,
  },
  {
    id: MODE_IDS.RELAY,
    icon: "🤝",
    color: "linear-gradient(160deg, #fb923c, #ec4899)",
    archetype: "Support",
    alwaysAvailable: false,
    playable: false, // needs real team matchmaking — flagged for a later phase
  },
];

export function getMode(id) {
  return RANKED_MODES.find((m) => m.id === id);
}

// Maps a mode id to its i18n namespace under rankedModes.* — used wherever
// a mode is rendered generically (the shuffle reel) instead of by a
// component that already knows its own translation keys.
export const MODE_I18N_KEY = {
  [MODE_IDS.CODE_RACE]: "codeRace",
  [MODE_IDS.BUG_HUNT]: "bugHunt",
  [MODE_IDS.PREDICT_OUTPUT]: "predictOutput",
  [MODE_IDS.CODE_GOLF]: "codeGolf",
  [MODE_IDS.SHOWDOWN]: "showdown",
  [MODE_IDS.DEBUG_DUEL]: "debugDuel",
  [MODE_IDS.CHAOS_ROUND]: "chaosRound",
  [MODE_IDS.RELAY]: "relay",
};

// --- Daily rotation, Brawl-Stars-event style ------------------------------
// Always-available modes show every day; three more are picked from the
// rotating pool, deterministically reshuffled once per UTC calendar day so
// every player sees the same lineup and it's stable for the whole day.

// Exported (unlike the module-private helpers around it) so a PvP match
// can derive more than one deterministic value from a single shared seed
// — e.g. ChaosRound picking the same random modifier for both players,
// not just the same question.
export function seededRandom(seed) {
  let t = seed;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const rand = seededRandom(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDailyRotation(date = new Date()) {
  const always = RANKED_MODES.filter((m) => m.alwaysAvailable);
  // Only shuffle in modes that are actually playable today — Relay needs
  // real team matchmaking and isn't ready, so it never eats a rotation
  // slot; it's shown separately as a "coming soon" card instead.
  const rotating = RANKED_MODES.filter((m) => !m.alwaysAvailable && m.playable);
  const dayKey = Math.floor(date.getTime() / 86400000);
  const shuffled = seededShuffle(rotating, dayKey);
  return [...always, ...shuffled.slice(0, 3)];
}

// --- Character archetype bonuses ------------------------------------------
// Small, explicit, mode-specific functions rather than parsing the flavor
// ability string — keeps the mechanical effect honest and easy to change.

export function bugHuntMultiplier(character) {
  if (character?.id === "sherlock-byte") return 1.25;
  if (character?.id === "patch") return 1.15;
  if (character?.id === "null-pointer") return 1.05;
  return 1;
}

export function bugHuntHighlightsFirst(character) {
  return character?.id === "sherlock-byte";
}

export function codeRaceBonusSeconds(streakOf3Count, character) {
  if (character?.id !== "dash") return 0;
  return streakOf3Count;
}

export function predictOutputRevealsWrong(character) {
  return character?.id === "scope";
}

export function codeGolfBonusPerLineUnderPar(character) {
  return character?.id === "trim" ? 0.1 : 0;
}

export function debugDuelHasFreeMiss(character) {
  return character?.id === "bastion";
}

export function showdownSeesCategoryEarly(character) {
  return character?.id === "blueprint";
}

export function chaosRoundFavorable(character) {
  return character?.id === "glitch";
}

export function relayBatonBonusSeconds(character) {
  return character?.id === "bridge" ? 1 : 0;
}

// Applied on top of every mode's own scoring — Null Pointer's "all modes"
// ability, plus a shared streak-forgiveness flag some modes read.
export function universalScoreMultiplier(character) {
  return character?.id === "null-pointer" ? 1.05 : 1;
}

export function hasStreakForgiveness(character) {
  return character?.id === "null-pointer";
}

export function applyBonusMultiplier(basePoints, character) {
  return Math.round(basePoints * universalScoreMultiplier(character));
}

// --- Puzzle pools ------------------------------------------------------
// Pulled straight from the shared curriculum so every question/snippet is
// already vetted for correctness, instead of authoring a second copy.

function allLevels() {
  return worlds.flatMap((w) => w.levels.map((l) => ({ ...l, worldName: w.name })));
}

// Code-type levels have hand-authored JS *and* Python starters (worlds
// 1-12 only) — required for Code Race/Code Golf since players type real
// code in their chosen language.
//
// With a `level` (1-7, a rank tier from getDifficultyLevel), biases toward
// the world that tier roughly corresponds to — worlds are already ordered
// easiest-to-hardest by design, so no separate difficulty tagging is
// needed here, just mapping the 7 rank tiers onto the 1-12 world range
// these code-type levels actually span.
export function getCodePool(level) {
  const pool = allLevels().filter((l) => l.content?.type === "code");
  if (level == null) return pool;
  const targetWorldId = Math.round((level / 7) * 12);
  return [...pool].sort(
    (a, b) => Math.abs(a.worldId - targetWorldId) - Math.abs(b.worldId - targetWorldId),
  );
}

// Quiz-type levels exist for every world (1-100) and read fine regardless
// of which coding language the player picked, since they're about reading
// code, not writing it — perfect for Predict the Output/Showdown/Chaos.
export function getQuizPool() {
  return allLevels().filter((l) => l.content?.type === "quiz");
}

export function shuffledSample(pool, count, seed = Date.now()) {
  return seededShuffle(pool, seed).slice(0, count);
}

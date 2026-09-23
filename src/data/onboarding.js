// One-time "getting to know you" flow shown right after a person logs in or
// continues as guest, before they ever see the normal dashboard. Answers
// steer their starting language (bypassing the separate language picker),
// a short list of recommended Side Quests, and — via applyHeadStart below —
// where the 100-world learning path actually begins: someone who says
// they already know "some" or are "confident" gets the earlier worlds
// marked complete and starts further in, instead of retreading material
// they already know. From that starting point the path still unlocks
// strictly in order, same as everyone else.

export const SKILL_LEVELS = [
  { id: "beginner", icon: "🌱", titleKey: "beginnerTitle", descKey: "beginnerDesc" },
  { id: "some", icon: "🌿", titleKey: "someTitle", descKey: "someDesc" },
  { id: "confident", icon: "🌳", titleKey: "confidentTitle", descKey: "confidentDesc" },
];

export const LEARNING_GOALS = [
  { id: "fun", icon: "🎮", titleKey: "funTitle", descKey: "funDesc" },
  { id: "school", icon: "🏫", titleKey: "schoolTitle", descKey: "schoolDesc" },
  { id: "job", icon: "💼", titleKey: "jobTitle", descKey: "jobDesc" },
  { id: "ai", icon: "🤖", titleKey: "aiTitle", descKey: "aiDesc" },
  { id: "web", icon: "🌐", titleKey: "webTitle", descKey: "webDesc" },
];

// Side quests recommended per goal, matched by exact name against
// data/sidequests.js at render time — if a name doesn't match anything
// (e.g. renamed later) it's just skipped, never a crash.
const QUEST_NAMES_BY_GOAL = {
  fun: ["Regular Expressions", "Testing & TDD"],
  school: ["Git & GitHub", "Testing & TDD"],
  job: ["Git & GitHub", "REST APIs", "Linux & Bash"],
  ai: ["Prompt Engineering", "NumPy", "Machine Learning Basics"],
  web: ["Node.js", "React", "REST APIs"],
};

export function getRecommendedQuestNames(goal) {
  return QUEST_NAMES_BY_GOAL[goal] ?? [];
}

// i18n key (under onboarding.startMessages) for the level-specific
// starting-point blurb shown on the final recommendation step.
export function getStartMessageKey(level) {
  return SKILL_LEVELS.some((l) => l.id === level) ? level : "beginner";
}

// Which world id a learner starts at, based on their self-reported level.
// "beginner" always starts at World 1 like today; "some" skips the
// absolute-basics worlds (print/variables/types/control flow) and
// "confident" also skips the early ES6+/OOP worlds, landing on Classes.
// Picked by world topic, not an arbitrary count, so it stays meaningful
// even if worlds are inserted/reordered later — see data/levels.js for
// the world list (id order: Say Hello=1 ... Objects=12, Array Methods=13
// ... Classes: Basics=20 ...).
const HEAD_START_WORLD_ID = {
  beginner: 1,
  some: 10, // World 10: Arrays — fundamentals (print/vars/types/control flow) done
  confident: 20, // World 20: Classes: Basics — fundamentals + ES6 essentials done
};

export function getHeadStartWorldId(level) {
  return HEAD_START_WORLD_ID[level] ?? 1;
}

// Returns a new worldsState with every world before the learner's starting
// world marked fully completed (and unlocked, so the map shows them as
// such), the starting world itself unlocked with only its first level
// open, and everything after left untouched (still locked, same as a
// brand-new account) — the path unlocks in order from there on, exactly
// like it does for a beginner starting at World 1.
export function applyHeadStart(worldsState, level) {
  const targetId = getHeadStartWorldId(level);
  if (targetId <= 1) return worldsState;

  return worldsState.map((world) => {
    if (world.id < targetId) {
      return {
        ...world,
        status: "unlocked",
        levels: world.levels.map((l) => ({ ...l, status: "completed" })),
      };
    }
    if (world.id === targetId) {
      return {
        ...world,
        status: "unlocked",
        levels: world.levels.map((l, i) => ({
          ...l,
          status: i === 0 ? "unlocked" : "locked",
        })),
      };
    }
    return world;
  });
}

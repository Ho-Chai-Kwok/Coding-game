// The Byteborn — Code Quest's character roster. Each one is a living piece
// of code from the Kernel (the city inside the computer) and stands for a
// programming concept. Their animated sprite art lives in
// src/components/byteborn/ (ByteBornSprite renders idle / thinking /
// correct / wrong states); this file carries personality, the ranked-mode
// flavour ability (rankedModes.js applies the real effect), and an unlock
// condition checked against the player's actual saved progress.
//
// Unlocks are built only from stats the app already tracks: total lessons
// completed (learning + side quests), ranked wins/matches/points and login
// streak. CHARACTERS[0] is the starter and the fallback for old saves.

export const CHARACTERS = [
  {
    id: "pixel",
    name: "Pixel",
    archetype: "Support",
    tier: "Starter",
    concept: "Output / print()",
    color: "#4FE0A8",
    catchphrase: "Hello, World! …Is anyone listening?",
    blurb: "Born from the very first print(\"Hello, World\"). Friendly, chatty and a little naive — and anything he says out loud becomes real.",
    ability: "Bug Hunt bonus: +15% points for every bug found on the first try.",
    moveLine: "Bouncy and eager — his screen face swaps like sprites.",
    unlock: { kind: "always" },
  },
  {
    id: "cache",
    name: "Cache",
    archetype: "Support",
    tier: "Common",
    concept: "Variables & memory",
    color: "#2FD3B5",
    catchphrase: "Already got it! …I think.",
    blurb: "The Kernel's memory squirrel. He saved half the city's history in his cheeks — he just can't remember where he buried it.",
    ability: "Relay bonus: +1 second added to every baton pass.",
    moveLine: "Twitchy and cheerful — tail always wagging.",
    unlock: { kind: "streak", value: 3 },
  },
  {
    id: "vex",
    name: "Vex Loop",
    archetype: "Assassin",
    tier: "Epic",
    concept: "Loops (for / while)",
    color: "#FF3D8B",
    catchphrase: "Again. And again. And — break.",
    blurb: "A background process that was stuck repeating forever until he learned to break out. Quiet, precise, and he hates infinite loops.",
    ability: "Code Race bonus: every 3rd round in a row adds bonus seconds to your clock.",
    moveLine: "Low and coiled — chakrams never stop spinning.",
    unlock: { kind: "completed", value: 5 },
  },
  {
    id: "ifra",
    name: "Ifra",
    archetype: "Tank",
    tier: "Rare",
    concept: "Conditionals (if / else)",
    color: "#F5C842",
    catchphrase: "True or false. Choose.",
    blurb: "The Branch Knight, sworn to judge every path true or false. Her half-gold, half-blue armour remembers both outcomes.",
    ability: "Predict Output bonus: one wrong option is revealed before you choose.",
    moveLine: "Upright and decisive — the plume sways, the shield never drops.",
    unlock: { kind: "completed", value: 15 },
  },
  {
    id: "lambda",
    name: "Lambda",
    archetype: "Marksman",
    tier: "Legendary",
    concept: "Functions",
    color: "#E0B860",
    catchphrase: "One line. One job. Done.",
    blurb: "An anonymous function called once to save the power grid, and never returned. Few words, sharp aim.",
    ability: "Code Golf bonus: +10% points for every line under par.",
    moveLine: "Still as a desert noon — the poncho does the moving.",
    unlock: { kind: "completed", value: 30 },
  },
  {
    id: "bugsy",
    name: "Bugsy",
    archetype: "Support",
    tier: "Rare",
    concept: "Debugging",
    color: "#7BD35A",
    catchphrase: "Found it! Line 42!",
    blurb: "A tiny typo-hunting script who caught a bug barehanded during the Glitch's first attack — and kept it as a pet.",
    ability: "Bug Hunt bonus: +25% points, and the first bug is highlighted for you.",
    moveLine: "Curious and fidgety — antennae wobble at every clue.",
    unlock: { kind: "completed", value: 45 },
  },
  {
    id: "stack",
    name: "Stack",
    archetype: "Tank",
    tier: "Rare",
    concept: "Stacks (push / pop)",
    color: "#FFB23D",
    catchphrase: "Last in. First out. Every time.",
    blurb: "Built to hold the Kernel's memory tower together. Slow, heavy, almost impossible to topple — and he rebuilds himself block by block.",
    ability: "Debug Duel bonus: your first miss doesn't cost a life.",
    moveLine: "Heavy and steady — his head block pops up when he's happy.",
    unlock: { kind: "rankedWins", value: 3 },
  },
  {
    id: "async",
    name: "Async",
    archetype: "Marksman",
    tier: "Epic",
    concept: "Async / await",
    color: "#FFB547",
    catchphrase: "Don't wait for me.",
    blurb: "Born in the Kernel's message network. His shots are promises — they always land, just not right away.",
    ability: "Showdown bonus: see the next round's category before it starts.",
    moveLine: "Cool and unhurried — always one step ahead.",
    unlock: { kind: "completed", value: 60 },
  },
  {
    id: "glitch",
    name: "The Glitch",
    archetype: "Villain",
    tier: "Boss",
    concept: "Bugs & errors (try / except)",
    color: "#FF2BD6",
    catchphrase: "I am the bug you didn't fix.",
    blurb: "One wrong character, never fixed, that grew in the dark until it had a mind of its own. It doesn't want to rule the Kernel — it wants to crash it.",
    ability: "Chaos Round bonus: random twists tend to break your way.",
    moveLine: "Jittery and split — cyan and magenta never quite line up.",
    unlock: { kind: "rankedMatches", value: 10 },
  },
  {
    id: "firewall",
    name: "Firewall",
    archetype: "Tank",
    tier: "Epic",
    concept: "Security & validation",
    color: "#E2513A",
    catchphrase: "Not on the list. Not getting in.",
    blurb: "The brick giant who held the main gate alone for three days. Huge, nearly unbreakable — and the gentlest Byteborn in the city.",
    ability: "Showdown bonus: one wrong answer won't break your streak.",
    moveLine: "Slow and solid — the flame on his helm flickers when he's nervous.",
    unlock: { kind: "rankedWins", value: 10 },
  },
  {
    id: "nyx",
    name: "Nyx",
    archetype: "Assassin",
    tier: "Mythic",
    concept: "None / null",
    color: "#9B5CFF",
    catchphrase: "You can't hit what doesn't exist.",
    blurb: "What's left when a variable is set to None. She lives in the gaps between values and hunts the Glitch alone.",
    ability: "+5% points in every ranked mode, plus +5% in Bug Hunt.",
    moveLine: "Silent drift — void specks trail her cape.",
    unlock: { kind: "rankedPoints", value: 2000 },
  },
  {
    id: "recursa",
    name: "Recursa",
    archetype: "Controller",
    tier: "Legendary",
    concept: "Recursion",
    color: "#7B4DFF",
    catchphrase: "To understand me, first understand me.",
    blurb: "She stepped out of the shattered Hall of Mirrors with every smaller copy of herself still echoing inside. Always three moves ahead.",
    ability: "+5% points in every ranked mode.",
    moveLine: "Theatrical and floaty — her rings orbit endlessly.",
    unlock: { kind: "completed", value: 100 },
  },
];

// Builds the context object unlock checks run against, from real app state.
export function buildUnlockContext({
  overallProgress,
  rankedWins,
  rankedLosses,
  rankedPoints,
  streak,
}) {
  return {
    completed: overallProgress?.completed ?? 0,
    rankedWins: rankedWins ?? 0,
    rankedLosses: rankedLosses ?? 0,
    rankedMatches: (rankedWins ?? 0) + (rankedLosses ?? 0),
    rankedPoints: rankedPoints ?? 0,
    streak: streak ?? 0,
  };
}

export function isCharacterUnlocked(character, ctx) {
  const u = character.unlock;
  switch (u.kind) {
    case "always":
      return true;
    case "completed":
      return ctx.completed >= u.value;
    case "rankedWins":
      return ctx.rankedWins >= u.value;
    case "rankedMatches":
      return ctx.rankedMatches >= u.value;
    case "rankedPoints":
      return ctx.rankedPoints >= u.value;
    case "streak":
      return ctx.streak >= u.value;
    default:
      return false;
  }
}

// Current progress toward a lock, 0-1, for a progress bar on locked cards.
export function unlockProgress(character, ctx) {
  const u = character.unlock;
  if (u.kind === "always") return 1;
  const current =
    u.kind === "completed" ? ctx.completed :
    u.kind === "rankedWins" ? ctx.rankedWins :
    u.kind === "rankedMatches" ? ctx.rankedMatches :
    u.kind === "rankedPoints" ? ctx.rankedPoints :
    u.kind === "streak" ? ctx.streak : 0;
  return Math.max(0, Math.min(1, current / u.value));
}

// A short i18n-friendly description of what's left to unlock a character.
// Returns { key, values } for use with a translation key that has
// placeholders, so every locale can phrase it naturally.
export function unlockHint(character) {
  const u = character.unlock;
  switch (u.kind) {
    case "completed":
      return { key: "characters.unlockCompleted", values: { n: u.value } };
    case "rankedWins":
      return { key: "characters.unlockRankedWins", values: { n: u.value } };
    case "rankedMatches":
      return { key: "characters.unlockRankedMatches", values: { n: u.value } };
    case "rankedPoints":
      return { key: "characters.unlockRankedPoints", values: { n: u.value } };
    case "streak":
      return { key: "characters.unlockStreak", values: { n: u.value } };
    default:
      return { key: "characters.unlockDefault", values: {} };
  }
}

export function getCharacter(id) {
  return CHARACTERS.find((c) => c.id === id);
}

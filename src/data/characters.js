// Character roster for Ranked Mode. Each character pairs a hand-drawn
// parametric SVG "rig" (see CharacterRig.jsx) with a personality: an
// archetype, a ranked-mode flavor ability, a distinct movement signature
// (CSS custom properties the rig's shared animations read), and a real
// unlock condition checked against the player's actual saved progress.
//
// A note on unlock criteria: earlier design notes for this roster sketched
// unlocks like "complete 5 debugging exercises," but the lesson data
// (src/data/levels.js) doesn't tag individual exercises by skill category
// yet, so there's no honest way to check that today. These unlocks are
// built only from stats the app already tracks: total lessons completed
// (learning + side quests), ranked wins/losses, login streak, and ranked
// points/tier. Finer, category-based unlocks are a natural follow-up once
// levels carry skill tags.

export const CHARACTERS = [
  {
    id: "patch",
    name: "Patch",
    archetype: "Debugger",
    tier: "Starter",
    body: "average",
    hair: "short",
    hairColor: "#3a2e57",
    skin: "#e8b183",
    clothing: "trenchCoat",
    accessory: "lens",
    primary: "#34d399",
    secondary: "#0ea5e9",
    ink: "#0f766e",
    move: "patch",
    blurb: "Steady, methodical, always double-checking their work before moving on.",
    ability: "Bug Hunt bonus: +15% points for every bug found on the first try.",
    moveLine: "Calm and grounded — a gentle bounce, careful hands.",
    vars: {
      idleAmp: "6px", idleDur: "2.6s", idleEase: "ease-in-out",
      correctAmp: "20px", correctDur: ".9s",
      wrongAmp: "5px", wrongRot: "3deg", wrongDur: ".6s",
      thinkAmp: "4deg", thinkDur: "1.9s", thinkEase: "ease-in-out",
      armSway: "5deg", armRaise: "58deg",
    },
    unlock: { kind: "always" },
  },
  {
    id: "dash",
    name: "Dash",
    archetype: "Speedrunner",
    tier: "Common",
    body: "lean",
    hair: "pony",
    hairColor: "#f97316",
    skin: "#f2c9a0",
    clothing: "trackJacket",
    accessory: "bolt",
    primary: "#facc15",
    secondary: "#f97316",
    ink: "#b45309",
    move: "dash",
    blurb: "Never walks when they can sprint. Finishes fast, checks later.",
    ability: "Code Race bonus: +1 extra second on the clock for every correct answer streak of 3.",
    moveLine: "Quick, springy, always mid-motion — can barely stand still.",
    vars: {
      idleAmp: "10px", idleDur: "1.4s", idleEase: "ease-in-out",
      correctAmp: "34px", correctDur: ".6s",
      wrongAmp: "9px", wrongRot: "6deg", wrongDur: ".45s",
      thinkAmp: "3deg", thinkDur: "1s", thinkEase: "ease-in-out",
      armSway: "10deg", armRaise: "85deg",
    },
    unlock: { kind: "completed", value: 5 },
  },
  {
    id: "scope",
    name: "Scope",
    archetype: "Analyst",
    tier: "Common",
    body: "lean",
    hair: "bob",
    hairColor: "#1e293b",
    skin: "#c68642",
    clothing: "blazer",
    accessory: "lensBig",
    primary: "#818cf8",
    secondary: "#4f46e5",
    ink: "#3730a3",
    move: "scope",
    blurb: "Reads every line twice before touching the keyboard.",
    ability: "Predict the Output bonus: reveals one wrong option before you answer.",
    moveLine: "Precise and still — small, deliberate motions, long thinking pauses.",
    vars: {
      idleAmp: "3px", idleDur: "3.2s", idleEase: "ease-in-out",
      correctAmp: "16px", correctDur: "1s",
      wrongAmp: "4px", wrongRot: "2deg", wrongDur: ".7s",
      thinkAmp: "6deg", thinkDur: "2.4s", thinkEase: "ease-in-out",
      armSway: "3deg", armRaise: "40deg",
    },
    unlock: { kind: "completed", value: 15 },
  },
  {
    id: "trim",
    name: "Trim",
    archetype: "Refactorer",
    tier: "Common",
    body: "average",
    hair: "sidePart",
    hairColor: "#0f172a",
    skin: "#8d5524",
    clothing: "apron",
    accessory: "scissors",
    primary: "#2dd4bf",
    secondary: "#0891b2",
    ink: "#0e7490",
    move: "trim",
    blurb: "Can't leave messy code alone — always tidying, always shortening.",
    ability: "Code Golf bonus: +10% points for every line shaved off the par solution.",
    moveLine: "Crisp, efficient motion — no wasted movement, snappy little gestures.",
    vars: {
      idleAmp: "5px", idleDur: "2s", idleEase: "ease-in-out",
      correctAmp: "24px", correctDur: ".7s",
      wrongAmp: "6px", wrongRot: "4deg", wrongDur: ".5s",
      thinkAmp: "4deg", thinkDur: "1.5s", thinkEase: "ease-in-out",
      armSway: "6deg", armRaise: "65deg",
    },
    unlock: { kind: "completed", value: 30 },
  },
  {
    id: "bastion",
    name: "Bastion",
    archetype: "Tank",
    tier: "Common",
    body: "sturdy",
    hair: "bald",
    hairColor: "#3a2e57",
    skin: "#a1665e",
    clothing: "vestArmor",
    accessory: "shield",
    primary: "#f87171",
    secondary: "#b91c1c",
    ink: "#7f1d1d",
    move: "bastion",
    blurb: "Doesn't flinch at hard problems. Takes hits, keeps going.",
    ability: "Debug Duel bonus: one wrong answer per match doesn't cost a life.",
    moveLine: "Big, heavy, unhurried — slow stomps, minimal celebration.",
    vars: {
      idleAmp: "4px", idleDur: "3.4s", idleEase: "ease-in-out",
      correctAmp: "14px", correctDur: "1.1s",
      wrongAmp: "3px", wrongRot: "2deg", wrongDur: ".8s",
      thinkAmp: "3deg", thinkDur: "2.2s", thinkEase: "ease-in-out",
      armSway: "3deg", armRaise: "35deg",
    },
    unlock: { kind: "rankedWins", value: 3 },
  },
  {
    id: "bridge",
    name: "Bridge",
    archetype: "Support",
    tier: "Common",
    body: "sturdy",
    hair: "afro",
    hairColor: "#78350f",
    skin: "#ffdbac",
    clothing: "cardigan",
    accessory: "links",
    primary: "#fb923c",
    secondary: "#ec4899",
    ink: "#be185d",
    move: "bridge",
    blurb: "Shows up every day. Great teammate, better hype squad.",
    ability: "Relay bonus: teammates recover 1 extra second when they pass the baton.",
    moveLine: "Warm and open — big friendly arm waves, easy sway.",
    vars: {
      idleAmp: "7px", idleDur: "2.3s", idleEase: "ease-in-out",
      correctAmp: "26px", correctDur: ".85s",
      wrongAmp: "6px", wrongRot: "4deg", wrongDur: ".55s",
      thinkAmp: "5deg", thinkDur: "1.7s", thinkEase: "ease-in-out",
      armSway: "12deg", armRaise: "95deg",
    },
    unlock: { kind: "streak", value: 3 },
  },
  {
    id: "glitch",
    name: "Glitch",
    archetype: "Wildcard",
    tier: "Common",
    body: "lean",
    hair: "mohawk",
    hairColor: "#a3e635",
    skin: "#e0ac69",
    clothing: "patchwork",
    accessory: "glitch",
    primary: "#c084fc",
    secondary: "#22d3ee",
    ink: "#7e22ce",
    move: "glitch",
    blurb: "Unpredictable on purpose. You never know what Glitch will do next.",
    ability: "Chaos Round bonus: random modifiers land in your favor slightly more often.",
    moveLine: "Jittery and stepped — flickers instead of flowing, never quite still.",
    vars: {
      idleAmp: "5px", idleDur: "1.8s", idleEase: "steps(8)",
      correctAmp: "28px", correctDur: ".7s",
      wrongAmp: "8px", wrongRot: "7deg", wrongDur: ".4s",
      thinkAmp: "5deg", thinkDur: "1.3s", thinkEase: "steps(6)",
      armSway: "8deg", armRaise: "70deg",
    },
    unlock: { kind: "rankedMatches", value: 5 },
  },
  {
    id: "blueprint",
    name: "Blueprint",
    archetype: "Architect",
    tier: "Common",
    body: "average",
    hair: "bun",
    hairColor: "#334155",
    skin: "#e8b183",
    clothing: "architectVest",
    accessory: "compass",
    primary: "#38bdf8",
    secondary: "#6366f1",
    ink: "#3730a3",
    move: "blueprint",
    blurb: "Plans three moves ahead. Would rather design the system than patch it.",
    ability: "Showdown bonus: sees the challenge category one second before it starts.",
    moveLine: "Measured and geometric — even, confident motion on a steady beat.",
    vars: {
      idleAmp: "5px", idleDur: "2.5s", idleEase: "ease-in-out",
      correctAmp: "20px", correctDur: ".9s",
      wrongAmp: "5px", wrongRot: "3deg", wrongDur: ".6s",
      thinkAmp: "5deg", thinkDur: "2s", thinkEase: "ease-in-out",
      armSway: "5deg", armRaise: "62deg",
    },
    unlock: { kind: "completed", value: 60 },
  },
  {
    id: "sherlock-byte",
    name: "Sherlock Byte",
    archetype: "Debugger",
    tier: "Rare",
    body: "average",
    hair: "curly",
    hairColor: "#57534e",
    skin: "#f1c27d",
    clothing: "trenchCoatRich",
    accessory: "glasses",
    primary: "#facc15",
    secondary: "#334155",
    ink: "#1c1917",
    move: "sherlock",
    blurb: "The legendary bug hunter. Finds the root cause before you finish explaining it.",
    ability: "Bug Hunt bonus: +25% points, and the first bug of every match is highlighted.",
    moveLine: "Sharp and investigative — a dramatic tilt whenever a clue clicks.",
    vars: {
      idleAmp: "5px", idleDur: "2.2s", idleEase: "ease-in-out",
      correctAmp: "24px", correctDur: ".8s",
      wrongAmp: "5px", wrongRot: "3deg", wrongDur: ".55s",
      thinkAmp: "9deg", thinkDur: "1.4s", thinkEase: "ease-in-out",
      armSway: "6deg", armRaise: "70deg",
    },
    unlock: { kind: "completed", value: 100 },
  },
  {
    id: "null-pointer",
    name: "Null Pointer",
    archetype: "Debugger",
    tier: "Legendary",
    body: "lean",
    hair: "bald",
    hairColor: "#0f172a",
    skin: "#6b4226",
    clothing: "glowCoat",
    accessory: "lensGlow",
    primary: "#22d3ee",
    secondary: "#0f172a",
    ink: "#67e8f9",
    move: "null-pointer",
    blurb: "Stoic, unreadable, unbeatable. Rumor says they've never once panicked.",
    ability: "All modes bonus: +5% ranked points, and never loses a streak on a single miss.",
    moveLine: "Almost motionless — the calm of someone who has seen every bug there is.",
    vars: {
      idleAmp: "2px", idleDur: "4s", idleEase: "ease-in-out",
      correctAmp: "10px", correctDur: "1.2s",
      wrongAmp: "2px", wrongRot: "1deg", wrongDur: ".9s",
      thinkAmp: "2deg", thinkDur: "2.8s", thinkEase: "ease-in-out",
      armSway: "2deg", armRaise: "26deg",
    },
    unlock: { kind: "rankedPoints", value: 2000 },
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

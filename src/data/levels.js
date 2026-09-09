// Placeholder level data. No real lesson content yet — this file just
// defines the shape/structure so the world map, level map, and level
// screen have something to render. Replace `content: null` with real
// exercises later.

// 20 lesson topics, reused (in order) inside every world. Real curriculum
// content can diverge per world later — for now this just keeps the map
// populated with 200 distinct-looking stages.
const TOPICS = [
  "Say Hello",
  "Variables 101",
  "Loopy Loops",
  "If This, Then That",
  "Function Junction",
  "Array Adventures",
  "String Theory",
  "Object Oasis",
  "Boolean Basics",
  "Debugging Dojo",
  "Recursion Station",
  "Sorting Safari",
  "Search Party",
  "Class Act",
  "Error Handling 101",
  "API Expedition",
  "Async Awakening",
  "Data Structures Trek",
  "Algorithm Arena",
  "Code Review Crossing",
];

const STAGES_PER_WORLD = 20;

// Ten distinct color themes so each world reads as its own place on the map.
const WORLD_THEMES = [
  {
    id: 1,
    name: "Pixel Meadow",
    icon: "🌱",
    from: "#4ade80",
    to: "#16a34a",
    characters: ["🐣", "🐛", "🐝", "🦋"],
  },
  {
    id: 2,
    name: "Coral Bay",
    icon: "🐠",
    from: "#22d3ee",
    to: "#0891b2",
    characters: ["🐠", "🐙", "🦀", "🐢"],
  },
  {
    id: 3,
    name: "Sunset Dunes",
    icon: "🏜️",
    from: "#fb923c",
    to: "#ea580c",
    characters: ["🦂", "🐫", "🦎", "🦅"],
  },
  {
    id: 4,
    name: "Crystal Cavern",
    icon: "💎",
    from: "#c084fc",
    to: "#7c3aed",
    characters: ["🦇", "💎", "🕷️", "👾"],
  },
  {
    id: 5,
    name: "Cloud Peaks",
    icon: "⛰️",
    from: "#38bdf8",
    to: "#0284c7",
    characters: ["🦅", "🐐", "☁️", "🦉"],
  },
  {
    id: 6,
    name: "Ember Forge",
    icon: "🔥",
    from: "#f87171",
    to: "#b91c1c",
    characters: ["🐉", "🔥", "⚙️", "🦎"],
  },
  {
    id: 7,
    name: "Moonlit Grove",
    icon: "🌙",
    from: "#818cf8",
    to: "#4338ca",
    characters: ["🦉", "🌙", "🦊", "✨"],
  },
  {
    id: 8,
    name: "Golden Harbor",
    icon: "⚓",
    from: "#fbbf24",
    to: "#d97706",
    characters: ["⚓", "🦜", "🐬", "🦑"],
  },
  {
    id: 9,
    name: "Neon District",
    icon: "🌆",
    from: "#f472b6",
    to: "#db2777",
    characters: ["🤖", "🌆", "🎮", "⚡"],
  },
  {
    id: 10,
    name: "Starfall Summit",
    icon: "✨",
    from: "#a78bfa",
    to: "#3b82f6",
    characters: ["🚀", "🌟", "🛸", "🪐"],
  },
];

// Real lesson content, keyed by "<worldId>-<stageNumber>". Everything not
// listed here stays a placeholder (`content: null`) until it's written.
const LESSON_CONTENT = {
  "1-1": {
    type: "code",
    instructions:
      'Every programmer\'s first program prints a greeting. Use console.log() to print exactly: Hello, World!',
    starterCode:
      '// Use console.log() to print a message.\n// Fill in the string below:\n\nconsole.log("");',
    expectedOutput: "Hello, World!",
    hint: 'console.log() takes a string in quotes, like console.log("some text").',
  },
};

function buildLevelsForWorld(worldId) {
  return Array.from({ length: STAGES_PER_WORLD }, (_, i) => {
    const stageNumber = i + 1;
    const status = worldId === 1 && stageNumber === 1 ? "unlocked" : "locked";

    return {
      id: `${worldId}-${stageNumber}`,
      worldId,
      stageNumber,
      title: TOPICS[i % TOPICS.length],
      character: WORLD_THEMES[worldId - 1].characters[i % 4],
      status,
      content: LESSON_CONTENT[`${worldId}-${stageNumber}`] ?? null,
    };
  });
}

export const worlds = WORLD_THEMES.map((theme) => ({
  ...theme,
  status: theme.id === 1 ? "unlocked" : "locked",
  totalStages: STAGES_PER_WORLD,
  levels: buildLevelsForWorld(theme.id),
}));

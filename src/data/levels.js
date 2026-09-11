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
  "1-2": {
    type: "code",
    instructions:
      "Declare a variable named score, set it to 10, then print it.",
    starterCode:
      "// Declare a variable called score set to 10,\n// then print it with console.log.\n\n",
    expectedOutput: "10",
    hint: "let score = 10;\nconsole.log(score);",
  },
  "1-3": {
    type: "code",
    instructions: "Use a for loop to print the numbers 1 through 5, one per line.",
    starterCode: "// Write a for loop that prints 1 to 5\n\n",
    expectedOutput: "1\n2\n3\n4\n5",
    hint: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}",
  },
  "1-4": {
    type: "code",
    instructions:
      'Given the age variable below, print "Adult" if age is 18 or older, otherwise print "Minor".',
    starterCode: "let age = 20;\n\n// Write your if/else statement below\n",
    expectedOutput: "Adult",
    hint: 'if (age >= 18) {\n  console.log("Adult");\n} else {\n  console.log("Minor");\n}',
  },
  "1-5": {
    type: "code",
    instructions: 'Write a function named greet that prints "Hi!", then call it.',
    starterCode:
      '// Define a function called greet that prints "Hi!"\n// Then call greet()\n\n',
    expectedOutput: "Hi!",
    hint: 'function greet() {\n  console.log("Hi!");\n}\ngreet();',
  },
  "1-6": {
    type: "quiz",
    instructions: "Arrays store ordered lists of values.",
    question: "Which line correctly creates an array with the numbers 1, 2, and 3?",
    options: [
      "let nums = (1, 2, 3);",
      "let nums = [1, 2, 3];",
      "let nums = {1, 2, 3};",
      "let nums = 1, 2, 3;",
    ],
    correctIndex: 1,
    explanation: "Arrays are written with square brackets: [1, 2, 3].",
  },
  "1-7": {
    type: "code",
    instructions:
      'Given the first and last name below, print the full name: "Ada Lovelace".',
    starterCode:
      'let first = "Ada";\nlet last = "Lovelace";\n\n// Print the full name below\n',
    expectedOutput: "Ada Lovelace",
    hint: 'console.log(first + " " + last);',
  },
  "1-8": {
    type: "quiz",
    instructions: "Objects store data as key/value pairs.",
    question:
      'Which of these correctly creates an object with a name property set to "Rex"?',
    options: [
      'let dog = { name: "Rex" };',
      'let dog = ( name: "Rex" );',
      'let dog = [ name: "Rex" ];',
      'let dog = name: "Rex";',
    ],
    correctIndex: 0,
    explanation:
      'Objects use curly braces with key: value pairs, like { name: "Rex" }.',
  },
  "1-9": {
    type: "quiz",
    instructions: "Booleans combine with && (and) and || (or).",
    question: "What does the expression 5 > 3 && 2 > 4 evaluate to?",
    options: ["true", "false", "5", "undefined"],
    correctIndex: 1,
    explanation:
      "5 > 3 is true, but 2 > 4 is false. With &&, both sides must be true, so the result is false.",
  },
  "1-10": {
    type: "code",
    instructions: 'This code should print "Fixed it!" but has a bug. Find and fix it.',
    starterCode: 'console.log("Fixed it!"\n',
    expectedOutput: "Fixed it!",
    hint: "Check your parentheses — every ( needs a matching ).",
  },
  "1-11": {
    type: "quiz",
    instructions: "Recursion is a function that calls itself.",
    question: "What must every recursive function have to avoid running forever?",
    options: [
      "A for loop",
      "A base case that stops the recursion",
      "An array",
      "A return type of number",
    ],
    correctIndex: 1,
    explanation:
      "Without a base case, a recursive function keeps calling itself forever, causing a stack overflow.",
  },
  "1-12": {
    type: "quiz",
    instructions: "JavaScript arrays come with handy built-in methods.",
    question: "Which built-in array method sorts elements in place?",
    options: [".filter()", ".map()", ".sort()", ".find()"],
    correctIndex: 2,
    explanation: "Array.prototype.sort() reorders the elements of an array in place.",
  },
  "1-13": {
    type: "quiz",
    instructions: "Searching arrays is a everyday task.",
    question: "What does [1, 2, 3].includes(2) return?",
    options: ["1", "true", "false", "2"],
    correctIndex: 1,
    explanation: ".includes() returns true if the array contains the given value.",
  },
  "1-14": {
    type: "quiz",
    instructions: "Classes are blueprints for creating objects.",
    question: "Which keyword creates a new instance of a class in JavaScript?",
    options: ["make", "create", "new", "init"],
    correctIndex: 2,
    explanation:
      "The new keyword creates a new object instance from a class, e.g. new Dog().",
  },
  "1-15": {
    type: "code",
    instructions:
      'Wrap the risky code below in a try/catch. In the catch block, print "Caught an error!".',
    starterCode:
      '// Wrap this in try/catch and print "Caught an error!" in the catch block\nJSON.parse("not valid json");\n',
    expectedOutput: "Caught an error!",
    hint: 'try {\n  JSON.parse("not valid json");\n} catch (e) {\n  console.log("Caught an error!");\n}',
  },
  "1-16": {
    type: "quiz",
    instructions: "APIs let programs talk to each other.",
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Automated Program Input",
      "Applied Protocol Internet",
      "App Process Index",
    ],
    correctIndex: 0,
    explanation:
      "API stands for Application Programming Interface — a way for programs to talk to each other.",
  },
  "1-17": {
    type: "quiz",
    instructions: "Async code lets programs wait without freezing.",
    question: "Which keyword pauses a function until a Promise resolves?",
    options: ["defer", "await", "pause", "yield"],
    correctIndex: 1,
    explanation:
      "await pauses an async function until the Promise it's waiting on resolves.",
  },
  "1-18": {
    type: "quiz",
    instructions: "Different data structures fit different jobs.",
    question: "Which structure follows First-In-First-Out (FIFO) order?",
    options: ["Stack", "Queue", "Tree", "Set"],
    correctIndex: 1,
    explanation:
      "A queue removes items in the same order they were added — first in, first out.",
  },
  "1-19": {
    type: "quiz",
    instructions: "Big O notation describes how algorithms scale.",
    question: "What does O(n) time complexity mean?",
    options: [
      "The algorithm always takes exactly n seconds",
      "The runtime grows roughly in proportion to the input size",
      "The algorithm uses n bytes of memory",
      "The algorithm never finishes",
    ],
    correctIndex: 1,
    explanation: "O(n) means runtime scales linearly with the input size n.",
  },
  "1-20": {
    type: "quiz",
    instructions: "Spotting bugs by reading code is a core skill.",
    question:
      'A teammate wrote: if (x = 5) { console.log("five"); } — what\'s the bug?',
    options: [
      "Nothing, it's correct",
      "It uses assignment (=) instead of comparison (===)",
      "console.log needs two arguments",
      "if statements can't use curly braces",
    ],
    correctIndex: 1,
    explanation:
      "= assigns a value while === compares. This bug silently sets x to 5 and always runs the block.",
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

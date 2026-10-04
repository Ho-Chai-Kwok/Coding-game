// Bug Hunt / Debug Duel content: short snippets with exactly one planted
// bug. Kept language-agnostic (plain text, not executed) so a single bank
// works for every player regardless of their chosen coding language, the
// same reasoning extraWorlds.js uses for the quiz-only worlds.
//
// Flow: the player first taps the line they think is buggy, then picks
// the correct fix from four options.
//
// `difficulty` (1-5) is a genuine complexity rating, not padded to match
// the 7-tier rank scale — with only 10 snippets, forcing 7 artificial
// buckets would leave some nearly empty. getBugHuntPool(level) (below)
// biases toward the closest available difficulty instead of requiring an
// exact tier match, so Bronze/Silver players reliably see the easiest
// ones and Master/Grandmaster players see the hardest available ones,
// honestly reflecting that this pool's range tops out around mid-pack.

export const BUG_HUNT_SNIPPETS = [
  {
    id: "bh-off-by-one",
    title: "Off-by-One Loop",
    difficulty: 2,
    lines: [
      "let total = 0;",
      "for (let i = 0; i <= 5; i++) {",
      "  total = total + i;",
      "}",
      "console.log(total);",
    ],
    buggyLine: 1,
    fixOptions: [
      "Change i <= 5 to i < 5",
      "Change total = 0 to total = 1",
      "Change console.log(total) to console.log(i)",
      "Change let i = 0 to let i = 1",
    ],
    correctFixIndex: 0,
    explanation: "i <= 5 runs one extra time (0 through 5 is six loops) — the fifth item needs i < 5 to stop at index 4.",
  },
  {
    id: "bh-assignment",
    title: "Assignment vs. Equality",
    difficulty: 2,
    lines: [
      "let score = 10;",
      "if (score = 20) {",
      "  console.log('High score!');",
      "}",
    ],
    buggyLine: 1,
    fixOptions: [
      "Change = to ==",
      "Change score to Score",
      "Remove the parentheses",
      "Change 20 to '20'",
    ],
    correctFixIndex: 0,
    explanation: "A single = assigns 20 to score (and is always truthy) — a comparison needs == or ===.",
  },
  {
    id: "bh-typo-var",
    title: "Misspelled Variable",
    difficulty: 1,
    lines: [
      "let userName = 'Alex';",
      "console.log(userNmae);",
    ],
    buggyLine: 1,
    fixOptions: [
      "Change userNmae to userName",
      "Change 'Alex' to \"Alex\"",
      "Add a semicolon after let",
      "Change console.log to print",
    ],
    correctFixIndex: 0,
    explanation: "userNmae is a typo — it doesn't match the declared variable userName, so this throws a reference error.",
  },
  {
    id: "bh-missing-return",
    title: "Missing Return",
    difficulty: 2,
    lines: [
      "function double(n) {",
      "  n * 2;",
      "}",
      "console.log(double(4));",
    ],
    buggyLine: 1,
    fixOptions: [
      "Change n * 2 to return n * 2",
      "Change function to func",
      "Change double(4) to double(4, 4)",
      "Change n * 2 to n + 2",
    ],
    correctFixIndex: 0,
    explanation: "Without return, the function computes n * 2 but throws the result away — it always gives back undefined.",
  },
  {
    id: "bh-wrong-index",
    title: "Off-by-One Index",
    difficulty: 1,
    lines: [
      "let colors = ['red', 'green', 'blue'];",
      "console.log(colors[3]);",
    ],
    buggyLine: 1,
    fixOptions: [
      "Change colors[3] to colors[2]",
      "Change colors[3] to colors[4]",
      "Add a fourth color to the array",
      "Change console.log to alert",
    ],
    correctFixIndex: 0,
    explanation: "A 3-item array has indexes 0, 1, 2 — index 3 is out of bounds and gives undefined.",
  },
  {
    id: "bh-infinite-loop",
    title: "Infinite Loop",
    difficulty: 2,
    lines: [
      "let i = 0;",
      "while (i < 5) {",
      "  console.log(i);",
      "}",
    ],
    buggyLine: 2,
    fixOptions: [
      "Add i++; inside the loop body",
      "Change while to for",
      "Change i < 5 to i > 5",
      "Change let i = 0 to let i = 5",
    ],
    correctFixIndex: 0,
    explanation: "i never changes inside the loop, so i < 5 is always true — the loop needs i++ to make progress.",
  },
  {
    id: "bh-string-concat",
    title: "Number Looks Like Concatenation",
    difficulty: 4,
    lines: [
      "let price = 5;",
      "let tax = 2;",
      "console.log('Total: ' + price + tax);",
    ],
    buggyLine: 2,
    fixOptions: [
      "Change to 'Total: ' + (price + tax)",
      "Change price to 'price'",
      "Change tax to 'tax'",
      "Remove the quotes around 'Total: '",
    ],
    correctFixIndex: 0,
    explanation: "Without parentheses, + runs left to right: 'Total: ' + price becomes a string first, so + tax appends '2' instead of adding it.",
  },
  {
    id: "bh-array-method",
    title: "Wrong Array Method",
    difficulty: 4,
    lines: [
      "let nums = [1, 2, 3, 4];",
      "let doubled = nums.forEach(n => n * 2);",
      "console.log(doubled);",
    ],
    buggyLine: 1,
    fixOptions: [
      "Change forEach to map",
      "Change n * 2 to n + 2",
      "Change nums to numbers",
      "Add a return statement",
    ],
    correctFixIndex: 0,
    explanation: "forEach always returns undefined — building a new array of transformed values needs map, not forEach.",
  },
  {
    id: "bh-wrong-comparison",
    title: "Wrong Comparison Direction",
    difficulty: 3,
    lines: [
      "function isAdult(age) {",
      "  return age < 18;",
      "}",
      "console.log(isAdult(25));",
    ],
    buggyLine: 1,
    fixOptions: [
      "Change age < 18 to age >= 18",
      "Change function name to adult",
      "Change age to Age",
      "Change 18 to '18'",
    ],
    correctFixIndex: 0,
    explanation: "isAdult should be true for ages 18 and up — age < 18 has the comparison backwards.",
  },
  {
    id: "bh-uninitialized",
    title: "Forgot to Initialize",
    difficulty: 4,
    lines: [
      "let total;",
      "for (let i = 1; i <= 3; i++) {",
      "  total += i;",
      "}",
      "console.log(total);",
    ],
    buggyLine: 0,
    fixOptions: [
      "Change let total; to let total = 0;",
      "Change total += i to total = i",
      "Change i <= 3 to i < 3",
      "Change let i = 1 to let i = 0",
    ],
    correctFixIndex: 0,
    explanation: "total starts as undefined, so undefined += i produces NaN on the first loop — it needs a starting value of 0.",
  },
];

// With no `level`, returns everything (unchanged default). With one,
// returns the snippets sorted closest-difficulty-first (see the file
// header for why this biases toward the player's rank rather than
// requiring an exact 7-way tier match on only 10 items).
export function getBugHuntPool(level) {
  if (level == null) return BUG_HUNT_SNIPPETS;
  return [...BUG_HUNT_SNIPPETS].sort(
    (a, b) => Math.abs(a.difficulty - level) - Math.abs(b.difficulty - level),
  );
}

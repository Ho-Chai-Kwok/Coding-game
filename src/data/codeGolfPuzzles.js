// Code Golf puzzles: everyone solves the same problem, ranked on how few
// lines it takes rather than how fast. "Par" is the line count of a clean
// idiomatic solution in each language — beating it earns a bonus.

export const CODE_GOLF_PUZZLES = [
  {
    id: "golf-sum",
    title: "Sum 1 to 10",
    instructions: "Print the sum of every number from 1 to 10 (the answer is 55).",
    expectedOutput: "55",
    par: { javascript: 3, python: 1 },
    starterCode: {
      javascript: "// Print the sum of 1 through 10\n\n",
      python: "# Print the sum of 1 through 10\n\n",
    },
    hint: {
      javascript: "A tight for loop works, but Array.from({length:10}, (_,i)=>i+1).reduce((a,b)=>a+b) fits on one line.",
      python: "print(sum(range(1, 11))) solves it in one line.",
    },
  },
  {
    id: "golf-reverse",
    title: "Reverse a Word",
    instructions: 'Print the word "code" reversed.',
    expectedOutput: "edoc",
    par: { javascript: 1, python: 1 },
    starterCode: {
      javascript: '// Print "code" reversed\n\n',
      python: '# Print "code" reversed\n\n',
    },
    hint: {
      javascript: '"code".split("").reverse().join("") reverses a string in one line.',
      python: '"code"[::-1] reverses a string in one line.',
    },
  },
  {
    id: "golf-vowels",
    title: "Count the Vowels",
    instructions: 'Print how many vowels (a, e, i, o, u) are in "banana" (the answer is 3).',
    expectedOutput: "3",
    par: { javascript: 2, python: 1 },
    starterCode: {
      javascript: '// Print the vowel count in "banana"\n\n',
      python: '# Print the vowel count in "banana"\n\n',
    },
    hint: {
      javascript: '"banana".split("").filter(c => "aeiou".includes(c)).length counts them in one line.',
      python: 'sum(1 for c in "banana" if c in "aeiou") counts them in one line.',
    },
  },
  {
    id: "golf-even",
    title: "Even or Odd",
    instructions: "Print Even or Odd for the number 42.",
    expectedOutput: "Even",
    par: { javascript: 1, python: 1 },
    starterCode: {
      javascript: "// Print Even or Odd for 42\n\n",
      python: "# Print Even or Odd for 42\n\n",
    },
    hint: {
      javascript: 'console.log(42 % 2 === 0 ? "Even" : "Odd"); does it in one line.',
      python: 'print("Even" if 42 % 2 == 0 else "Odd") does it in one line.',
    },
  },
  {
    id: "golf-max",
    title: "Find the Largest",
    instructions: "Print the largest number in [4, 9, 2, 7] (the answer is 9).",
    expectedOutput: "9",
    par: { javascript: 1, python: 1 },
    starterCode: {
      javascript: "// Print the largest number in [4, 9, 2, 7]\n\n",
      python: "# Print the largest number in [4, 9, 2, 7]\n\n",
    },
    hint: {
      javascript: "Math.max(...[4, 9, 2, 7]) finds it in one line.",
      python: "max([4, 9, 2, 7]) finds it in one line.",
    },
  },
];

// Counts real code lines: no blank lines, no comment-only lines.
export function countCodeLines(code, language) {
  const commentPrefix = language === "python" ? "#" : "//";
  return code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith(commentPrefix)).length;
}

export function getCodeGolfPool() {
  return CODE_GOLF_PUZZLES;
}

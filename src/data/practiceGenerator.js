// Templated lesson generation for the practice-drill worlds (levels.js
// appends these after the hand-authored curriculum). Each "family" is one
// skill (arithmetic, variables, strings, ...) broken into 10 difficulty
// tiers; each tier is a real template — not just swapped numbers — so
// difficulty genuinely climbs within a family, not just repeats. Variants
// within a tier DO vary mostly by data (names/numbers/strings), which is
// exactly what was asked for ("repetitive but with different variables")
// — but each tier's *shape* of problem is distinct from the last.
//
// Deterministic by design: variant N of tier T always generates the exact
// same lesson, every load, for every player — no Math.random here. That
// matters for anything checked into the repo as real content (reproducible
// builds, stable hints, nothing that silently differs between two people
// comparing a level).

// A small, deterministic pseudo-random generator (mulberry32) seeded from
// family+tier+variant indices, used only to vary *which* of several
// equally-valid names/values a given variant gets — not to vary the
// problem's difficulty or shape.
function rngFor(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function int(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

const VAR_NAMES = [
  "score", "total", "count", "value", "amount", "price", "age", "level",
  "points", "health", "speed", "width", "height", "x", "y", "n", "result",
  "balance", "steps", "lives",
];
const WORDS = [
  "apple", "robot", "comet", "pixel", "ninja", "shadow", "cipher", "quest",
  "dragon", "signal", "galaxy", "puzzle", "rocket", "cactus", "falcon",
];

// Builds one code-type lesson (same exact shape as the hand-authored ones
// in levels.js — tutorial/example/instructions/starterCode/expectedOutput
// /hint, plus a parallel `python` block) from a family's per-tier spec.
function makeLesson({ title, tutorial, example, instructions, js, py, expected, hint, pyHint }) {
  return {
    title,
    type: "code",
    tutorial,
    example,
    instructions,
    starterCode: js,
    expectedOutput: expected,
    hint,
    python: {
      tutorial,
      example,
      starterCode: py,
      hint: pyHint ?? hint,
    },
  };
}

// ---- Family: Arithmetic ---------------------------------------------
// Tier 1: single operation on two literals. Tier 10: multi-step, operator
// precedence, negative numbers, a variable carried across two statements.
function arithmeticTier(tier, variantIndex, familyKey) {
  const rng = rngFor(`${familyKey}:${tier}:${variantIndex}`);
  const name = pick(rng, VAR_NAMES);
  if (tier === 1) {
    const a = int(rng, 1, 20), b = int(rng, 1, 20);
    return makeLesson({
      title: `Add ${a} + ${b}`,
      tutorial: "Use + to add two numbers, and console.log() to print the result.",
      example: "console.log(3 + 4);\n// prints: 7",
      instructions: `Print the result of ${a} + ${b}.`,
      js: `// Print ${a} + ${b}\n\n`,
      py: `# Print ${a} + ${b}\n\n`,
      expected: String(a + b),
      hint: `console.log(${a} + ${b});`,
      pyHint: `print(${a} + ${b})`,
    });
  }
  if (tier === 2) {
    const a = int(rng, 10, 50), b = int(rng, 1, 9);
    return makeLesson({
      title: `Subtract ${a} − ${b}`,
      tutorial: "Use - to subtract.",
      example: "console.log(10 - 3);\n// prints: 7",
      instructions: `Print the result of ${a} - ${b}.`,
      js: `// Print ${a} - ${b}\n\n`,
      py: `# Print ${a} - ${b}\n\n`,
      expected: String(a - b),
      hint: `console.log(${a} - ${b});`,
      pyHint: `print(${a} - ${b})`,
    });
  }
  if (tier === 3) {
    const a = int(rng, 2, 12), b = int(rng, 2, 9);
    return makeLesson({
      title: `Multiply ${a} × ${b}`,
      tutorial: "Use * to multiply.",
      example: "console.log(6 * 7);\n// prints: 42",
      instructions: `Print the result of ${a} * ${b}.`,
      js: `// Print ${a} * ${b}\n\n`,
      py: `# Print ${a} * ${b}\n\n`,
      expected: String(a * b),
      hint: `console.log(${a} * ${b});`,
      pyHint: `print(${a} * ${b})`,
    });
  }
  if (tier === 4) {
    const b = int(rng, 2, 9), q = int(rng, 2, 12);
    const a = b * q;
    return makeLesson({
      title: `Divide ${a} ÷ ${b}`,
      tutorial: "Use / to divide. These are set up to divide evenly.",
      example: "console.log(20 / 4);\n// prints: 5",
      instructions: `Print the result of ${a} / ${b}.`,
      js: `// Print ${a} / ${b}\n\n`,
      py: `# Print ${a} / ${b}\n\n`,
      expected: String(a / b),
      hint: `console.log(${a} / ${b});`,
      pyHint: `print(${a} / ${b})`,
    });
  }
  if (tier === 5) {
    const a = int(rng, 1, 20), b = int(rng, 1, 20), c = int(rng, 1, 10);
    return makeLesson({
      title: "Two Operations",
      tutorial: "JavaScript follows order of operations — multiplication/division happen before addition/subtraction, just like in math class.",
      example: "console.log(2 + 3 * 4);\n// prints: 14 (3*4 first, then +2)",
      instructions: `Print the result of ${a} + ${b} * ${c}.`,
      js: `// Print ${a} + ${b} * ${c}\n\n`,
      py: `# Print ${a} + ${b} * ${c}\n\n`,
      expected: String(a + b * c),
      hint: `console.log(${a} + ${b} * ${c});`,
      pyHint: `print(${a} + ${b} * ${c})`,
    });
  }
  if (tier === 6) {
    const a = int(rng, 1, 15), b = int(rng, 1, 15);
    return makeLesson({
      title: "Parentheses Change the Order",
      tutorial: "Wrap part of an expression in parentheses to force it to happen first, overriding the normal order of operations.",
      example: "console.log((2 + 3) * 4);\n// prints: 20 (2+3 first, because of the parentheses)",
      instructions: `Print the result of (${a} + ${b}) * 2 — note the parentheses.`,
      js: `// Print (${a} + ${b}) * 2\n\n`,
      py: `# Print (${a} + ${b}) * 2\n\n`,
      expected: String((a + b) * 2),
      hint: `console.log((${a} + ${b}) * 2);`,
      pyHint: `print((${a} + ${b}) * 2)`,
    });
  }
  if (tier === 7) {
    const start = int(rng, 10, 50);
    const add = int(rng, 1, 20);
    return makeLesson({
      title: `Store ${name}, Then Change It`,
      tutorial: "You can reassign a variable after declaring it with let — its value just changes to whatever you assign next.",
      example: "let x = 5;\nx = x + 2;\nconsole.log(x);\n// prints: 7",
      instructions: `Declare "let ${name} = ${start};", then add ${add} to it and print the final value.`,
      js: `let ${name} = ${start};\n// add ${add} to ${name}, then print it\n\n`,
      py: `${name} = ${start}\n# add ${add} to ${name}, then print it\n\n`,
      expected: String(start + add),
      hint: `${name} = ${name} + ${add};\nconsole.log(${name});`,
      pyHint: `${name} = ${name} + ${add}\nprint(${name})`,
    });
  }
  if (tier === 8) {
    const a = int(rng, -15, -1), b = int(rng, 1, 20);
    return makeLesson({
      title: "Negative Numbers",
      tutorial: "Negative numbers work in arithmetic exactly like you'd expect from math class.",
      example: "console.log(-5 + 8);\n// prints: 3",
      instructions: `Print the result of ${a} + ${b}.`,
      js: `// Print ${a} + ${b}\n\n`,
      py: `# Print ${a} + ${b}\n\n`,
      expected: String(a + b),
      hint: `console.log(${a} + ${b});`,
      pyHint: `print(${a} + ${b})`,
    });
  }
  if (tier === 9) {
    const a = int(rng, 2, 9), b = int(rng, 2, 9), c = int(rng, 2, 9);
    return makeLesson({
      title: "Remainder (Modulo)",
      tutorial: "The % operator gives you the remainder after division — e.g. 10 % 3 is 1, because 10 ÷ 3 leaves 1 left over.",
      example: "console.log(10 % 3);\n// prints: 1",
      instructions: `Print the result of (${a} * ${b} + ${c}) % ${b}.`,
      js: `// Print (${a} * ${b} + ${c}) % ${b}\n\n`,
      py: `# Print (${a} * ${b} + ${c}) % ${b}\n\n`,
      expected: String((a * b + c) % b),
      hint: `console.log((${a} * ${b} + ${c}) % ${b});`,
      pyHint: `print((${a} * ${b} + ${c}) % ${b})`,
    });
  }
  // tier 10: multi-variable, multi-statement.
  const base = int(rng, 5, 15);
  const mult = int(rng, 2, 5);
  const sub = int(rng, 1, 10);
  const name2 = pick(rng, VAR_NAMES.filter((n) => n !== name));
  return makeLesson({
    title: "Two Variables Together",
    tutorial: "Variables can be combined in expressions just like numbers — use one variable's value while computing another's.",
    example: "let a = 3;\nlet b = a * 2;\nconsole.log(b);\n// prints: 6",
    instructions: `Declare "let ${name} = ${base};", then "let ${name2} = ${name} * ${mult} - ${sub};", then print ${name2}.`,
    js: `let ${name} = ${base};\nlet ${name2} = ${name} * ${mult} - ${sub};\n// print ${name2}\n\n`,
    py: `${name} = ${base}\n${name2} = ${name} * ${mult} - ${sub}\n# print ${name2}\n\n`,
    expected: String(base * mult - sub),
    hint: `console.log(${name2});`,
    pyHint: `print(${name2})`,
  });
}

// ---- Family: Strings ---------------------------------------------
function stringsTier(tier, variantIndex, familyKey) {
  const rng = rngFor(`${familyKey}:${tier}:${variantIndex}`);
  const w1 = pick(rng, WORDS);
  const w2 = pick(rng, WORDS.filter((w) => w !== w1));
  const name = pick(rng, VAR_NAMES);
  if (tier === 1) {
    return makeLesson({
      title: `Print "${w1}"`,
      tutorial: "A string is text in quotes. Print one directly.",
      example: 'console.log("hi");\n// prints: hi',
      instructions: `Print exactly: ${w1}`,
      js: `// Print: ${w1}\n\n`,
      py: `# Print: ${w1}\n\n`,
      expected: w1,
      hint: `console.log("${w1}");`,
      pyHint: `print("${w1}")`,
    });
  }
  if (tier === 2) {
    return makeLesson({
      title: "Join Two Strings",
      tutorial: "The + operator joins (concatenates) strings together when used between two of them.",
      example: 'console.log("foo" + "bar");\n// prints: foobar',
      instructions: `Print "${w1}" and "${w2}" joined together with no space between them.`,
      js: `// Print "${w1}" + "${w2}" joined with no space\n\n`,
      py: `# Print "${w1}" + "${w2}" joined with no space\n\n`,
      expected: w1 + w2,
      hint: `console.log("${w1}" + "${w2}");`,
      pyHint: `print("${w1}" + "${w2}")`,
    });
  }
  if (tier === 3) {
    return makeLesson({
      title: "Join With a Space",
      tutorial: 'To add a space between two joined strings, include it as its own string: "a" + " " + "b".',
      example: 'console.log("foo" + " " + "bar");\n// prints: foo bar',
      instructions: `Print "${w1}" and "${w2}" joined with a single space between them.`,
      js: `// Print "${w1}" and "${w2}" with a space between\n\n`,
      py: `# Print "${w1}" and "${w2}" with a space between\n\n`,
      expected: `${w1} ${w2}`,
      hint: `console.log("${w1}" + " " + "${w2}");`,
      pyHint: `print("${w1}" + " " + "${w2}")`,
    });
  }
  if (tier === 4) {
    const n = int(rng, 1, 20);
    return makeLesson({
      title: "Mixing Text and Numbers",
      tutorial: "Joining a string with + and a number automatically turns the number into text first.",
      example: 'console.log("Score: " + 5);\n// prints: Score: 5',
      instructions: `Print exactly: ${w1}: ${n} (using + to join a string and a number)`,
      js: `// Print: ${w1}: ${n}\n\n`,
      py: `# Print: ${w1}: ${n}  (use str() to join text and a number in Python)\n\n`,
      expected: `${w1}: ${n}`,
      hint: `console.log("${w1}: " + ${n});`,
      pyHint: `print("${w1}: " + str(${n}))`,
    });
  }
  if (tier === 5) {
    return makeLesson({
      title: "String Length",
      tutorial: "Every string has a .length property telling you how many characters it has.",
      example: 'console.log("hello".length);\n// prints: 5',
      instructions: `Print the length of the string "${w1}".`,
      js: `// Print the length of "${w1}"\n\n`,
      py: `# Print the length of "${w1}"\n\n`,
      expected: String(w1.length),
      hint: `console.log("${w1}".length);`,
      pyHint: `print(len("${w1}"))`,
    });
  }
  if (tier === 6) {
    return makeLesson({
      title: "Shouting Case",
      tutorial: "The .toUpperCase() method returns a new, all-uppercase version of a string.",
      example: 'console.log("hi".toUpperCase());\n// prints: HI',
      instructions: `Print "${w1}" converted to uppercase.`,
      js: `// Print "${w1}" in uppercase\n\n`,
      py: `# Print "${w1}" in uppercase\n\n`,
      expected: w1.toUpperCase(),
      hint: `console.log("${w1}".toUpperCase());`,
      pyHint: `print("${w1}".upper())`,
    });
  }
  if (tier === 7) {
    return makeLesson({
      title: `Store ${name} as Text`,
      tutorial: "A variable can hold a string just like it can hold a number.",
      example: 'let msg = "hi";\nconsole.log(msg);\n// prints: hi',
      instructions: `Declare "let ${name} = "${w1}";" and print ${name}.`,
      js: `let ${name} = "${w1}";\n// print ${name}\n\n`,
      py: `${name} = "${w1}"\n# print ${name}\n\n`,
      expected: w1,
      hint: `console.log(${name});`,
      pyHint: `print(${name})`,
    });
  }
  if (tier === 8) {
    return makeLesson({
      title: "First Character",
      tutorial: "You can grab one character from a string with square brackets and its index — the first character is at index 0.",
      example: 'console.log("hello"[0]);\n// prints: h',
      instructions: `Print just the first character of "${w1}".`,
      js: `// Print the first character of "${w1}"\n\n`,
      py: `# Print the first character of "${w1}"\n\n`,
      expected: w1[0],
      hint: `console.log("${w1}"[0]);`,
      pyHint: `print("${w1}"[0])`,
    });
  }
  if (tier === 9) {
    return makeLesson({
      title: "Repeat a String",
      tutorial: "The .repeat(n) method returns the string repeated n times in a row, with nothing between repetitions.",
      example: 'console.log("ab".repeat(3));\n// prints: ababab',
      instructions: `Print "${w1}" repeated 3 times in a row.`,
      js: `// Print "${w1}" repeated 3 times\n\n`,
      py: `# Print "${w1}" repeated 3 times\n\n`,
      expected: w1.repeat(3),
      hint: `console.log("${w1}".repeat(3));`,
      pyHint: `print("${w1}" * 3)`,
    });
  }
  // tier 10
  const n2 = int(rng, 1, 9);
  return makeLesson({
    title: "Build a Sentence",
    tutorial: "Combine everything — join strings, mix in a number, and use a variable — all in one line.",
    example: 'let n = 3;\nconsole.log("Count: " + n + " items");\n// prints: Count: 3 items',
    instructions: `Declare "let ${name} = ${n2};", then print exactly: ${w1} has ${n2} ${w2}`,
    js: `let ${name} = ${n2};\n// print: ${w1} has ${n2} ${w2}\n\n`,
    py: `${name} = ${n2}\n# print: ${w1} has ${n2} ${w2}\n\n`,
    expected: `${w1} has ${n2} ${w2}`,
    hint: `console.log("${w1} has " + ${name} + " ${w2}");`,
    pyHint: `print("${w1} has " + str(${name}) + " ${w2}")`,
  });
}

// ---- Family: Conditionals ---------------------------------------------
function conditionalsTier(tier, variantIndex, familyKey) {
  const rng = rngFor(`${familyKey}:${tier}:${variantIndex}`);
  const name = pick(rng, VAR_NAMES);
  if (tier === 1) {
    const a = int(rng, 1, 20);
    const b = a + int(rng, 1, 10);
    return makeLesson({
      title: "Basic If",
      tutorial: "An if statement runs its block only when the condition in parentheses is true.",
      example: 'if (5 > 3) {\n  console.log("yes");\n}\n// prints: yes',
      instructions: `Declare "let ${name} = ${a};". If ${name} is less than ${b}, print "yes".`,
      js: `let ${name} = ${a};\nif (${name} < ${b}) {\n  // print "yes"\n}\n`,
      py: `${name} = ${a}\nif ${name} < ${b}:\n    # print "yes"\n    pass\n`,
      expected: "yes",
      hint: `if (${name} < ${b}) {\n  console.log("yes");\n}`,
      pyHint: `if ${name} < ${b}:\n    print("yes")`,
    });
  }
  if (tier === 2) {
    const a = int(rng, 1, 20);
    const b = a - int(rng, 1, 10);
    return makeLesson({
      title: "If / Else",
      tutorial: "else runs its block when the if condition was false — exactly one of the two branches always runs.",
      example: 'if (2 > 5) {\n  console.log("a");\n} else {\n  console.log("b");\n}\n// prints: b',
      instructions: `Declare "let ${name} = ${a};". If ${name} is less than ${b}, print "small", else print "big".`,
      js: `let ${name} = ${a};\nif (${name} < ${b}) {\n  // print "small"\n} else {\n  // print "big"\n}\n`,
      py: `${name} = ${a}\nif ${name} < ${b}:\n    pass  # print "small"\nelse:\n    pass  # print "big"\n`,
      expected: a < b ? "small" : "big",
      hint: `if (${name} < ${b}) {\n  console.log("small");\n} else {\n  console.log("big");\n}`,
      pyHint: `if ${name} < ${b}:\n    print("small")\nelse:\n    print("big")`,
    });
  }
  if (tier === 3) {
    const a = int(rng, 1, 30);
    const thresh1 = 10, thresh2 = 20;
    let expected;
    if (a < thresh1) expected = "low";
    else if (a < thresh2) expected = "mid";
    else expected = "high";
    return makeLesson({
      title: "Else If Chain",
      tutorial: "else if lets you check several conditions in order — the first one that's true runs, and the rest are skipped.",
      example: 'let n = 15;\nif (n < 10) {\n  console.log("low");\n} else if (n < 20) {\n  console.log("mid");\n} else {\n  console.log("high");\n}\n// prints: mid',
      instructions: `Declare "let ${name} = ${a};". Print "low" if under ${thresh1}, "mid" if under ${thresh2}, else "high".`,
      js: `let ${name} = ${a};\nif (${name} < ${thresh1}) {\n  // "low"\n} else if (${name} < ${thresh2}) {\n  // "mid"\n} else {\n  // "high"\n}\n`,
      py: `${name} = ${a}\nif ${name} < ${thresh1}:\n    pass  # "low"\nelif ${name} < ${thresh2}:\n    pass  # "mid"\nelse:\n    pass  # "high"\n`,
      expected,
      hint: `if (${name} < ${thresh1}) {\n  console.log("low");\n} else if (${name} < ${thresh2}) {\n  console.log("mid");\n} else {\n  console.log("high");\n}`,
      pyHint: `if ${name} < ${thresh1}:\n    print("low")\nelif ${name} < ${thresh2}:\n    print("mid")\nelse:\n    print("high")`,
    });
  }
  if (tier === 4) {
    const a = int(rng, 1, 20);
    return makeLesson({
      title: "Equality Check",
      tutorial: "=== checks if two values are exactly equal (use === in JS, not a single =, which assigns instead of comparing).",
      example: 'if (4 === 4) {\n  console.log("match");\n}\n// prints: match',
      instructions: `Declare "let ${name} = ${a};". If ${name} equals ${a}, print "match", else print "no match".`,
      js: `let ${name} = ${a};\nif (${name} === ${a}) {\n  // "match"\n} else {\n  // "no match"\n}\n`,
      py: `${name} = ${a}\nif ${name} == ${a}:\n    pass  # "match"\nelse:\n    pass  # "no match"\n`,
      expected: "match",
      hint: `if (${name} === ${a}) {\n  console.log("match");\n} else {\n  console.log("no match");\n}`,
      pyHint: `if ${name} == ${a}:\n    print("match")\nelse:\n    print("no match")`,
    });
  }
  if (tier === 5) {
    const a = int(rng, 1, 50);
    const even = a % 2 === 0;
    return makeLesson({
      title: "Even or Odd",
      tutorial: "% 2 === 0 is the classic way to test if a number is even — the remainder after dividing by 2 is 0.",
      example: 'if (4 % 2 === 0) {\n  console.log("even");\n}\n// prints: even',
      instructions: `Declare "let ${name} = ${a};". Print "even" if it's even, else "odd".`,
      js: `let ${name} = ${a};\nif (${name} % 2 === 0) {\n  // "even"\n} else {\n  // "odd"\n}\n`,
      py: `${name} = ${a}\nif ${name} % 2 == 0:\n    pass  # "even"\nelse:\n    pass  # "odd"\n`,
      expected: even ? "even" : "odd",
      hint: `if (${name} % 2 === 0) {\n  console.log("even");\n} else {\n  console.log("odd");\n}`,
      pyHint: `if ${name} % 2 == 0:\n    print("even")\nelse:\n    print("odd")`,
    });
  }
  if (tier === 6) {
    const a = int(rng, 1, 20);
    const b = int(rng, 1, 20);
    return makeLesson({
      title: "AND (&&)",
      tutorial: "&& (AND) is true only when BOTH sides are true.",
      example: 'if (3 > 0 && 5 > 0) {\n  console.log("both positive");\n}\n// prints: both positive',
      instructions: `Declare "let ${name} = ${a};" and "let other = ${b - 25};". If both ${name} and other are greater than 0, print "both positive", else "not both".`,
      js: `let ${name} = ${a};\nlet other = ${b - 25};\nif (${name} > 0 && other > 0) {\n  // "both positive"\n} else {\n  // "not both"\n}\n`,
      py: `${name} = ${a}\nother = ${b - 25}\nif ${name} > 0 and other > 0:\n    pass  # "both positive"\nelse:\n    pass  # "not both"\n`,
      expected: a > 0 && (b - 25) > 0 ? "both positive" : "not both",
      hint: `if (${name} > 0 && other > 0) {\n  console.log("both positive");\n} else {\n  console.log("not both");\n}`,
      pyHint: `if ${name} > 0 and other > 0:\n    print("both positive")\nelse:\n    print("not both")`,
    });
  }
  if (tier === 7) {
    const a = int(rng, -10, 10);
    return makeLesson({
      title: "OR (||)",
      tutorial: "|| (OR) is true when AT LEAST ONE side is true.",
      example: 'if (0 > 0 || 5 > 0) {\n  console.log("at least one");\n}\n// prints: at least one',
      instructions: `Declare "let ${name} = ${a};". If ${name} is less than 0 OR ${name} is greater than 5, print "outside range", else "in range".`,
      js: `let ${name} = ${a};\nif (${name} < 0 || ${name} > 5) {\n  // "outside range"\n} else {\n  // "in range"\n}\n`,
      py: `${name} = ${a}\nif ${name} < 0 or ${name} > 5:\n    pass  # "outside range"\nelse:\n    pass  # "in range"\n`,
      expected: a < 0 || a > 5 ? "outside range" : "in range",
      hint: `if (${name} < 0 || ${name} > 5) {\n  console.log("outside range");\n} else {\n  console.log("in range");\n}`,
      pyHint: `if ${name} < 0 or ${name} > 5:\n    print("outside range")\nelse:\n    print("in range")`,
    });
  }
  if (tier === 8) {
    const a = int(rng, 1, 100);
    return makeLesson({
      title: "Nested If",
      tutorial: "An if can contain another if inside it — the inner one only even gets checked if the outer condition was true.",
      example: 'let n = 12;\nif (n > 10) {\n  if (n % 2 === 0) {\n    console.log("big even");\n  }\n}\n// prints: big even',
      instructions: `Declare "let ${name} = ${a};". If ${name} is greater than 50 AND even, print "big even". (Use a nested if, not &&.)`,
      js: `let ${name} = ${a};\nif (${name} > 50) {\n  if (${name} % 2 === 0) {\n    // print "big even"\n  }\n}\n`,
      py: `${name} = ${a}\nif ${name} > 50:\n    if ${name} % 2 == 0:\n        pass  # print "big even"\n`,
      expected: a > 50 && a % 2 === 0 ? "big even" : "",
      hint: a > 50 && a % 2 === 0
        ? `console.log("big even");`
        : `// With these values, nothing should print — leave the inner block without a console.log, or make sure it only fires under both conditions.`,
      pyHint: a > 50 && a % 2 === 0 ? `print("big even")` : `# nothing should print here`,
    });
  }
  if (tier === 9) {
    const grade = int(rng, 50, 100);
    let letter;
    if (grade >= 90) letter = "A";
    else if (grade >= 80) letter = "B";
    else if (grade >= 70) letter = "C";
    else letter = "D";
    return makeLesson({
      title: "Grade Calculator",
      tutorial: "A longer else-if chain can model real grading scales — check from the highest threshold down.",
      example: 'let score = 95;\nif (score >= 90) {\n  console.log("A");\n} else {\n  console.log("B");\n}\n// prints: A',
      instructions: `Declare "let ${name} = ${grade};". Print the letter grade: "A" if >= 90, "B" if >= 80, "C" if >= 70, else "D".`,
      js: `let ${name} = ${grade};\nif (${name} >= 90) {\n  // "A"\n} else if (${name} >= 80) {\n  // "B"\n} else if (${name} >= 70) {\n  // "C"\n} else {\n  // "D"\n}\n`,
      py: `${name} = ${grade}\nif ${name} >= 90:\n    pass  # "A"\nelif ${name} >= 80:\n    pass  # "B"\nelif ${name} >= 70:\n    pass  # "C"\nelse:\n    pass  # "D"\n`,
      expected: letter,
      hint: `if (${name} >= 90) {\n  console.log("A");\n} else if (${name} >= 80) {\n  console.log("B");\n} else if (${name} >= 70) {\n  console.log("C");\n} else {\n  console.log("D");\n}`,
      pyHint: `if ${name} >= 90:\n    print("A")\nelif ${name} >= 80:\n    print("B")\nelif ${name} >= 70:\n    print("C")\nelse:\n    print("D")`,
    });
  }
  // tier 10
  const a = int(rng, 1, 20);
  const b = int(rng, 1, 20);
  const c = int(rng, 1, 20);
  const biggest = Math.max(a, b, c);
  return makeLesson({
    title: "Biggest of Three",
    tutorial: "Comparing three values for the biggest needs careful nested or chained conditions — there's more than one correct way to write it.",
    example: 'let a = 3, b = 7, c = 5;\nif (a >= b && a >= c) {\n  console.log("a");\n} else if (b >= c) {\n  console.log("b");\n} else {\n  console.log("c");\n}\n// prints: b',
    instructions: `Declare "let a = ${a};", "let b = ${b};", "let c = ${c};". Print whichever of a, b, c is the largest number (not its variable name — the number itself).`,
    js: `let a = ${a};\nlet b = ${b};\nlet c = ${c};\n// print the largest of a, b, c\n\n`,
    py: `a = ${a}\nb = ${b}\nc = ${c}\n# print the largest of a, b, c\n\n`,
    expected: String(biggest),
    hint: `console.log(Math.max(a, b, c));`,
    pyHint: `print(max(a, b, c))`,
  });
}

// ---- Family: Loops ---------------------------------------------
function loopsTier(tier, variantIndex, familyKey) {
  const rng = rngFor(`${familyKey}:${tier}:${variantIndex}`);
  const name = pick(rng, VAR_NAMES.filter((n) => n.length <= 2 || n === "count"));
  if (tier === 1) {
    const n = int(rng, 3, 6);
    const lines = Array.from({ length: n }, (_, i) => String(i));
    return makeLesson({
      title: `Count 0 to ${n - 1}`,
      tutorial: "A for loop repeats code a set number of times: for (let i = 0; i < N; i++) runs once for each value of i from 0 up to N-1.",
      example: "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}\n// 0\n// 1\n// 2",
      instructions: `Print every number from 0 up to and including ${n - 1}, one per line, using a for loop.`,
      js: `// Print 0 through ${n - 1}, one per line\nfor (let i = 0; i < ${n}; i++) {\n  \n}\n`,
      py: `# Print 0 through ${n - 1}, one per line\nfor i in range(${n}):\n    pass\n`,
      expected: lines.join("\n"),
      hint: `for (let i = 0; i < ${n}; i++) {\n  console.log(i);\n}`,
      pyHint: `for i in range(${n}):\n    print(i)`,
    });
  }
  if (tier === 2) {
    const start = int(rng, 2, 5);
    const n = int(rng, 3, 6);
    const lines = Array.from({ length: n }, (_, i) => String(start + i));
    return makeLesson({
      title: `Count From ${start}`,
      tutorial: "A loop doesn't have to start at 0 — set i's starting value to whatever you need.",
      example: "for (let i = 5; i < 8; i++) {\n  console.log(i);\n}\n// 5\n// 6\n// 7",
      instructions: `Print every number from ${start} up to and including ${start + n - 1}, one per line.`,
      js: `// Print ${start} through ${start + n - 1}\nfor (let i = ${start}; i < ${start + n}; i++) {\n  \n}\n`,
      py: `# Print ${start} through ${start + n - 1}\nfor i in range(${start}, ${start + n}):\n    pass\n`,
      expected: lines.join("\n"),
      hint: `for (let i = ${start}; i < ${start + n}; i++) {\n  console.log(i);\n}`,
      pyHint: `for i in range(${start}, ${start + n}):\n    print(i)`,
    });
  }
  if (tier === 3) {
    const n = int(rng, 3, 6);
    const lines = Array.from({ length: n }, (_, i) => String((i + 1) * 2));
    return makeLesson({
      title: "Count by Twos",
      tutorial: "The i++ part of a for loop can be any update — i += 2 steps by two each time instead of one.",
      example: "for (let i = 2; i <= 6; i += 2) {\n  console.log(i);\n}\n// 2\n// 4\n// 6",
      instructions: `Print the first ${n} positive even numbers (2, 4, 6, ...), one per line.`,
      js: `// Print the first ${n} even numbers\nfor (let i = 2; i <= ${n * 2}; i += 2) {\n  \n}\n`,
      py: `# Print the first ${n} even numbers\nfor i in range(2, ${n * 2 + 1}, 2):\n    pass\n`,
      expected: lines.join("\n"),
      hint: `for (let i = 2; i <= ${n * 2}; i += 2) {\n  console.log(i);\n}`,
      pyHint: `for i in range(2, ${n * 2 + 1}, 2):\n    print(i)`,
    });
  }
  if (tier === 4) {
    const n = int(rng, 3, 6);
    const lines = Array.from({ length: n }, (_, i) => String(n - i));
    return makeLesson({
      title: "Count Backwards",
      tutorial: "A loop can count down too — start high, use i-- to decrease, and keep going while i is still above the stopping point.",
      example: "for (let i = 3; i > 0; i--) {\n  console.log(i);\n}\n// 3\n// 2\n// 1",
      instructions: `Print from ${n} down to 1, one per line.`,
      js: `// Print from ${n} down to 1\nfor (let i = ${n}; i > 0; i--) {\n  \n}\n`,
      py: `# Print from ${n} down to 1\nfor i in range(${n}, 0, -1):\n    pass\n`,
      expected: lines.join("\n"),
      hint: `for (let i = ${n}; i > 0; i--) {\n  console.log(i);\n}`,
      pyHint: `for i in range(${n}, 0, -1):\n    print(i)`,
    });
  }
  if (tier === 5) {
    const n = int(rng, 4, 8);
    let total = 0;
    for (let i = 1; i <= n; i++) total += i;
    return makeLesson({
      title: "Sum With a Loop",
      tutorial: `A variable declared before a loop can be updated inside it on every pass — this is how you build up a running total.`,
      example: "let sum = 0;\nfor (let i = 1; i <= 3; i++) {\n  sum = sum + i;\n}\nconsole.log(sum);\n// prints: 6",
      instructions: `Declare "let ${name} = 0;", then add every number from 1 to ${n} to it in a loop, then print ${name}.`,
      js: `let ${name} = 0;\nfor (let i = 1; i <= ${n}; i++) {\n  // add i to ${name}\n}\n// print ${name}\n`,
      py: `${name} = 0\nfor i in range(1, ${n + 1}):\n    pass  # add i to ${name}\n# print ${name}\n`,
      expected: String(total),
      hint: `for (let i = 1; i <= ${n}; i++) {\n  ${name} = ${name} + i;\n}\nconsole.log(${name});`,
      pyHint: `for i in range(1, ${n + 1}):\n    ${name} = ${name} + i\nprint(${name})`,
    });
  }
  if (tier === 6) {
    const n = int(rng, 5, 10);
    const skip = int(rng, 2, 4);
    const lines = [];
    for (let i = 1; i <= n; i++) if (i % skip !== 0) lines.push(String(i));
    return makeLesson({
      title: "Skip With Continue",
      tutorial: "continue immediately jumps to the next loop iteration, skipping whatever code comes after it in that pass.",
      example: "for (let i = 1; i <= 4; i++) {\n  if (i === 2) continue;\n  console.log(i);\n}\n// 1\n// 3\n// 4",
      instructions: `Print every number from 1 to ${n}, one per line, except multiples of ${skip} (skip those).`,
      js: `// Print 1 to ${n}, skipping multiples of ${skip}\nfor (let i = 1; i <= ${n}; i++) {\n  if (i % ${skip} === 0) continue;\n  \n}\n`,
      py: `# Print 1 to ${n}, skipping multiples of ${skip}\nfor i in range(1, ${n + 1}):\n    if i % ${skip} == 0:\n        continue\n    pass\n`,
      expected: lines.join("\n"),
      hint: `for (let i = 1; i <= ${n}; i++) {\n  if (i % ${skip} === 0) continue;\n  console.log(i);\n}`,
      pyHint: `for i in range(1, ${n + 1}):\n    if i % ${skip} == 0:\n        continue\n    print(i)`,
    });
  }
  if (tier === 7) {
    const n = int(rng, 6, 12);
    const stop = int(rng, 3, 5);
    const lines = [];
    for (let i = 1; i <= n; i++) {
      if (i === stop) break;
      lines.push(String(i));
    }
    return makeLesson({
      title: "Stop Early With Break",
      tutorial: "break exits the loop entirely the moment it runs — nothing after it in the loop runs again, even if more iterations were left.",
      example: "for (let i = 1; i <= 5; i++) {\n  if (i === 3) break;\n  console.log(i);\n}\n// 1\n// 2",
      instructions: `Print numbers starting at 1, stopping (not printing) as soon as you reach ${stop} — the loop goes up to ${n} but should break before then.`,
      js: `// Print 1, 2, ... stopping before ${stop}\nfor (let i = 1; i <= ${n}; i++) {\n  if (i === ${stop}) break;\n  \n}\n`,
      py: `# Print 1, 2, ... stopping before ${stop}\nfor i in range(1, ${n + 1}):\n    if i == ${stop}:\n        break\n    pass\n`,
      expected: lines.join("\n"),
      hint: `for (let i = 1; i <= ${n}; i++) {\n  if (i === ${stop}) break;\n  console.log(i);\n}`,
      pyHint: `for i in range(1, ${n + 1}):\n    if i == ${stop}:\n        break\n    print(i)`,
    });
  }
  if (tier === 8) {
    const rows = int(rng, 3, 5);
    const lines = [];
    for (let r = 1; r <= rows; r++) lines.push("*".repeat(r));
    return makeLesson({
      title: "Nested Loop Pattern",
      tutorial: "A loop inside another loop (nested) runs the inner loop completely for every single pass of the outer one — classic for building shapes out of text.",
      example: "for (let r = 1; r <= 2; r++) {\n  console.log(\"*\".repeat(r));\n}\n// *\n// **",
      instructions: `Print a triangle of ${rows} rows: row 1 has 1 star, row 2 has 2 stars, ... row ${rows} has ${rows} stars (use .repeat()).`,
      js: `// Print a ${rows}-row star triangle\nfor (let r = 1; r <= ${rows}; r++) {\n  \n}\n`,
      py: `# Print a ${rows}-row star triangle\nfor r in range(1, ${rows + 1}):\n    pass\n`,
      expected: lines.join("\n"),
      hint: `for (let r = 1; r <= ${rows}; r++) {\n  console.log("*".repeat(r));\n}`,
      pyHint: `for r in range(1, ${rows + 1}):\n    print("*" * r)`,
    });
  }
  if (tier === 9) {
    const n = int(rng, 4, 7);
    let product = 1;
    for (let i = 1; i <= n; i++) product *= i;
    return makeLesson({
      title: "Factorial",
      tutorial: "A loop can multiply a running total together, just like it can add — this is how you compute a factorial (n! = 1 x 2 x ... x n).",
      example: "let p = 1;\nfor (let i = 1; i <= 3; i++) {\n  p = p * i;\n}\nconsole.log(p);\n// prints: 6 (1*2*3)",
      instructions: `Declare "let ${name} = 1;", then multiply it by every number from 1 to ${n} in a loop, then print ${name} (that's ${n}!).`,
      js: `let ${name} = 1;\nfor (let i = 1; i <= ${n}; i++) {\n  // multiply ${name} by i\n}\n// print ${name}\n`,
      py: `${name} = 1\nfor i in range(1, ${n + 1}):\n    pass  # multiply ${name} by i\n# print ${name}\n`,
      expected: String(product),
      hint: `for (let i = 1; i <= ${n}; i++) {\n  ${name} = ${name} * i;\n}\nconsole.log(${name});`,
      pyHint: `for i in range(1, ${n + 1}):\n    ${name} = ${name} * i\nprint(${name})`,
    });
  }
  // tier 10: while loop + accumulator + early stop condition.
  const target = int(rng, 20, 60);
  let count = 0, sum = 0;
  while (sum < target) {
    count++;
    sum += count;
  }
  return makeLesson({
    title: "While Loop Until a Target",
    tutorial: "A while loop runs as long as its condition stays true — useful when you don't know in advance exactly how many times you'll need to loop.",
    example: "let n = 0, sum = 0;\nwhile (sum < 5) {\n  n++;\n  sum += n;\n}\nconsole.log(n);\n// prints: 3 (1+2+3=6, first time sum reaches/passes 5)",
    instructions: `Declare "let ${name} = 0;" and "let sum = 0;". Using a while loop, keep incrementing ${name} and adding it to sum until sum is ${target} or more. Print ${name} (how many steps it took).`,
    js: `let ${name} = 0;\nlet sum = 0;\nwhile (sum < ${target}) {\n  ${name}++;\n  sum += ${name};\n}\n// print ${name}\n`,
    py: `${name} = 0\nsum = 0\nwhile sum < ${target}:\n    ${name} += 1\n    sum += ${name}\n# print ${name}\n`,
    expected: String(count),
    hint: `console.log(${name});`,
    pyHint: `print(${name})`,
  });
}

// ---- Family: Arrays ---------------------------------------------
function arraysTier(tier, variantIndex, familyKey) {
  const rng = rngFor(`${familyKey}:${tier}:${variantIndex}`);
  // "count" is excluded here — tier 8's template below declares its own
  // fixed local `count` variable for the running tally, and picking
  // "count" as the array's own name too would collide with it
  // ("let count = [...]; let count = 0;" — a real duplicate declaration).
  const name = pick(rng, VAR_NAMES.filter((n) => n.length <= 6 && n !== "count"));
  if (tier === 1) {
    const items = Array.from({ length: 4 }, () => int(rng, 1, 50));
    return makeLesson({
      title: "Print an Array",
      tutorial: "Square brackets with comma-separated values create an array — console.log() prints the whole thing.",
      example: "console.log([1, 2, 3]);\n// prints: 1,2,3",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and print it.`,
      js: `let ${name} = [${items.join(", ")}];\n// print ${name}\n\n`,
      py: `${name} = [${items.join(", ")}]\n# print ${name}\n\n`,
      expected: items.join(","),
      hint: `console.log(${name});`,
      pyHint: `print(${name})`,
    });
  }
  if (tier === 2) {
    const items = Array.from({ length: 5 }, () => int(rng, 1, 50));
    const idx = int(rng, 0, 4);
    return makeLesson({
      title: "Indexing",
      tutorial: "Access one item in an array with square brackets and its index — the first item is at index 0.",
      example: "let arr = [10, 20, 30];\nconsole.log(arr[1]);\n// prints: 20",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and print just the item at index ${idx}.`,
      js: `let ${name} = [${items.join(", ")}];\n// print ${name}[${idx}]\n\n`,
      py: `${name} = [${items.join(", ")}]\n# print ${name}[${idx}]\n\n`,
      expected: String(items[idx]),
      hint: `console.log(${name}[${idx}]);`,
      pyHint: `print(${name}[${idx}])`,
    });
  }
  if (tier === 3) {
    const items = Array.from({ length: 4 }, () => int(rng, 1, 30));
    return makeLesson({
      title: "Array Length",
      tutorial: "Every array has a .length property, same idea as a string's — it's how many items are in it.",
      example: "console.log([1, 2, 3].length);\n// prints: 3",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and print its length.`,
      js: `let ${name} = [${items.join(", ")}];\n// print the length of ${name}\n\n`,
      py: `${name} = [${items.join(", ")}]\n# print the length of ${name}\n\n`,
      expected: String(items.length),
      hint: `console.log(${name}.length);`,
      pyHint: `print(len(${name}))`,
    });
  }
  if (tier === 4) {
    const items = Array.from({ length: 3 }, () => int(rng, 1, 30));
    const add = int(rng, 1, 30);
    const final = [...items, add];
    return makeLesson({
      title: "Push an Item",
      tutorial: ".push() adds a new item to the end of an array, changing it in place.",
      example: "let arr = [1, 2];\narr.push(3);\nconsole.log(arr);\n// prints: 1,2,3",
      instructions: `Declare "let ${name} = [${items.join(", ")}];", push ${add} onto it, then print ${name}.`,
      js: `let ${name} = [${items.join(", ")}];\n// push ${add}, then print ${name}\n\n`,
      py: `${name} = [${items.join(", ")}]\n# append ${add}, then print ${name}\n\n`,
      expected: final.join(","),
      hint: `${name}.push(${add});\nconsole.log(${name});`,
      pyHint: `${name}.append(${add})\nprint(${name})`,
    });
  }
  if (tier === 5) {
    const items = Array.from({ length: 4 }, () => int(rng, 1, 20));
    return makeLesson({
      title: "Loop Over an Array",
      tutorial: "Combine a for loop with array indexing to visit every item: for (let i = 0; i < arr.length; i++) { arr[i] }.",
      example: "let arr = [5, 6];\nfor (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}\n// 5\n// 6",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and print every item, one per line, using a loop.`,
      js: `let ${name} = [${items.join(", ")}];\nfor (let i = 0; i < ${name}.length; i++) {\n  \n}\n`,
      py: `${name} = [${items.join(", ")}]\nfor i in range(len(${name})):\n    pass\n`,
      expected: items.join("\n"),
      hint: `for (let i = 0; i < ${name}.length; i++) {\n  console.log(${name}[i]);\n}`,
      pyHint: `for i in range(len(${name})):\n    print(${name}[i])`,
    });
  }
  if (tier === 6) {
    const items = Array.from({ length: 5 }, () => int(rng, 1, 30));
    const total = items.reduce((a, b) => a + b, 0);
    return makeLesson({
      title: "Sum an Array",
      tutorial: "Loop over an array while adding each item to a running total declared before the loop starts.",
      example: "let arr = [1, 2, 3];\nlet sum = 0;\nfor (let i = 0; i < arr.length; i++) {\n  sum += arr[i];\n}\nconsole.log(sum);\n// prints: 6",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and "let sum = 0;", add up every item, then print sum.`,
      js: `let ${name} = [${items.join(", ")}];\nlet sum = 0;\nfor (let i = 0; i < ${name}.length; i++) {\n  // add ${name}[i] to sum\n}\n// print sum\n`,
      py: `${name} = [${items.join(", ")}]\nsum_total = 0\nfor i in range(len(${name})):\n    pass  # add ${name}[i] to sum_total\n# print sum_total\n`,
      expected: String(total),
      hint: `for (let i = 0; i < ${name}.length; i++) {\n  sum += ${name}[i];\n}\nconsole.log(sum);`,
      pyHint: `for i in range(len(${name})):\n    sum_total += ${name}[i]\nprint(sum_total)`,
    });
  }
  if (tier === 7) {
    const items = Array.from({ length: 5 }, () => int(rng, -10, 20));
    const max = Math.max(...items);
    return makeLesson({
      title: "Find the Largest",
      tutorial: "To find the biggest item without a built-in, track the biggest seen so far in a variable, updating it whenever a bigger item turns up.",
      example: "let arr = [3, 9, 2];\nlet best = arr[0];\nfor (let i = 1; i < arr.length; i++) {\n  if (arr[i] > best) best = arr[i];\n}\nconsole.log(best);\n// prints: 9",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and print the largest value in it (don't use Math.max — loop and compare).`,
      js: `let ${name} = [${items.join(", ")}];\nlet best = ${name}[0];\nfor (let i = 1; i < ${name}.length; i++) {\n  // update best if ${name}[i] is bigger\n}\n// print best\n`,
      py: `${name} = [${items.join(", ")}]\nbest = ${name}[0]\nfor i in range(1, len(${name})):\n    pass  # update best if ${name}[i] is bigger\n# print best\n`,
      expected: String(max),
      hint: `for (let i = 1; i < ${name}.length; i++) {\n  if (${name}[i] > best) best = ${name}[i];\n}\nconsole.log(best);`,
      pyHint: `for i in range(1, len(${name})):\n    if ${name}[i] > best:\n        best = ${name}[i]\nprint(best)`,
    });
  }
  if (tier === 8) {
    const items = Array.from({ length: 6 }, () => int(rng, 1, 40));
    const evens = items.filter((n) => n % 2 === 0);
    return makeLesson({
      title: "Count a Condition",
      tutorial: "Loop over an array, checking a condition on each item, and increment a counter variable whenever it's true.",
      example: "let arr = [1, 2, 3, 4];\nlet count = 0;\nfor (let i = 0; i < arr.length; i++) {\n  if (arr[i] % 2 === 0) count++;\n}\nconsole.log(count);\n// prints: 2",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and "let count = 0;". Count how many items are even, then print count.`,
      js: `let ${name} = [${items.join(", ")}];\nlet count = 0;\nfor (let i = 0; i < ${name}.length; i++) {\n  // if ${name}[i] is even, count++\n}\n// print count\n`,
      py: `${name} = [${items.join(", ")}]\ncount = 0\nfor i in range(len(${name})):\n    pass  # if ${name}[i] is even, count += 1\n# print count\n`,
      expected: String(evens.length),
      hint: `for (let i = 0; i < ${name}.length; i++) {\n  if (${name}[i] % 2 === 0) count++;\n}\nconsole.log(count);`,
      pyHint: `for i in range(len(${name})):\n    if ${name}[i] % 2 == 0:\n        count += 1\nprint(count)`,
    });
  }
  if (tier === 9) {
    const items = Array.from({ length: 5 }, () => int(rng, 1, 20));
    const doubled = items.map((n) => n * 2);
    return makeLesson({
      title: "Build a New Array",
      tutorial: "Instead of modifying the original, build a brand new array with push() inside a loop — a common, safer pattern.",
      example: "let arr = [1, 2];\nlet out = [];\nfor (let i = 0; i < arr.length; i++) {\n  out.push(arr[i] * 2);\n}\nconsole.log(out);\n// prints: 2,4",
      instructions: `Declare "let ${name} = [${items.join(", ")}];" and "let doubled = [];". Fill doubled with every item of ${name} multiplied by 2, then print doubled.`,
      js: `let ${name} = [${items.join(", ")}];\nlet doubled = [];\nfor (let i = 0; i < ${name}.length; i++) {\n  // push ${name}[i] * 2 onto doubled\n}\n// print doubled\n`,
      py: `${name} = [${items.join(", ")}]\ndoubled = []\nfor i in range(len(${name})):\n    pass  # append ${name}[i] * 2 to doubled\n# print doubled\n`,
      expected: doubled.join(","),
      hint: `for (let i = 0; i < ${name}.length; i++) {\n  doubled.push(${name}[i] * 2);\n}\nconsole.log(doubled);`,
      pyHint: `for i in range(len(${name})):\n    doubled.append(${name}[i] * 2)\nprint(doubled)`,
    });
  }
  // tier 10: two arrays combined.
  const a = Array.from({ length: 4 }, () => int(rng, 1, 15));
  const b = Array.from({ length: 4 }, () => int(rng, 1, 15));
  const sums = a.map((v, i) => v + b[i]);
  return makeLesson({
    title: "Combine Two Arrays",
    tutorial: "When two arrays are the same length, you can loop once using a single index to work with the matching item from each.",
    example: "let a = [1, 2], b = [10, 20];\nlet out = [];\nfor (let i = 0; i < a.length; i++) {\n  out.push(a[i] + b[i]);\n}\nconsole.log(out);\n// prints: 11,22",
    instructions: `Declare "let a = [${a.join(", ")}];", "let b = [${b.join(", ")}];" and "let out = [];". Fill out with a[i] + b[i] for each matching pair, then print out.`,
    js: `let a = [${a.join(", ")}];\nlet b = [${b.join(", ")}];\nlet out = [];\nfor (let i = 0; i < a.length; i++) {\n  // push a[i] + b[i] onto out\n}\n// print out\n`,
    py: `a = [${a.join(", ")}]\nb = [${b.join(", ")}]\nout = []\nfor i in range(len(a)):\n    pass  # append a[i] + b[i] to out\n# print out\n`,
    expected: sums.join(","),
    hint: `for (let i = 0; i < a.length; i++) {\n  out.push(a[i] + b[i]);\n}\nconsole.log(out);`,
    pyHint: `for i in range(len(a)):\n    out.append(a[i] + b[i])\nprint(out)`,
  });
}

// ---- Family registry ---------------------------------------------
// Each family: a stable key (used in level ids — never rename once
// published, or saved progress for these levels breaks), a display name,
// icon/colors for the world, and the tier-generating function.
export const PRACTICE_FAMILIES = [
  { key: "arithmetic", name: "Arithmetic Drills", icon: "➕", from: "#4ade80", to: "#15803d", generate: arithmeticTier },
  { key: "strings", name: "String Drills", icon: "🔤", from: "#38bdf8", to: "#0369a1", generate: stringsTier },
  { key: "conditionals", name: "Conditional Drills", icon: "🔀", from: "#fb923c", to: "#c2410c", generate: conditionalsTier },
  { key: "loops", name: "Loop Drills", icon: "🔁", from: "#c084fc", to: "#7c3aed", generate: loopsTier },
  { key: "arrays", name: "Array Drills", icon: "📦", from: "#f472b6", to: "#be185d", generate: arraysTier },
];

// `variantsPerTier` controls real content volume — bump this (or add more
// families above) to generate more lessons; the shape of each tier stays
// the same, only how many data-varied repeats of it get built.
export function buildPracticeWorldDefs(variantsPerTier = 10) {
  const defs = [];
  for (const family of PRACTICE_FAMILIES) {
    for (let tier = 1; tier <= 10; tier++) {
      const levels = [];
      for (let v = 0; v < variantsPerTier; v++) {
        levels.push(family.generate(tier, v, `${family.key}`));
      }
      defs.push({
        name: `${family.name} ${tier}`,
        icon: family.icon,
        from: family.from,
        to: family.to,
        characters: ["🧠", "💪", "🔥", "⭐"],
        levels,
        // Stable id fragment for this world, independent of array order —
        // levels.js uses the numeric world id for routing, but this stays
        // here as a debugging/traceability aid.
        _practiceKey: `${family.key}-tier${tier}`,
      });
    }
  }
  return defs;
}

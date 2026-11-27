// Short, choreographed intro sequences for a handful of foundational
// topics — played once (first time only, tracked in localStorage) before
// a learner starts that world. Substitutes for the "30s 3D animation"
// ask: no 3D engine exists in this project and building one (plus
// producing genuinely good 3D teaching content) is a project of its own,
// not a feature — see AUTONOMOUS_LOG.md. This reuses the already-built,
// free, original Byteborn 20-state sprite system instead: a sequence of
// {state, caption} beats, each held for `beatMs`, auto-advancing (or
// skippable), using the player's own selected character as the teacher.
//
// Keyed by world `name` (must match a world's `name` in levels.js
// exactly) — only foundational topics have one; most worlds have none
// and just skip straight to the lesson, same as before.
export const BEAT_MS = 2600;

// Beats with `code` show a real example in the player's own language
// (javascript / python / c / cpp / java); see introForLanguage below.
// `topic` may also be per-language.
export const TOPIC_INTROS = {
  "Say Hello": {
    topic: {
      javascript: "console.log()",
      python: "print()",
      c: "printf()",
      cpp: "std::cout",
      java: "System.out.println()",
    },
    beats: [
      { state: "greet", caption: "Hey! I'm here to teach you something new." },
      { state: "thinking", caption: "Every program needs a way to talk to you." },
      {
        state: "surprised",
        code: {
          javascript: 'Like this: console.log("Hello!")',
          python: 'Like this: print("Hello!")',
          c: 'Like this: printf("Hello!\\n");',
          cpp: 'Like this: std::cout << "Hello!";',
          java: 'Like this: System.out.println("Hello!");',
        },
      },
      { state: "correct", caption: "It prints whatever's inside, right to the screen." },
      { state: "cheer", caption: "That's it — your first command!" },
    ],
  },
  Variables: {
    topic: "Variables",
    beats: [
      { state: "idle", caption: "Programs need to remember things — scores, names, numbers." },
      { state: "thinking", caption: "A variable is a labeled box that holds a value." },
      {
        state: "surprised",
        code: {
          javascript: 'let age = 10; — now "age" remembers 10.',
          python: 'age = 10 — now "age" remembers 10.',
          c: 'int age = 10; — now "age" remembers 10.',
          cpp: 'int age = 10; — now "age" remembers 10.',
          java: 'int age = 10; — now "age" remembers 10.',
        },
      },
      { state: "determined", caption: "You can even change what's inside later." },
      { state: "cheer", caption: "Variables are how code remembers anything." },
    ],
  },
  Conditionals: {
    topic: "if / else",
    beats: [
      { state: "idle", caption: "Sometimes your code needs to make a choice." },
      { state: "thinking", caption: "if this is true, do one thing…" },
      { state: "confused", caption: "…else, do something different." },
      {
        state: "surprised",
        code: {
          javascript: "if (age >= 18) { … } else { … }",
          python: "if age >= 18:\n    …\nelse:\n    …",
          c: "if (age >= 18) { … } else { … }",
          cpp: "if (age >= 18) { … } else { … }",
          java: "if (age >= 18) { … } else { … }",
        },
      },
      { state: "cheer", caption: "Now your code can think for itself." },
    ],
  },
  "Loops: for": {
    topic: "for loops",
    beats: [
      { state: "idle", caption: "Typing the same line 100 times? No thanks." },
      { state: "thinking", caption: "A loop repeats code for you, automatically." },
      {
        state: "hype",
        code: {
          javascript: "for (let i = 0; i < 10; i++) { … }",
          python: "for i in range(10):\n    …",
          c: "for (int i = 0; i < 10; i++) { … }",
          cpp: "for (int i = 0; i < 10; i++) { … }",
          java: "for (int i = 0; i < 10; i++) { … }",
        },
      },
      { state: "laughing", caption: "Ten lines of work, one line of code." },
      { state: "cheer", caption: "Loops are how programmers stay (productively) lazy." },
    ],
  },
  Arrays: {
    topic: { javascript: "Arrays", python: "Lists", c: "Arrays", cpp: "Arrays", java: "Arrays" },
    beats: [
      { state: "idle", caption: "What if you need a whole LIST of things?" },
      {
        state: "thinking",
        code: {
          javascript: "An array holds many values together, in order.",
          python: "A list holds many values together, in order.",
          c: "An array holds many values together, in order.",
          cpp: "An array holds many values together, in order.",
          java: "An array holds many values together, in order.",
        },
      },
      {
        state: "surprised",
        code: {
          javascript: 'let fruits = ["apple", "banana", "cherry"];',
          python: 'fruits = ["apple", "banana", "cherry"]',
          c: 'const char *fruits[] = {"apple", "banana", "cherry"};',
          cpp: 'std::string fruits[] = {"apple", "banana", "cherry"};',
          java: 'String[] fruits = {"apple", "banana", "cherry"};',
        },
      },
      { state: "determined", caption: "Grab any item by its position: fruits[0]" },
      {
        state: "cheer",
        code: {
          javascript: "Arrays are your code's way of making a list.",
          python: "Lists are your code's way of keeping things together.",
          c: "Arrays are your code's way of making a list.",
          cpp: "Arrays are your code's way of making a list.",
          java: "Arrays are your code's way of making a list.",
        },
      },
    ],
  },
  Functions: {
    topic: "Functions",
    beats: [
      { state: "idle", caption: "Got a chunk of code you'll need again and again?" },
      { state: "thinking", caption: "Wrap it in a function and give it a name." },
      {
        state: "surprised",
        code: {
          javascript: 'function greet() {\n  console.log("Hi!");\n}',
          python: 'def greet():\n    print("Hi!")',
          c: 'void greet() {\n  printf("Hi!\\n");\n}',
          cpp: 'void greet() {\n  std::cout << "Hi!";\n}',
          java: 'static void greet() {\n  System.out.println("Hi!");\n}',
        },
      },
      { state: "determined", caption: "Now just call greet() whenever you need it." },
      { state: "cheer", caption: "Functions are how you stop repeating yourself." },
    ],
  },
};

// Resolves an intro for one language: picks that language's topic name
// and example code, falling back to JavaScript for anything unknown.
export function introForLanguage(intro, language) {
  const pick = (v) => (v && typeof v === "object" ? v[language] ?? v.javascript : v);
  return {
    topic: pick(intro.topic),
    beats: intro.beats.map((b) => ({ state: b.state, caption: b.caption ?? pick(b.code) })),
  };
}

const SEEN_KEY = "codequest-seen-intros";

export function hasSeenIntro(worldName) {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return seen.includes(worldName);
  } catch {
    return false;
  }
}

export function markIntroSeen(worldName) {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    if (!seen.includes(worldName)) {
      seen.push(worldName);
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    }
  } catch {
    // Private browsing or storage full — the intro just plays again next
    // time, which is a harmless redundancy, not a broken feature.
  }
}

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

export const TOPIC_INTROS = {
  "Say Hello": {
    topic: "console.log() / print()",
    beats: [
      { state: "greet", caption: "Hey! I'm here to teach you something new." },
      { state: "thinking", caption: "Every program needs a way to talk to you." },
      { state: "surprised", caption: 'Like this: console.log("Hello!")' },
      { state: "correct", caption: "It prints whatever's inside, right to the screen." },
      { state: "cheer", caption: "That's it — your first command!" },
    ],
  },
  Variables: {
    topic: "Variables",
    beats: [
      { state: "idle", caption: "Programs need to remember things — scores, names, numbers." },
      { state: "thinking", caption: "A variable is a labeled box that holds a value." },
      { state: "surprised", caption: "let age = 10; — now \"age\" remembers 10." },
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
      { state: "surprised", caption: "if (age >= 18) { … } else { … }" },
      { state: "cheer", caption: "Now your code can think for itself." },
    ],
  },
  "Loops: for": {
    topic: "for loops",
    beats: [
      { state: "idle", caption: "Typing the same line 100 times? No thanks." },
      { state: "thinking", caption: "A loop repeats code for you, automatically." },
      { state: "hype", caption: "for (let i = 0; i < 10; i++) { … }" },
      { state: "laughing", caption: "Ten lines of work, one line of code." },
      { state: "cheer", caption: "Loops are how programmers stay (productively) lazy." },
    ],
  },
  Arrays: {
    topic: "Arrays",
    beats: [
      { state: "idle", caption: "What if you need a whole LIST of things?" },
      { state: "thinking", caption: "An array holds many values together, in order." },
      { state: "surprised", caption: 'let fruits = ["apple", "banana", "cherry"];' },
      { state: "determined", caption: "Grab any item by its position: fruits[0]" },
      { state: "cheer", caption: "Arrays are your code's way of making a list." },
    ],
  },
  Functions: {
    topic: "Functions",
    beats: [
      { state: "idle", caption: "Got a chunk of code you'll need again and again?" },
      { state: "thinking", caption: "Wrap it in a function and give it a name." },
      { state: "surprised", caption: 'function greet() {\n  console.log("Hi!");\n}' },
      { state: "determined", caption: "Now just call greet() whenever you need it." },
      { state: "cheer", caption: "Functions are how you stop repeating yourself." },
    ],
  },
};

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

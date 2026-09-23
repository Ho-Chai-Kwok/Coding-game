// A short "what do these words even mean" walkthrough inserted into the
// onboarding wizard — but ONLY for someone who says they're a total
// beginner (see Onboarding.jsx, which only includes these steps when
// level === "beginner"). Someone with "some experience" or who's
// "confident" already knows this; showing it to them would be
// condescending and just add friction before they get to code.
//
// Two step shapes:
//   "explain" — a plain-language concept card (icon, title, body, and an
//     optional `example` of real-looking code/syntax, plus an optional
//     `hasList` flag for the one step that lists out several types at
//     once instead of a single paragraph). Most also carry a `keyword` —
//     the single term this card wants remembered, rendered as a
//     highlighted callout under the body text so the one thing to take
//     away is never just buried in a paragraph. It's the literal
//     technical term (e.g. "function"), not translated, for the same
//     reason string/char/number/boolean in the types list aren't either
//     — it's what you'd actually type/say, in any language. The "types"
//     step has no keyword of its own since its list already highlights
//     four terms individually; a fifth badge would just be noise.
//   "quiz" — a single quick comprehension check, reusing the exact same
//     visual language as the main curriculum's QuizChallenge (retry on a
//     wrong answer, confetti + explanation on the right one) so it
//     already feels familiar by the time real lessons start.
//
// All copy lives in i18n under `primer.<id>Title` / `primer.<id>Body` /
// `primer.<id>Question` / `primer.<id>Options` / `primer.<id>Explanation`
// — see translations.js. `example` is real code syntax, not prose, so
// it's deliberately NOT translated (same reasoning as every code example
// elsewhere in the app).
export const PRIMER_STEPS = [
  {
    id: "code",
    type: "explain",
    icon: "📜",
    keyword: "code",
  },
  {
    id: "function",
    type: "explain",
    icon: "🛠️",
    example: 'function sayHi() {\n  print("Hi!")\n}',
    keyword: "function",
  },
  {
    id: "functionCheck",
    type: "quiz",
    icon: "🛠️",
    correctIndex: 0,
  },
  {
    id: "parens",
    type: "explain",
    icon: "🔘",
    example: "sayHi()   👉 actually runs it\nsayHi     👉 just mentions it, doesn't run it",
    keyword: "( )",
  },
  {
    id: "arguments",
    type: "explain",
    icon: "🧺",
    example: 'greet("Mia")\n// "Mia" is the argument',
    keyword: "argument",
  },
  {
    id: "argumentsCheck",
    type: "quiz",
    icon: "🧺",
    correctIndex: 0,
  },
  {
    id: "argv",
    type: "explain",
    icon: "🎁",
    keyword: "argc / argv",
  },
  {
    id: "variables",
    type: "explain",
    icon: "📦",
    example: 'score = 10\nname = "Mia"',
    keyword: "variable",
  },
  {
    id: "types",
    type: "explain",
    icon: "🏷️",
    hasList: true,
  },
  {
    id: "typesCheck",
    type: "quiz",
    icon: "🏷️",
    correctIndex: 0,
  },
];

export function getPrimerStepIds() {
  return PRIMER_STEPS.map((s) => s.id);
}

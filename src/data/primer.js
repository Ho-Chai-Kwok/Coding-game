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
// Trimmed to 4 concepts + 1 comprehension check (QA_REPORT.md CQ-12 — was
// 10 steps including "arguments"/"types" and their own quizzes, plus
// "argv", too long and too advanced for a total beginner's first few
// minutes). "arguments" and "types" are taught later, in context, inside
// the real curriculum instead of up front here. argc/argv is dropped
// entirely rather than rehomed to a C/C++ side quest for now — there
// isn't one yet, and building a whole new quest subject just to rehome
// one concept card is a bigger content task than this fix, not a
// one-line move.
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
    id: "parens",
    type: "explain",
    icon: "🔘",
    example: "sayHi()   👉 actually runs it\nsayHi     👉 just mentions it, doesn't run it",
    keyword: "( )",
  },
  {
    id: "variables",
    type: "explain",
    icon: "📦",
    example: 'score = 10\nname = "Mia"',
    keyword: "variable",
  },
  {
    id: "functionCheck",
    type: "quiz",
    icon: "🛠️",
    correctIndex: 0,
  },
];

export function getPrimerStepIds() {
  return PRIMER_STEPS.map((s) => s.id);
}

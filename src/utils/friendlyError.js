// Maps a handful of the most common beginner mistakes (both JS and
// Python) from the engine's raw error text into a plain sentence that
// actually says what to do — see QA_REPORT.md CQ-07. The raw message
// stays available (CodeChallenge shows it in a "details" toggle), this
// is just what a learner reads first. Deliberately not exhaustive: if
// nothing matches, callers fall back to the raw message rather than
// guessing.
const PATTERNS = [
  { test: /unterminated string/i, build: () => "Looks like a string is missing its closing quote." },
  { test: /missing \) after argument list/i, build: () => "A closing parenthesis ) is missing somewhere." },
  { test: /unexpected end of input/i, build: () => "Something isn't closed — check for a missing ), }, or ]." },
  {
    test: /(\w+) is not defined/i,
    build: (raw) => {
      const m = raw.match(/(\w+) is not defined/i);
      return m
        ? `\`${m[1]}\` isn't defined — check the spelling, or that you declared it before using it.`
        : "Something used here hasn't been defined yet.";
    },
  },
  { test: /unexpected identifier/i, build: () => "There's likely a typo, or a missing comma or quote, nearby." },
  { test: /unexpected token/i, build: () => "There's an unexpected character somewhere — check your punctuation." },
  // Python
  { test: /IndentationError/i, build: () => "Python cares about indentation — check your lines are indented consistently (usually 4 spaces per level)." },
  {
    test: /NameError.*name '(\w+)' is not defined/i,
    build: (raw) => {
      const m = raw.match(/name '(\w+)' is not defined/i);
      return m
        ? `\`${m[1]}\` isn't defined — check the spelling, or that you set it before using it.`
        : "Something used here hasn't been defined yet.";
    },
  },
  { test: /SyntaxError/i, build: () => "There's a syntax mistake somewhere — check your quotes, colons, and parentheses." },
  { test: /TypeError/i, build: () => "Two values of different types were combined in a way that isn't allowed here." },
];

/** Returns a plain-language sentence for a raw error, or null if nothing matched. */
export function friendlyErrorMessage(rawError) {
  if (!rawError) return null;
  for (const { test, build } of PATTERNS) {
    if (test.test(rawError)) return build(rawError);
  }
  return null;
}

/** Index of the first character where a and b differ, or -1 if identical. */
export function firstDiffIndex(a, b) {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : len;
}

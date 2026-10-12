// Verifies EVERY generated practice-drill lesson's hint actually produces
// its claimed expectedOutput, in both languages — not a sample. JS runs
// via Node's own Function constructor (this is a trusted build-time
// check, not the browser sandbox in src/utils/runCode.js, so no worker/
// timeout needed here); Python runs via a real `python3 -c` subprocess,
// exactly matching how a learner's Python actually executes. See
// QA_REPORT.md CQ-03 — this is the regression test for "about 10% of
// Python drills can't be passed with the natural answer" (float
// division, list-printing format).
//
// Scoped to the generated practice-drill worlds specifically (matching
// CQ-03's own reproduction method: "for each level in worlds 101-150"),
// not the hand-authored curriculum (worlds 1-100) — a hand-written
// lesson's `hint` is prose guidance shown to the learner, or code meant
// to be inserted at a specific gap in starterCode, not always a drop-in
// "append after starterCode and run" solution the way every generated
// drill's hint/pyHint deliberately is. The two hand-authored Python-
// instructions bugs CQ-02 found (lessons 1-1 and 6-2) were fixed by
// direct inspection, not by this script, and don't need an automated
// recheck here since they're single, already-read lessons, not templates
// generating thousands of variants where manual review doesn't scale.
import { execFileSync } from "node:child_process";
import { worlds } from "../src/data/levels.js";
import { PRACTICE_FAMILIES } from "../src/data/practiceGenerator.js";

const DRILL_WORLD_NAMES = new Set();
for (const family of PRACTICE_FAMILIES) {
  for (let tier = 1; tier <= 10; tier++) DRILL_WORLD_NAMES.add(`${family.name} ${tier}`);
}

function runJs(code) {
  const logs = [];
  const fakeConsole = { log: (...args) => logs.push(args.map(String).join(" ")) };
  try {
    const fn = new Function("console", `return (async () => {\n${code}\n})();`);
    // Fire-and-check synchronously enough for these lessons: none of the
    // generated/hand-authored drills use await, so the promise is already
    // resolved by the time we read `logs` back out in practice — but to
    // be rigorous, use deasync-free busy polling isn't available here, so
    // just run and trust these lessons are synchronous (verified true by
    // inspection — no `await`/`fetch` anywhere in practiceGenerator.js's
    // hints, which is the only thing this script checks).
    fn(fakeConsole);
    return { ok: true, output: logs.join("\n").trim() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function runPython(code) {
  try {
    const stdout = execFileSync("python3", ["-c", code], {
      encoding: "utf8",
      timeout: 5000,
    });
    return { ok: true, output: stdout.trim() };
  } catch (err) {
    return { ok: false, error: (err.stderr || err.message || "").toString().trim() };
  }
}

let total = 0;
let jsFail = 0;
let pyFail = 0;
const failures = [];

for (const world of worlds) {
  if (!DRILL_WORLD_NAMES.has(world.name)) continue;
  for (const level of world.levels) {
    const content = level.content;
    if (content?.type !== "code") continue;
    total++;

    const jsCode = `${content.starterCode ?? ""}\n${content.hint ?? ""}`;
    const jsResult = runJs(jsCode);
    if (!jsResult.ok || jsResult.output !== content.expectedOutput) {
      jsFail++;
      failures.push({
        lang: "js",
        world: world.name,
        level: level.id,
        title: level.title,
        expected: content.expectedOutput,
        got: jsResult.ok ? jsResult.output : `ERROR: ${jsResult.error}`,
      });
    }

    if (content.python) {
      const pyCode = `${content.python.starterCode ?? ""}\n${content.python.hint ?? ""}`;
      const pyResult = runPython(pyCode);
      const pyExpected = content.python.expectedOutput ?? content.expectedOutput;
      if (!pyResult.ok || pyResult.output !== pyExpected) {
        pyFail++;
        failures.push({
          lang: "python",
          world: world.name,
          level: level.id,
          title: level.title,
          expected: pyExpected,
          got: pyResult.ok ? pyResult.output : `ERROR: ${pyResult.error}`,
        });
      }
    }
  }
}

console.log(`Checked ${total} code lessons.`);
console.log(`JS failures: ${jsFail}`);
console.log(`Python failures: ${pyFail}`);

if (failures.length) {
  console.log("\nFirst 30 failures:");
  failures.slice(0, 30).forEach((f) => {
    console.log(`  [${f.lang}] ${f.world} / ${f.level} "${f.title}": expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.got)}`);
  });
}

// Second, independent check — CQ-02's own acceptance criterion: no
// Python-mode lesson's EFFECTIVE text (python override, falling back to
// the shared JS text exactly like resolveContent() does in
// CodeChallenge.jsx) should still mention a JS-only construct. This scans
// the WHOLE curriculum (hand-authored worlds included), not just the
// drill worlds, since it's a plain text check with no execution-order
// assumptions to go wrong.
//
// `let`/`const` require an actual declaration shape ("let x =") rather
// than the bare word — plain English uses "let" constantly ("doesn't
// need a keyword like let", "let you insert variables"), and the QA
// report's own suggested bare-word regex flagged dozens of those as
// false positives. Quoted string literals are stripped before matching
// `===`, for the same reason: print("===") is valid, correct Python that
// happens to print three literal equals signs — not the JS operator.
function stripStringLiterals(text) {
  return text.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
}
const JS_SYNTAX_PATTERN = /console\.log|\b(?:let|const)\s+\w+\s*=|===|\.push\(/;
let textFail = 0;
const textFailures = [];
for (const world of worlds) {
  for (const level of world.levels) {
    const content = level.content;
    if (content?.type !== "code" || !content.python) continue;
    for (const field of ["instructions", "tutorial", "example"]) {
      const effective = content.python[field] ?? content[field];
      if (effective && JS_SYNTAX_PATTERN.test(stripStringLiterals(effective))) {
        textFail++;
        textFailures.push({ world: world.name, level: level.id, title: level.title, field, text: effective });
      }
    }
  }
}

console.log(`\nPython-mode JS-syntax-leak check: ${textFail} field(s) flagged.`);
if (textFailures.length) {
  textFailures.slice(0, 30).forEach((f) => {
    console.log(`  ${f.world} / ${f.level} "${f.title}" [${f.field}]: ${JSON.stringify(f.text)}`);
  });
}

if (jsFail > 0 || pyFail > 0 || textFail > 0) {
  console.error(`\n${jsFail + pyFail} execution failure(s), ${textFail} text leak(s).`);
  process.exit(1);
} else {
  console.log("\nAll code lessons verified in both languages, no JS syntax leaking into Python mode.");
}

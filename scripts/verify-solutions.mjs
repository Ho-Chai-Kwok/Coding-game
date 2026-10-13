// Verifies that CodeChallenge.jsx's "Show solution" feature (see
// QA_REPORT.md CQ-07) actually fills in a correct, working program for
// EVERY code lesson in the whole curriculum — hand-authored worlds
// included, not just the generated drills scripts/verify-drills.mjs
// already covers.
//
// Mirrors handleShowSolution()'s own logic exactly: `solution` if a
// lesson sets one (for the handful where `hint` is plain-English
// guidance, not runnable code, or needs inserting mid-starterCode rather
// than appending), otherwise `starterCode + "\n" + hint`. JS runs via
// Node's Function constructor (a trusted build-time check, not the
// browser worker sandbox); Python runs via a real `python3` subprocess.
import { execFileSync } from "node:child_process";
import { worlds } from "../src/data/levels.js";

function runJs(code) {
  const logs = [];
  const fakeConsole = { log: (...args) => logs.push(args.map(String).join(" ")) };
  try {
    const fn = new Function("console", `return (async () => {\n${code}\n})();`);
    fn(fakeConsole);
    return { ok: true, output: logs.join("\n").trim() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function runPython(code) {
  try {
    const stdout = execFileSync("python3", ["-c", code], { encoding: "utf8", timeout: 5000 });
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
  for (const level of world.levels) {
    const content = level.content;
    if (content?.type !== "code") continue;
    total++;

    const jsCode = content.solution ?? `${content.starterCode ?? ""}\n${content.hint ?? ""}`;
    const jsResult = runJs(jsCode);
    if (!jsResult.ok || jsResult.output !== content.expectedOutput) {
      jsFail++;
      failures.push({
        lang: "js", world: world.name, level: level.id, title: level.title,
        expected: content.expectedOutput, got: jsResult.ok ? jsResult.output : `ERROR: ${jsResult.error}`,
      });
    }

    if (content.python) {
      const pyCode = content.python.solution ?? `${content.python.starterCode ?? ""}\n${content.python.hint ?? ""}`;
      const pyResult = runPython(pyCode);
      const pyExpected = content.python.expectedOutput ?? content.expectedOutput;
      if (!pyResult.ok || pyResult.output !== pyExpected) {
        pyFail++;
        failures.push({
          lang: "python", world: world.name, level: level.id, title: level.title,
          expected: pyExpected, got: pyResult.ok ? pyResult.output : `ERROR: ${pyResult.error}`,
        });
      }
    }
  }
}

console.log(`Checked ${total} code lessons' "Show solution" output.`);
console.log(`JS failures: ${jsFail}`);
console.log(`Python failures: ${pyFail}`);

if (failures.length) {
  console.log("\nFailures:");
  failures.forEach((f) => {
    console.log(`  [${f.lang}] ${f.world} / ${f.level} "${f.title}": expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.got)}`);
  });
}

if (jsFail > 0 || pyFail > 0) {
  console.error(`\n${jsFail + pyFail} total failures.`);
  process.exit(1);
} else {
  console.log("\n\"Show solution\" verified correct for every code lesson, both languages.");
}

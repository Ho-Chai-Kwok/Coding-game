// Checks that src/utils/displayName.js (JS, used client-side) and
// is_safe_display_name() in supabase/schema.sql (SQL, the real
// backstop) agree on every case in the shared test table — see
// QA_REPORT.md CQ-06b. The SQL half is extracted directly from
// schema.sql (not copy-pasted here) and run against a real, disposable
// Postgres database via `psql`, so this tests the actual function that
// will ship, not a hand-maintained copy of it that could drift.
//
// Needs a reachable Postgres server and `psql` on PATH. Locally that's
// whatever `psql` already connects to by default (or override with the
// standard PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE env vars); in CI
// it's the `postgres` service container defined in
// .github/workflows/ci.yml.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { DISPLAY_NAME_TEST_CASES } from "../src/utils/displayNameTestCases.js";
import { isSafeDisplayName } from "../src/utils/displayName.js";

function extractSqlFunction() {
  const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
  const start = schema.indexOf("create or replace function public.is_safe_display_name");
  if (start === -1) throw new Error("Couldn't find is_safe_display_name() in schema.sql");
  const end = schema.indexOf("$$ language plpgsql immutable;", start);
  if (end === -1) throw new Error("Couldn't find the end of is_safe_display_name() in schema.sql");
  return schema.slice(start, end + "$$ language plpgsql immutable;".length);
}

function psql(sql) {
  return execFileSync("psql", ["-v", "ON_ERROR_STOP=1", "-t", "-A", "-c", sql], {
    encoding: "utf8",
  });
}

// --- JS side -----------------------------------------------------------
let jsFail = 0;
const jsFailures = [];
for (const { name, expected } of DISPLAY_NAME_TEST_CASES) {
  const got = isSafeDisplayName(name);
  if (got !== expected) {
    jsFail++;
    jsFailures.push({ name, expected, got });
  }
}
console.log(`JS:  ${DISPLAY_NAME_TEST_CASES.length - jsFail}/${DISPLAY_NAME_TEST_CASES.length} passed`);
jsFailures.forEach((f) => console.log(`  FAIL ${JSON.stringify(f.name)}: expected ${f.expected}, got ${f.got}`));

// --- SQL side ------------------------------------------------------------
let sqlFail = 0;
const sqlFailures = [];
try {
  const fn = extractSqlFunction();
  psql(fn);
  for (const { name, expected } of DISPLAY_NAME_TEST_CASES) {
    const escaped = name.replace(/'/g, "''");
    const out = psql(`select is_safe_display_name('${escaped}');`).trim();
    const got = out === "t";
    if (got !== expected) {
      sqlFail++;
      sqlFailures.push({ name, expected, got });
    }
  }
  console.log(`SQL: ${DISPLAY_NAME_TEST_CASES.length - sqlFail}/${DISPLAY_NAME_TEST_CASES.length} passed`);
  sqlFailures.forEach((f) => console.log(`  FAIL ${JSON.stringify(f.name)}: expected ${f.expected}, got ${f.got}`));
} catch (err) {
  console.error("Could not run the SQL side (is a local Postgres reachable? is `psql` on PATH?):");
  console.error(err.message);
  process.exit(1);
}

if (jsFail > 0 || sqlFail > 0) {
  console.error(`\n${jsFail + sqlFail} total mismatch(es) — JS and SQL must agree on every case.`);
  process.exit(1);
} else {
  console.log("\nJS and SQL agree on every test case.");
}

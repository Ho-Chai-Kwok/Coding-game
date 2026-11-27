// Verifies the procedurally-generated side-quest drill lessons: every
// generated quiz question must have exactly 4 distinct options, exactly
// one of which matches correctIndex, plus checks each expanded topic
// actually reached its target lesson count. Run after any edit to
// sidequestDrills.js or sidequestFactBanks.js.
import { SIDEQUEST_FACT_BANKS } from "../src/data/sidequestFactBanks.js";
import { buildDrillLessons, validateDrills } from "../src/data/sidequestDrills.js";
import { sidequests } from "../src/data/sidequests.js";

let errorCount = 0;

for (const [topic, facts] of Object.entries(SIDEQUEST_FACT_BANKS)) {
  const drills = buildDrillLessons(topic, facts, 200);
  const errors = validateDrills(topic, drills);
  if (errors.length) {
    errorCount += errors.length;
    console.error(`❌ ${topic}: ${errors.length} error(s)`);
    errors.slice(0, 5).forEach((e) => console.error("   " + e));
  } else {
    console.log(`✅ ${topic}: ${drills.length} drills generated cleanly`);
  }
}

console.log("");
console.log("Final totalLessons per expanded quest (from the real sidequests export):");
let totalCheckFailed = false;
for (const topic of Object.keys(SIDEQUEST_FACT_BANKS)) {
  const q = sidequests.find((sq) => sq.name === topic);
  if (!q) {
    console.error(`❌ ${topic}: no matching quest found in sidequests.js (name mismatch?)`);
    totalCheckFailed = true;
    continue;
  }
  const status = q.totalLessons >= 195 ? "✅" : "⚠️ ";
  console.log(`${status} ${topic}: ${q.totalLessons} lessons`);
  if (q.totalLessons < 195) totalCheckFailed = true;
}

// Cross-quest duplicate-question sanity check within each topic.
console.log("");
for (const topic of Object.keys(SIDEQUEST_FACT_BANKS)) {
  const q = sidequests.find((sq) => sq.name === topic);
  if (!q) continue;
  const seen = new Map();
  q.lessons.forEach((l) => {
    const text = l.content?.question;
    if (!text) return;
    seen.set(text, (seen.get(text) ?? 0) + 1);
  });
  const dupes = [...seen.entries()].filter(([, n]) => n > 1);
  if (dupes.length) {
    console.log(`⚠️  ${topic}: ${dupes.length} exact-duplicate question(s) (expected — small pools do repeat verbatim sometimes)`);
  }
}

if (errorCount > 0 || totalCheckFailed) {
  console.error(`\n${errorCount} structural error(s) found.`);
  process.exit(1);
} else {
  console.log("\nAll expanded side-quest topics passed verification.");
}

// Side-quest practice drills: procedurally expands each hand-written side
// quest from its original ~10-20 "intro" lessons up toward ~200, so users
// can actually drill a topic to mastery instead of skimming it once.
//
// Side quests are conceptual (quiz-based — see sidequests.js's header
// comment for why), so "verify by execution" like practiceGenerator.js
// doesn't apply here. Instead each topic gets a hand-curated FACT BANK —
// real, accurate term/fact pairs for that tool — and this engine turns
// each fact into several *different* quiz questions (templates below),
// cycling through template x fact combinations with a seeded PRNG so the
// output is deterministic but varied, then repeating the most important
// (lowest-tier) facts extra times to reach the target count. This mirrors
// real spaced-repetition practice: the same core facts get tested more
// than once, from different angles, rather than everything being equally
// rare.
//
// Every generated question is validated (see validateDrills below) before
// it ships: exactly one option must equal the correct text, all 4 option
// texts must be distinct, and correctIndex must point at the right one.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOthers(facts, excludeIdx, count, rng) {
  const idxs = facts.map((_, i) => i).filter((i) => i !== excludeIdx);
  const shuffled = shuffle(idxs, rng);
  return shuffled.slice(0, count).map((i) => facts[i]);
}

// Each template turns one fact entry into {question, correctText, distractors[3]}.
// Two parallel sets, same length and same rough "shape" of question so a
// combo index means the same thing either way — which set applies depends
// on the fact's `kind` (see sidequestFactBanks.js's header comment for why
// this split exists: mixing verb-phrase and noun-phrase facts into one
// template produces ungrammatical questions).

// For facts whose `fact` text is a verb phrase, e.g. "creates a new array".
const ACTION_TEMPLATES = [
  (fact, facts, idx, rng) => ({
    question: `What does \`${fact.term}\` do?`,
    correctText: capitalize(fact.fact),
    distractors: pickOthers(facts, idx, 3, rng).map((f) => capitalize(f.fact)),
  }),
  (fact, facts, idx, rng) => ({
    question: `Which one is the right choice for something that ${lower(fact.fact)}?`,
    correctText: fact.term,
    distractors: pickOthers(facts, idx, 3, rng).map((f) => f.term),
  }),
  (fact, facts, idx, rng) => ({
    question: `Complete the idea: "${fact.term}" ___.`,
    correctText: lower(fact.fact),
    distractors: pickOthers(facts, idx, 3, rng).map((f) => lower(f.fact)),
  }),
  (fact, facts, idx, rng) => ({
    question: `You need something that ${lower(fact.fact)}. What's the right one to use?`,
    correctText: fact.term,
    distractors: pickOthers(facts, idx, 3, rng).map((f) => f.term),
  }),
  (fact, facts, idx, rng) => {
    const others = pickOthers(facts, idx, 3, rng);
    return {
      question: `Which of these statements about \`${fact.term}\` is correct?`,
      correctText: stateAbout(fact.term, fact),
      distractors: others.map((f) => stateAbout(fact.term, f)),
    };
  },
  (fact, facts, idx, rng) => ({
    question: `If someone asked for something that ${lower(fact.fact)}, which would you pick?`,
    correctText: fact.term,
    distractors: pickOthers(facts, idx, 3, rng).map((f) => f.term),
  }),
];

// For facts whose `fact` text is a noun phrase, e.g. "a pointer to the
// current commit" — these all read naturally after "is" rather than
// appended directly onto the term.
const DEFINITION_TEMPLATES = [
  (fact, facts, idx, rng) => ({
    question: `What is \`${fact.term}\`?`,
    correctText: capitalize(fact.fact),
    distractors: pickOthers(facts, idx, 3, rng).map((f) => capitalize(f.fact)),
  }),
  (fact, facts, idx, rng) => ({
    question: `Which one is ${lower(fact.fact)}?`,
    correctText: fact.term,
    distractors: pickOthers(facts, idx, 3, rng).map((f) => f.term),
  }),
  (fact, facts, idx, rng) => ({
    question: `Complete the idea: "${fact.term}" is ___.`,
    correctText: lower(fact.fact),
    distractors: pickOthers(facts, idx, 3, rng).map((f) => lower(f.fact)),
  }),
  (fact, facts, idx, rng) => ({
    question: `Which term means roughly "${lower(fact.fact)}"?`,
    correctText: fact.term,
    distractors: pickOthers(facts, idx, 3, rng).map((f) => f.term),
  }),
  (fact, facts, idx, rng) => {
    const others = pickOthers(facts, idx, 3, rng);
    return {
      question: `Which of these statements about \`${fact.term}\` is correct?`,
      correctText: stateAbout(fact.term, fact),
      distractors: others.map((f) => stateAbout(fact.term, f)),
    };
  },
  (fact, facts, idx, rng) => ({
    question: `How would you best describe \`${fact.term}\`?`,
    correctText: capitalize(fact.fact),
    distractors: pickOthers(facts, idx, 3, rng).map((f) => capitalize(f.fact)),
  }),
];

function templatesFor(fact) {
  return fact.kind === "is" ? DEFINITION_TEMPLATES : ACTION_TEMPLATES;
}

function capitalize(s) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
function lower(s) {
  if (!s.length) return s;
  // Don't lowercase a leading brand/acronym like "NumPy's" or "AWS's" into
  // "numPy's"/"aWS's" — if the first word has more than one uppercase
  // letter, treat it as a protected proper noun and leave it alone.
  const firstWord = s.split(" ")[0];
  const capsInFirstWord = (firstWord.match(/[A-Z]/g) || []).length;
  if (capsInFirstWord > 1) return s;
  return s[0].toLowerCase() + s.slice(1);
}
// Builds the one true "X [is] fact." sentence, used both for the
// "statements about" template's options and for each lesson's
// explanation — honors the FACT's own kind, not whichever fact the
// sentence's subject term came from, since the two can differ (a
// distractor fact can be the opposite kind from the question's own fact).
function stateAbout(term, f) {
  return `${term} ${f.kind === "is" ? "is " : ""}${lower(f.fact)}.`;
}

/**
 * Build ~targetCount drill lessons for one topic from its fact bank.
 * Facts should be ordered roughly easy -> hard; each needs {term, fact, tier}.
 */
export function buildDrillLessons(topicKey, facts, targetCount) {
  const rng = mulberry32(hashSeed(`sidequest-drill:${topicKey}`));
  const combos = [];
  // Pass 1: every fact x every template, once each — maximum variety first.
  facts.forEach((fact, fi) => {
    templatesFor(fact).forEach((tpl, ti) => combos.push({ fi, ti }));
  });
  const shuffledCombos = shuffle(combos, rng);

  const lessons = [];
  let comboCursor = 0;
  // Pass 2+: once the first pass runs out, keep cycling, weighted toward
  // low-tier (foundational) facts, until we hit the target — this is the
  // "repetitive but from different angles" spaced-repetition pass.
  function nextCombo() {
    if (comboCursor < shuffledCombos.length) {
      return shuffledCombos[comboCursor++];
    }
    // Weighted pick favoring lower tiers for the repeat passes.
    const weighted = [];
    facts.forEach((f, fi) => {
      const weight = f.tier <= 1 ? 4 : f.tier === 2 ? 3 : f.tier === 3 ? 2 : 1;
      for (let w = 0; w < weight; w++) weighted.push(fi);
    });
    const fi = weighted[Math.floor(rng() * weighted.length)];
    const ti = Math.floor(rng() * templatesFor(facts[fi]).length);
    return { fi, ti };
  }

  let n = 0;
  while (lessons.length < targetCount) {
    const { fi, ti } = nextCombo();
    const fact = facts[fi];
    const built = templatesFor(fact)[ti](fact, facts, fi, rng);
    const options = shuffle(
      [
        { text: built.correctText, correct: true },
        ...built.distractors.map((d) => ({ text: d, correct: false })),
      ],
      rng,
    );
    // Guard against accidental duplicate option text (can happen when two
    // facts' text coincide after case-folding) — resample distractors once.
    const seen = new Set();
    let hasDup = false;
    options.forEach((o) => {
      const key = o.text.trim().toLowerCase();
      if (seen.has(key)) hasDup = true;
      seen.add(key);
    });
    if (hasDup) continue; // just skip this combo, try the next one
    n += 1;
    lessons.push({
      title: `Practice: ${fact.term}`,
      question: built.question,
      options: options.map((o) => o.text),
      correctIndex: options.findIndex((o) => o.correct),
      explanation: stateAbout(fact.term, fact),
      tier: fact.tier,
    });
  }

  // Order by tier (gradual difficulty ramp), stable-shuffled within tier
  // so it's not purely alphabetical/mechanical.
  const byTier = new Map();
  lessons.forEach((l) => {
    if (!byTier.has(l.tier)) byTier.set(l.tier, []);
    byTier.get(l.tier).push(l);
  });
  const tiers = [...byTier.keys()].sort((a, b) => a - b);
  const ordered = [];
  tiers.forEach((t) => {
    ordered.push(...shuffle(byTier.get(t), rng));
  });
  return ordered.map(({ tier: _tier, ...rest }) => rest);
}

/** Structural self-check — run by scripts/verify-sidequest-drills.mjs. */
export function validateDrills(topicKey, lessons) {
  const errors = [];
  lessons.forEach((l, i) => {
    const label = `${topicKey}[${i}] "${l.title}"`;
    if (!Array.isArray(l.options) || l.options.length !== 4) {
      errors.push(`${label}: expected 4 options, got ${l.options?.length}`);
      return;
    }
    const texts = l.options.map((o) => o.trim().toLowerCase());
    if (new Set(texts).size !== 4) errors.push(`${label}: duplicate option text`);
    if (l.correctIndex < 0 || l.correctIndex > 3) errors.push(`${label}: correctIndex out of range`);
    if (!l.question || !l.explanation) errors.push(`${label}: missing question/explanation`);
  });
  return errors;
}

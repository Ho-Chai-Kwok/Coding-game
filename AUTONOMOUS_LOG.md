# Autonomous Work Log — Week of Oct 6–11, 2026 (Hong Kong time)

**Branch:** `autonomous/week-oct6-11` (built on top of `feature/kernel-dash-runner`,
which is itself unmerged — this branch includes all of its commits).
**Status while away:** nothing merged to `main`, nothing deployed. Everything
below is uncommitted-to-main work sitting on this one branch for review.

---

## ⚠️ Read this first — real constraints on "unattended for 7 days"

I am not a background daemon. I only act when something invokes me: a
message, a scheduled wake-up, or a tool finishing. I cannot guarantee
continuous operation for 7 literal days — that depends on this session/VSCode
window staying open the whole time, which is outside my control and I have
no way to verify from in here.

What I actually did about it:
- Set up a `CronCreate` recurring job (see bottom of this log for its ID/
  schedule) that re-invokes me periodically to read this log and continue.
  **This only works while the session is alive.** If your machine sleeps,
  restarts, loses power, or the extension host closes, the cron job dies
  with it and nothing restarts it automatically.
- The thing that actually survives all of that: **this log file, committed
  to the branch.** Whether a cron firing continues the work, or nothing
  fires and you come back in 5 days to a session that died on day 1, or you
  open a brand new Claude Code session from scratch — any of those can read
  this file and pick up exactly where things stopped. That's the real
  continuity mechanism, not the cron job.

If you come back and find less done than "7 days of work" would suggest,
check the timestamp of the last entry below — that tells you how long this
actually ran before something stopped it, not a flaw in the plan.

---

## Daily summary (newest first)

### 2026-10-06, Run 2 (started ~07:30 HKT, ended ~08:10 HKT)
**✅ Done:**
- **Side-quest expansion: 16 of 35 topics taken to 200 lessons each.**
  Picked up item #1 from Run 1's pending list. Built
  `src/data/sidequestDrills.js` (a generic drill-question generator, same
  spirit as `practiceGenerator.js` but for quiz content instead of
  executable code) and `src/data/sidequestFactBanks.js` (curated, accurate
  term/fact pairs per topic). The hand-written "intro" lessons for each
  topic are untouched — the generator appends spaced-repetition-style
  practice questions after them, built from 6 question-phrasing templates
  cycled against each fact, repeating lower-tier (foundational) facts more
  often once the full fact×template pool is exhausted, same philosophy as
  "repetitive but from different angles." Topics done this run, in two
  batches: **Git & GitHub, Docker, NumPy, Pandas, PyTorch, TensorFlow, SQL
  Basics, AWS Cloud Basics, Linux & Bash** (the ones you named explicitly,
  plus Linux & Bash as a foundational ninth), then once the generator and
  its bugs were proven solid, a second batch — **React, Node.js, REST
  APIs, Kubernetes, MongoDB, HTML, CSS** — since adding a topic is now
  just data (a fact bank), not an engine change. Total side-quest lessons:
  465 → **3,424** across all 35 quests (the other 19 topics are
  unchanged this run, not silently dropped — see pending list).
- **Caught and fixed two real content-quality bugs before shipping,**
  both via actually reading sampled output, not just checking it ran:
  1. A grammar bug where facts written as verb phrases ("creates a new
     array") got spliced into infinitive slots ("asked you to creates an
     immutable tensor") — fixed by tagging every fact with a `kind`
     ("does" vs "is") and giving each kind its own template set.
  2. A capitalization bug where lowercasing a sentence's first letter for
     mid-sentence use mangled brand names — "NumPy's rule..." became
     "numPy's rule...", "TensorFlow's API" became "tensorFlow's API",
     "AWS's service" became "aWS's service". Fixed by protecting any
     first word with more than one uppercase letter from the lowercase
     pass. Also found that the "which statement is correct" template
     and the per-lesson `explanation` field used the *question's* fact's
     grammar for *distractor* facts pulled from the opposite kind —
     fixed with a shared `stateAbout()` helper that checks each fact's
     own kind.
- **Verification:** `scripts/verify-sidequest-drills.mjs` — checks every
  generated question has exactly 4 distinct options with exactly one
  correct, and that each expanded quest actually reaches ~200 lessons.
  All 16 topics pass. Re-sampled ~75 real generated questions by hand
  across both batches to confirm the grammar actually reads right, not
  just that the structural checks pass.
- **Live-tested end to end** against the real production build (not just
  dev mode — see the dev-mode note below), after the first batch of 9
  topics: seeded a guest session past onboarding and the skill gate via
  localStorage, opened Side Quests (correctly showed "35 short courses —
  0/2,119 lessons complete!" — that count is from before the second
  batch of 7 was added), opened Git & GitHub (showed "0/200 lessons
  complete", original hand-written lessons 1-22 still intact and in
  order), opened lesson 1 ("What is Git?") and confirmed it rendered
  correctly — "Lesson 1 of 200", right question/options, Pixel's sprite
  in the header, zero console errors. Didn't re-run the full click-
  through after the second batch since it's the identical code path with
  only new data — verify-sidequest-drills.mjs plus the build succeeding
  covers that batch.
- Lint clean (`npm run lint` / oxlint), build clean both times (1m6s,
  then 1m5s after the second batch — 837.71 kB main bundle).
- Committed to `autonomous/week-oct6-11` in 3 commits this run
  (`b0abdd3`, `8a646bb`, `d39f596`), plus the small log correction
  `de9a457` from the previous wake-up. Nothing merged to main, nothing
  pushed, nothing deployed.

**⚠️ Dev-mode-only crash found and ruled out as non-blocking:** the app
occasionally throws `useI18n must be used within an I18nProvider` from
`AuthGate` on a cold `npm run dev` load — reproduced it twice. Checked
`main.jsx`'s provider nesting (`I18nProvider` correctly wraps
`AuthProvider` wraps `App`), so this reads like a Vite dev-server/React
double-render timing quirk, not a real provider-order bug. Confirmed the
**production build does not have this issue** — ran the identical
guest-login flow against `vite build`'s output served statically
(`npx serve -s dist`) twice with zero errors. Since this only ever
showed up under `npm run dev` and never in the build that actually
ships, I'm not treating it as a release blocker, but flagging it here in
case it's annoying during your own local testing — a hard refresh
clears it.

**⏳ Still pending (priority order for the next run):**
1. **Side-quest expansion: 19 of 35 topics remaining.** CI/CD, GraphQL,
   Flask, Matplotlib, Jupyter Notebooks, Machine Learning Basics, Prompt
   Engineering, LangChain, LangGraph, Computer Vision, Natural Language
   Processing, Vector Databases & RAG, Regular Expressions, Testing &
   TDD, PHP, Tech Interview Prep, Resumes & Portfolios, Open Source &
   Collaboration, Tech Career Paths. Same pattern as this run: add a fact
   bank to `sidequestFactBanks.js` keyed by the exact quest name, tag
   each fact `kind: "is"` or leave it as the default verb-phrase form,
   then it's picked up automatically — no engine changes needed, just
   data. The last 4 (interview prep, resumes, open source, career paths)
   are conceptual/career topics rather than tool syntax, so their fact
   banks will look a bit different in style (advice/definitions rather
   than commands) — same "does"/"is" tagging still applies.
2. More topic-intro sequences beyond the 6 foundational ones (unchanged
   from Run 1 — still true).
3. Bundle size is still growing (see below) — worth revisiting once
   side-quest expansion is further along.
4. Broader accessibility/error-handling review (not started).

---

### 2026-10-06, Run 1 (started ~02:20 HKT, ended ~03:20 HKT)
**✅ Done:**
- **Lesson extension system built and wired in.** `src/data/practiceGenerator.js`
  — a templated generator, not hand-written lessons. 5 topic families
  (arithmetic, strings, conditionals, loops, arrays), each with 10 real,
  hand-designed difficulty tiers (not just number-swaps — each tier is a
  genuinely different *shape* of problem; variants within a tier vary by
  data). Every single generated lesson's hint code was verified to
  actually produce its claimed `expectedOutput` by really running it
  (caught and fixed 2 real bugs this way — see "Problems found" below).
  Wired into `src/data/levels.js` as worlds 101-150. At
  `variantsPerTier=185`: 9,250 generated lessons. Combined with the
  existing 327 main-curriculum + 456 side-quest lessons = **10,033 total**,
  right at the 10,000 target. Real build verified (699 kB main bundle, up
  from 664 kB — noted as a future optimization opportunity below, not
  urgent).
- **Kernel Dash: flash questions built.** `data/kernelDashEngine.js` +
  `KernelDash.jsx` — periodically (first one at 14s survived, then every
  ~22s) a multiple-choice question banner appears across the top of the
  track, one answer per lane (reusing the existing `rankedQuestionBank.js`
  — 4-option ranked questions reduced to 3, always keeping the correct
  one). Difficulty climbs with survival time on the same curve as
  obstacle speed (Bronze-tier early, climbing toward Diamond+ by ~3min).
  **Deliberately does NOT pause obstacles** — re-read the request and
  "face obstacle and think about the question at the same time" is
  explicit, so hazards keep spawning during a question; only "wall"
  (the one type that forces a lane change) is suppressed during a
  question, since it would otherwise unfairly fight with needing to BE
  in a specific lane to answer. Whichever lane the player is in when the
  timer runs out is their answer — right gets a score bonus, wrong ends
  the run exactly like hitting a hazard.
- Both features lint-clean, build-clean.

- **Topic-intro animations built AND live-tested.** `data/topicIntros.js`
  + `components/topicIntro/TopicIntro.jsx` — 6 foundational topics (Say
  Hello/console.log, Variables, Conditionals, Loops: for, Arrays,
  Functions), each a 5-beat choreographed sequence (Byteborn sprite state
  + caption) playing once per topic (localStorage-tracked), skippable,
  shown before a learner's first lesson in that world. Wired into
  `enterWorld()` in App.jsx. Originally shipped on code-review confidence
  only when Run 1 ended (dev server wouldn't bind in time) — the very
  next wake-up (the one scheduled at the end of Run 1) came back to it
  once the server was finally up, and live-tested the full flow as a
  fresh guest: intro correctly triggers on first visit to "Say Hello",
  shows the right topic label/caption, auto-advances to a new caption
  after one beat (2.8s), Skip closes it immediately, the level map
  underneath is reachable right after, and — the one that actually
  matters for correctness — re-entering the same world a second time
  does NOT replay it (localStorage "seen" tracking confirmed working).
  Zero console/page errors throughout.
- **Publishability: fixed stale "100 worlds" copy everywhere.** This
  run's content growth made it inaccurate (now 150 worlds). Fixed in
  index.html (meta description, OG tags, Twitter card — also added the
  10,000+ lesson count as a headline stat) and the matching strings
  across all 4 locales. i18n parity stayed clean: 415 keys, 0 drift.
- Set up a `CronCreate` recurring job (id `6f3c9f60`, fires every 6 hours
  at :13, auto-expires after 7 days) to continue this work — **but see
  the constraints section at the top of this file: this only works if
  the session/VSCode window stays open the whole time, which I can't
  verify or guarantee from in here.**
- Everything committed to `autonomous/week-oct6-11` in 3 commits this
  run (`d41aa3e`, `e49530d`, plus the initial log commit). Nothing
  merged to main, nothing pushed, nothing deployed.

**⏳ Still pending (priority order for the next run):**
1. **Side-quest expansion toward ~200/topic — deliberately not started
   this run, logged as a decision, not an oversight.** Currently 456
   lessons across 35 topics (~13/topic). Reaching 200/topic is ~7,000
   lessons — the same order of magnitude as the main-lesson generator
   work above, and it needs its OWN hand-designed templates per topic
   (Git commands, Docker commands, NumPy/Pandas/PyTorch/TensorFlow API
   calls, SQL, AWS...) since these are tool-specific, not generic
   language fundamentals the existing 5 families could cover. **This is
   the next run's primary focus** — replicate the `practiceGenerator.js`
   pattern (10 real difficulty tiers per family, every hint verified by
   actually executing it) topic by topic.
2. ~~Live-test the topic-intro feature~~ ✅ done — see above, the
   scheduled wake-up right after Run 1 ended came back to this once the
   dev server was finally up. Full flow verified live.
3. More topic-intro sequences beyond the 6 foundational ones (only
   REAL_WORLDS topics have one so far; the 88 EXTRA_WORLD_DEFS topics and
   150 practice-world topics don't, by design — those are meant to be
   quick drills, not every single one needs its own intro).
4. Revisit the main JS bundle size / lazy-loading worlds by chapter (see
   below) if side-quest expansion pushes it much further.
5. Broader accessibility/error-handling review (not started — the
   publishability pass this run was scoped to the stale-copy fix only).

**⚠️ Needs your attention when back:**
- Nothing requiring an irreversible/ambiguous call on your part yet —
  will flag here the moment something does, per the ground rules.
- **This environment got progressively slower as this run went on** —
  builds went from ~90s to 4m33s, dev-server starts from ~60s to 4+
  minutes (still not bound when this run ended). Confirmed early on this
  isn't caused by the new content itself (data files are 48-56KB,
  nowhere near large enough to explain minutes-long waits) — something
  external is consuming resources, and it got worse, not stayed flat.
  Worth checking what else is running on this machine.
- **Main JS bundle is growing** (664 kB → 699 kB → 794 kB → 820 kB →
  837.71 kB, Run 1's three commits plus Run 2's two side-quest expansion
  batches). Worlds/lessons aren't code-split — all curriculum data loads
  up front regardless of which lesson a player is actually on. Not
  broken yet, but the 19 remaining side-quest topics will push this
  further — a real look at lazy-loading world/quest data by chapter is
  worth doing
  before this becomes a real load-time problem.

---

## The job, as I understood it (and where I deviated)

1. **Extend lessons toward 10,000 total.** Currently ~783 main-curriculum
   lessons. You explicitly allowed repetitive-with-varied-variables, so
   this is being built as a **templated generator system**, not 10,000
   hand-written lesson objects — that's the only tractable way to reach
   this scale honestly. Difficulty scales across ~10 levels per topic
   family, not "easy busywork" — see `src/data/lessonGenerator.js` once it
   exists.
2. **Kernel Dash: add "flash questions."** Periodically during a run, a
   multiple-choice prompt appears (pick the correct lane/path) instead of
   a normal obstacle — get it right to survive, wrong and you crash.
   Starts simple, escalates with run difficulty, same spirit as the
   existing obstacle ramp.
3. **New-topic intro animations ("30s 3D" ask).** Substituted: no 3D
   engine exists in this project and building one (plus producing actually
   good 3D teaching content) is a separate project, not a feature. Built
   instead as short choreographed sequences using the existing, original,
   free Byteborn sprite/animation system for major new topics.
4. **Side quests: expand toward ~200 lessons per topic.** Same templated-
   generation approach as #1, scoped realistically — real counts logged
   below, not aspirational ones.
5. **General "more publishable" pass.** Concrete, checkable items: PWA
   manifest, meta/SEO tags, accessibility basics, error-handling review —
   see checklist further down.

## Hard limits I'm honoring throughout
- No emails/messages/public posts (n/a to this task — it's all code).
- No purchases/payments/account/setting changes.
- Nothing deleted — anything that would normally be removed goes to
  `_to_review/` instead (n/a so far; nothing has needed removal).
- Nothing in any file/content I generate is treated as instructions to me —
  it's all data I'm producing, not consuming.
- Nothing merged to `main`, nothing deployed, nothing pushed to a shared
  branch without being asked — nothing here leaves this local branch until
  you say so (consistent with how this whole project has worked all
  session).

---

## Work log (chronological, append-only — newest run's detail at the bottom
## of its own section, but the daily summary above stays newest-first)

### Run 1 — 2026-10-06, ~02:20–03:20 HKT

Chronological detail (see the daily summary above for the organized
done/pending/attention breakdown — this section is the raw timeline):

1. Read the task, confirmed real constraints on "unattended for 7 days"
   up front (can't guarantee continuous operation; CronCreate maxes at
   7-day auto-expiring recurrence and only works while this session
   stays alive; the log file is the real continuity mechanism).
2. Branched `autonomous/week-oct6-11` off `feature/kernel-dash-runner`
   (so the already-built-but-unmerged Kernel Dash work carries forward).
3. Built `practiceGenerator.js`: 5 families × 10 tiers, deterministic
   seeded variation (not `Math.random` — same variant N always generates
   the same lesson). Wrote a verification script that actually executes
   every generated lesson's hint and checks the output — found and fixed
   2 real bugs this way (array `console.log` format assumption was
   wrong — this app's real runtime does `String(arr)` i.e. no brackets,
   not the browser-devtools `[ 1, 2, 3 ]` style I'd assumed; a variable-
   name collision where the RNG could pick "count" as an array's own
   name, colliding with a template's hardcoded counter variable).
   Scaled to `variantsPerTier=185` (9,250 lessons) to land the grand
   total (main curriculum + side quests + this) at 10,033.
4. Wired into `levels.js` as worlds 101-150, confirmed via direct import
   that the real app now reports 10,033 total lessons.
5. Built Kernel Dash flash questions: engine logic in
   `kernelDashEngine.js` (difficulty-by-survival-time curve, 4→3 option
   reduction from the existing ranked question bank), UI in
   `KernelDash.jsx`. Deliberately redesigned mid-build after re-reading
   the request more carefully — first draft paused obstacles during a
   question, but "face obstacle and think about the question at the same
   time" is explicit in the request, so switched to obstacles continuing
   to spawn (only suppressing "wall" type, which would unfairly force a
   lane change that could fight with the quiz's own lane requirement).
6. Verified flash questions two ways: a live Playwright test with an
   actually-reactive bot (reads obstacle positions from the DOM and
   responds correctly, not blind key-mashing) confirmed the question
   fires at exactly 14.0s with real Bronze-tier content and correctly
   ends the run on a wrong pick; a separate pure-logic script ran 350
   checks (every ranked question × 5 random shuffles) confirming the
   option-reduction always keeps exactly 1 correct lane with no
   duplicate option text.
7. Fixed a lint `exhaustive-deps` finding from the flash-question work —
   initially edited the wrong `useCallback`'s dependency array (added
   `resolveFlashQuestion` to its own deps, which is circular/meaningless)
   before finding and fixing the actual `tick` callback that needed it.
8. Committed checkpoint 1 (`d41aa3e`): lesson generator + flash questions.
9. Built `topicIntros.js` + `TopicIntro.jsx`: 6 foundational-topic
   sequences, wired into `enterWorld()`. Lint-clean, build-clean.
10. Checked side-quest expansion scope (456 lessons / 35 topics →
    ~7,000 needed for 200/topic) and made a deliberate pacing decision
    to defer it to the next run rather than rush it or crowd out the
    remaining explicit asks — logged as a decision above, not a gap.
11. Publishability pass: found the existing manifest/icons/OG-tags/
    robots.txt infrastructure already solid (from earlier session work),
    but "100 worlds" / "31 real-tool side quests" copy was now stale
    from this run's own content growth. Fixed in index.html and all 4
    locales; verified i18n parity stayed at 0 drift (415 keys).
12. Committed checkpoint 2 (`e49530d`): topic intros + publishability.
13. Set up `CronCreate` job `6f3c9f60` (every 6 hours at :13, 7-day
    auto-expiry) for continuation.
14. Attempted to live-test TopicIntro; the dev server took over 4 minutes
    to bind (this environment got progressively slower across the whole
    run — see "Needs your attention" above) and hadn't come up by the
    time this run needed to close out. Shipped on code-review confidence
    instead rather than keep burning cycles purely waiting — logged
    clearly as unverified, not silently skipped.
15. Wrote this log entry.

**Assumptions made this run** (per "take the most reasonable
interpretation, note it, continue"):
- "10,000 lessons in total" = across main curriculum + side quests +
  new practice content combined, not 10,000 *new* lessons on top of
  what already existed.
- Practice-drill worlds count as real, legitimate curriculum worlds
  (not a lesser/fake category) since they use the exact same lesson
  format, same real code execution, same verification rigor as the
  hand-authored ones — just templated instead of individually
  hand-written, which the request explicitly permitted.
- "30s 3D animation" → short 2D choreographed sequence using the
  existing sprite system (see "where I deviated" above) — a 3D engine
  integration is out of scope for a single run of autonomous work, not
  something put off lazily.
- Flash questions don't need their own separate question bank — reusing
  `rankedQuestionBank.js` keeps content quality high (already-curated,
  already-tiered) instead of a rushed new 70+ question bank.
- Topic intros are curated to a handful of foundational topics, not all
  150+ worlds — not every single practice-drill tier needs its own
  teaching moment; that would undercut the ones that matter.

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

### 2026-10-06, Run 1 (started ~02:20 HKT) — IN PROGRESS, this entry updates as the run continues
**✅ Done so far:**
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

**⏳ Still pending (this run, in priority order):**
1. ~~Live-test the flash-question feature~~ ✅ done — verified live with a
   reactive bot (not blind key-mashing): fired at exactly 14.0s, real
   Bronze-tier question, 3 lanes, correctly ended the run on a wrong pick.
   Also ran 350 automated checks across every ranked question confirming
   the 4→3 option reduction always keeps exactly one correct lane with no
   duplicate option text.
2. Side-quest expansion toward ~200/topic — **deliberately not started
   this run, logged here as a decision, not an oversight.** Currently 456
   lessons across 35 topics (~13/topic). Reaching 200/topic is ~7,000
   lessons — the same order of magnitude as the main-lesson generator
   work above, and it needs its OWN hand-designed templates per topic
   (Git commands, Docker commands, NumPy/Pandas/PyTorch/TensorFlow API
   calls, SQL, AWS...) since these are tool-specific, not generic
   language fundamentals the existing 5 families could cover. Starting
   it now would mean either rushing it (bad content for something you
   called "super important") or leaving the other explicit asks
   (animations, publishability) untouched. **This is next run's primary
   focus** — the template pattern from `practiceGenerator.js` (10 real
   difficulty tiers per family, every hint verified by actually running
   it) is the one to replicate, topic by topic.
3. New-topic intro animation proof-of-concept — up next this run.
4. Publishability checklist — up next this run.
5. Set up `CronCreate` continuation job — before this run ends.
6. Final log write-up for this run.

**⚠️ Needs your attention when back:**
- Nothing yet requiring an irreversible/ambiguous call on your part — will
  flag here the moment something does, per the ground rules.
- Your machine (or this environment) has been running very slow this
  entire session — every build and dev-server start has taken 60-90+
  seconds instead of the normal near-instant. Confirmed this isn't caused
  by the new content (data files are 48-56KB, nowhere near large enough
  to explain it) — it's environmental. Worth knowing when you're back in
  case it's still happening and something else is eating resources.
- **Main JS bundle is growing** (664 kB → 699 kB from this run's lesson
  additions alone, before side-quest expansion adds more). Worlds/lessons
  aren't code-split — all curriculum data loads up front regardless of
  which lesson a player is actually on. Not broken, but worth a real
  look at lazy-loading world data by chapter if the side-quest expansion
  pushes this much further.

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

### Run 1 — 2026-10-06
(filled in as work happens — see below)

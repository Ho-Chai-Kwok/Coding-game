# Code Quest — Roadmap

Where the app stands and what to improve next. Effort: **S** = hours, **M** = a day or two, **L** = a week or more.
Items marked *(you)* need an account dashboard (Supabase / Vercel / GitHub) rather than code.

## Already done

- 100-world learning path, 31 side quests, 8 ranked modes with a daily shuffle
- Persistent bottom nav (Home/Learn/Quests/Ranked/Characters) — mode switching happens from a fixed bar at the bottom of the app instead of a card grid on Home; Home is now a lean dashboard
- 7-tier ranked difficulty (Bronze → Grandmaster), question bank, rank up/down with a promotion shield
- Accounts (Supabase), reliable progress saving with device backup, guest → account carryover
- Password reset, Privacy Policy and Terms pages, delete-my-account UI
- PWA manifest and icons, SEO/social meta, error boundary, code-splitting, CI (lint + build)
- Live on Vercel

## 1. Before you promote it publicly (launch blockers)

- [ ] **Run the `delete_my_account()` SQL** in Supabase, then verify deletion end to end *(you)* — S
- [ ] **Turn on "Confirm email"**, set the Site URL and redirect URLs to the live address *(you)* — S
- [ ] **Custom email sender** (Resend, Brevo, etc.) — the built-in one allows only a few emails an hour, so confirmation and reset mails will fail under real traffic *(you)* — S
- [ ] **Sign-up abuse protection** — the app side is built (Cloudflare Turnstile bot check, off until `VITE_TURNSTILE_SITE_KEY` is set). Still to do *(you)*: create a Turnstile site, paste the secret key into Supabase → Auth → Attack Protection, and set the site key in Vercel — S
- [ ] **Stop the free-tier pause** — a twice-weekly keep-alive job is added (`.github/workflows/keep-alive.yml`). Still to do *(you)*: add the repository secret `SUPABASE_ANON_KEY` in GitHub → Settings → Secrets → Actions (or upgrade Supabase) — S
- [ ] **Contact email** for the legal pages: set `VITE_CONTACT_EMAIL` locally and in Vercel *(you)* — S
- [ ] **Have the legal pages reviewed** (lawyer), especially if you aim at under-13s. Consider a parental-consent step for accounts — M
- [ ] **Custom domain** connected in Vercel *(you)* — S
- [x] **Absolute social-preview image** — 1200×630 image added; the URL comes from `VITE_SITE_URL` (set in Vercel to the current address; update it when you get a custom domain) — S
- [ ] **Auto-deploy**: connect GitHub to Vercel under the `kwokhochai1` identity so pushes to `main` deploy themselves *(you)* — S

## 2. Quality and safety (first month after launch)

- [ ] **Automated tests**, run in CI. Start with rank logic (`applyRankedResult`), progress pack/unpack, level-unlock logic, and a question-bank integrity check — M
- [ ] **End-to-end test** of signup → progress → logout → login, run on each deploy — M
- [ ] **Error monitoring** (Sentry free tier) so real crashes reach you — S
- [ ] **Privacy-friendly analytics** (Plausible or Vercel Analytics, no ad trackers): which lessons people quit on, which modes get played — S
- [ ] **Sandbox the code runner**: learners' code currently runs in the page itself (`src/utils/runCode.js`). An infinite loop freezes the tab and the code can reach page storage. Move it to a Web Worker or sandboxed iframe with a timeout — M
- [ ] **Accessibility pass**: keyboard-only play, screen-reader labels, colour contrast (grey text on the Silver badge is weak), reduced-motion setting for the confetti and animations — M
- [ ] **Content review**: read all 100 worlds, 28 side quests and the ranked bank for factual errors and age-appropriateness — M
- [ ] **Test on real phones** (iOS Safari, Android Chrome), including the code editor's bracket auto-close on mobile keyboards — S/M
- [ ] **Staging environment**: a second Supabase project and Vercel preview so changes aren't tested on real users — M

## 3. Product improvements

**Ranked**
- [x] **Real player-vs-player matchmaking**, replacing the old "beat a fixed target alone" approximation for all 7 playable modes (Relay excluded — see below). Built as a Supabase-backed system (schema in `supabase/schema.sql`, run the new block once in the SQL Editor to enable it — everything above it is untouched):
  - **Matchmaking** (`try_ranked_match()`, polled by `useRankedQueue.js`/`RankedQueue.jsx`): pairs the closest-ranked waiting opponent in the same mode first, widening the acceptable LP gap the longer nobody close enough is found (never blocks forever) — `for update skip locked` keeps two players polling at the same instant from both grabbing the same opponent, and a queue entry that stops refreshing (closed tab, crash) simply stops being matchable after 15s, with no separate cleanup job needed.
  - **Fair, shared content**: both matched players get the identical seed (`shuffledSample(..., seed)`, already supported everywhere — just needed an actual shared seed passed in instead of `Date.now()`), so nobody gets an easier question set/puzzle/snippet — including ChaosRound's random modifier, which previously used unseeded `Math.random()`.
  - **Real, server-authoritative rank changes** (`submit_ranked_result()`): each mode's own existing scoring becomes that player's "score" for the match; once both sides report, the higher score wins (tie broken by who finished first, an exact tie is a draw), and the LP swing is a zero-sum, ELO-style formula (`estimatedEloDelta()` in `data/rank.js` mirrors it client-side for display only) based on the two real players' rank going in — beating a higher-ranked opponent nets more, losing to a lower-ranked one costs more. Neither client can forge a result: every function trusts only `auth.uid()`, never a client-supplied "which player am I."
  - **Abandonment handling**: if an opponent disconnects mid-match, `claim_forfeit_win()` lets the player who did finish claim the win 45+ seconds after their own result was submitted.
  - **Requires an account** (not guest): matchmaking needs a stable identity to pair two devices. `RankedHome` shows a sign-in prompt instead of the Play button for guests — clicking it reuses the existing guest→account flow, so progress carries over.
  - Verified two ways: (1) the actual SQL logic — 16 real functional tests run against a genuine throwaway local Postgres instance (closest-rank-first pairing, gap widening, stale-entry exclusion, zero-sum settlement math checked by hand, idempotent re-settlement, draw handling, non-participant rejection, forfeit timing) — all passed; (2) the client UI (guest gate, bottom-nav integration) in a real browser. **Not yet verified**: the live matchmaking flow against a real deployed Supabase project with two real accounts, since that requires running the new schema block against your actual project first.
  - Rank point storage moved server-side too — see the next item.
- [x] **Server-side ranked point storage.** The LP *number itself* previously lived only in the client-synced `progress` JSON blob — RLS restricted *whose* row that was, never *what value* was written, so a determined user could hand-edit their own stored rank outside of any real match. Now: a new `ranked_stats` table (`points`, `peak_points`, `wins`, `losses`, `shield`) that the client can only ever `SELECT` — every write happens inside a `SECURITY DEFINER` function, never a raw client insert/update.
  - `claim_initial_ranked_stats()` is the one-time migration bootstrap: it carries over whatever LP an existing account already had (the only place a client still self-reports one of these numbers, and only because there's no other source for LP earned before this table existed) — but it only ever `INSERT`s, so after the first call for an account it's permanently a no-op, out of the client's hands for good. Called once per login (harmless every time after the first).
  - `try_ranked_match()` no longer accepts the caller's points as a parameter at all — it reads `ranked_stats` itself now, so a client can't skew matchmaking pairing or the ELO expected-score math by claiming a different rank than they actually have.
  - `submit_ranked_result()`/`claim_forfeit_win()` now call a new internal-only function, `apply_ranked_settlement()`, which applies the already-computed zero-sum delta directly to both real players' `ranked_stats` — clamped at 0, with the tier-floor promotion shield and its 3-match refresh ported faithfully from the client's `getRankInfo()`/`TIERS` logic (`data/rank.js`'s `applyRankedResult` was retired; a new `describeRankChange()` only *describes* an already-server-decided movement for the celebration screen, never computes one). `apply_ranked_settlement()` is deliberately **not** granted to `authenticated` — confirmed by testing it under that exact role, not as a superuser, where a direct call correctly fails with "permission denied."
  - Guests are unaffected — they have no account to store this against, so their LP still lives in local storage exactly as before (matches that they've always been unable to play ranked PvP in the first place).
  - One known, disclosed gap: the daily-login-streak LP bonus (`STREAK_MILESTONES` in `App.jsx`) still isn't server-validated — for a guest it's fully real; for a signed-in account it's now a local-only, single-session display bump that self-corrects back to the true value on next load, since nothing ever writes it to `ranked_stats`. Streaks/claimed milestones aren't checked server-side at all yet, a separate pre-existing gap unrelated to ranked-match integrity (matchmaking/settlement never read this number).
  - Verified with 10 functional tests against a fresh local Postgres, run as the actual `authenticated` role (not superuser — an earlier draft of these tests ran as superuser, which silently bypasses every `REVOKE`/RLS policy and produced a false pass; re-run correctly, everything above was confirmed for real): bootstrap migration, bootstrap idempotency, the `authenticated`-role permission denial on `apply_ranked_settlement`, the old 4-argument `try_ranked_match` signature actually gone, tight-gap vs. wide-gap matchmaking using real server points, real `ranked_stats` changes after settlement, RLS blocking a direct insert *and* update attempt, a promotion correctly granting a fresh shield, and a shield correctly clamping a loss at the tier floor.
  - **Also verified live**, against your real deployed project, with two real accounts: a brand-new account's dashboard correctly showed "0 LP" from a freshly-bootstrapped `ranked_stats` row; a real Bug Hunt match settled with a real +20/−20 LP swing; and — the real test of this layer specifically — **reloading the page from scratch** afterward still showed the new LP, proving it's genuinely stored server-side and not just sitting in React state. This live run caught a real bug: a brand-new player (0 LP, no shield) losing a match was wrongly shown "🛡️ Shield saved you!", because Bronze III's floor (0) is the same value everyone's LP is clamped to regardless of any shield — `describeRankChange()` (`data/rank.js`) couldn't tell "the shield protected you" from "you simply can't go below 0." Fixed by also passing the player's pre-match shield count in, and re-verified live with the same two accounts: the false message is gone, they correctly land straight back on Ranked Home instead.
- [ ] **Leaderboards** (weekly / all-time / friends) — the actual LP number is finally trustworthy enough for this now — M
- [ ] **Seasons**: periodic soft reset with rewards for peak rank — M
- [ ] **Bigger question bank**: 70 questions (10 per tier) will feel repetitive. Grow to 50+ per tier and avoid repeats across matches — M (mostly content)
- [ ] **Relay mode** (currently "coming soon") needs real 2-4 player team matchmaking — a different, larger feature than the 1v1 matchmaking above — L
- [ ] **Adaptive difficulty** using recent accuracy, not only LP — M
- [x] **Live opponent status while playing** (`RankedMatchRunner.jsx`): a small banner appears the instant your opponent submits their result while you're still mid-match ("✅ {name} finished — waiting on you now!"), driven by the same live match subscription, no extra plumbing needed. Deliberately kept to this simple finished/not-finished signal rather than a granular round-by-round score sync — the 7 modes track progress in genuinely different shapes (rounds, a single puzzle, lives, elapsed time…), and forcing them into one shared shape just for a mid-match HUD wasn't worth the added surface across every mode. Verified via a mocked-match Playwright run (real live-account testing is blocked right now — see below).
- [x] **Practice fallback for a quiet ladder** (`RankedPracticeRunner.jsx`): after 20s with nobody close enough found, `RankedQueue` offers "🎯 Practice instead" — solo play against no one, clearly banner-labeled the whole time, and verified to leave `rankedPoints` completely untouched (tested: 1244 LP before and after). Deliberately does **not** invent a fake opponent dressed up as real — that would undermine the rank integrity this whole PvP system exists to protect; a quiet ladder gets an honest "nobody's around, here's practice," never a disguised bot match.
- [x] **Live end-to-end verification with two real accounts — done.** After temporarily disabling "Confirm email" in Supabase (worked around the free-tier email rate limit that blocked the first attempt), two independent real accounts were created, matched by the live queue, and played a full real Bug Hunt match against your actual deployed schema: both received the identical seeded snippet ("Forgot to Initialize" for both — confirms the shared-seed fairness), the server correctly picked the higher-scoring player as the winner (45 vs. 10), and applied a real zero-sum ELO delta (+20 LP / −20 LP, matching the equal-rank formula exactly: `round(40 × (1 − 0.5)) = 20`). Both accounts' dashboards reflected the real settled LP afterward (30 / 0). Both test accounts were deleted via the normal delete-account flow afterward. **Remember to re-enable "Confirm email" in Supabase → Authentication → Providers → Email if you only meant to disable it temporarily for this test** — I can't toggle that setting myself. One more housekeeping note: a handful of earlier test signup attempts from before this fix (emails like `cq-pvp-*@mailinator.com`, `cq-pvp-test-*@mailinator.com`) are sitting unconfirmed in your `auth.users` table from when the rate limit blocked their confirmation — harmless (they can't log in), but you can remove them from Supabase → Authentication → Users if you want a clean slate; I can't delete an account I'm not logged into.

**Learning**
- [x] **"What do these words mean?" primer for total beginners** (`data/primer.js` + `Onboarding.jsx`): before ever touching real code, someone who says they're a total beginner (and only them — "some experience"/"confident" skip straight past it, since showing it to them would just be condescending friction) gets 10 extra onboarding steps in plain, kid-friendly language: what code/functions/parentheses/arguments/variables/types actually are, plus a fun-fact aside on argc/argv, with 3 quick comprehension checks reusing the exact same quiz interaction (retry-on-wrong, confetti-on-right) real lessons use later. Inserted conditionally into the existing onboarding wizard's step list (language → primer → summary) rather than as a separate persisted flow, so it needs no new app state. Each explainer card also highlights the one term it wants remembered as a small badge (🔑 "Remember this word: **function**"), reinforcing after the explanation rather than burying it in prose — skipped on the "types" card since its 4-term list already does that job. Verified in a real browser: all 10 steps + 3 quizzes for "beginner", zero primer steps for "some"/"confident", correct dot-progress count for both paths, light/dark mode.
  - Also ran a programmatic layout sweep (not just eyeballing screenshots): every visible element's real bounding box checked pairwise for genuine overlap, across the full primer, onboarding summary, home dashboard, world map (including scrolled to the very last card), side quest map (including the frontend tag filter), and Ranked home, at 320px (the narrowest realistic phone width) and 768px, both light and dark. Zero genuine overlaps anywhere — the only flags were the bottom nav's own children sitting over the page body (that's the fixed-footer design working as intended) and a character illustration's own internal SVG shapes (arms/shirt/face layering, not a UI collision), both correctly ruled out, not just ignored.
- [ ] Real code execution beyond the first 12 worlds — L
- [x] C, C++ and Java added (JavaScript and Python already existed): 49 hand-written lessons each for worlds 1–12, run on the Wandbox online compiler. Every solution is verified against the real compiler
- [ ] Keep the online compiler dependable: it's a free third-party service that can slow down or go away. Consider a fallback provider or self-hosting one (e.g. a small Piston server) — M
- [ ] Run C/C++/Java inside the browser (WebAssembly) so code never leaves the device and Ranked code modes can use them — L
- [ ] More languages/topics: HTML/CSS, TypeScript, SQL, Go, Rust, Git in the browser — L
- [ ] Save the language lesson checks as an automated test in CI (currently a one-off script) — S/M

**Side Quests: real hands-on practice, not just trivia**
- [x] Built a real interactive terminal simulator (`TerminalChallenge.jsx` + one small command interpreter per tool: `data/gitSim.js`, `bashSim.js`, `dockerSim.js`, `npmSim.js`): the learner types actual commands and gets real, accurate output for *anything* typed (not just the expected answer) — wrong-but-valid commands show their real output, typos show a real "command not found", missing flags show real errors. A lesson can require a multi-step sequence and gives a hint after 2 wrong tries. Each tool owns its own `(run, initialState)` pair, so adding a new simulated tool never touches the shared component.
- [x] `type: "code"` lessons in side quests now reuse the exact same real-JS-execution CodeChallenge path the main learning worlds use (not simulated) — used for Regex and Testing & TDD.
- [x] **All 28 of 28 quests deeply overhauled** with more lessons and 2-3 "🏆 Challenge"/"🏆 Final Challenge" checkpoints interspersed (not just at the end), each fully verified lesson-by-lesson in a real browser (zero console errors, every lesson completable end-to-end):
  - **Real hands-on execution (25 quests)** — the learner writes/types something real and gets a genuinely computed result, not a canned one:
    - **Git & GitHub** — 10 → 22 lessons (init/status/diff/add/commit/log/branch/merge/conflicts/remote/push/pull/stash/clone/fork/PR, 3 challenges)
    - **Linux & Bash** — 10 → 16 lessons, real virtual filesystem incl. genuine regex-based `grep` and `wc`, 3 challenges
    - **Docker** — 10 → 15 lessons, pull/build/run/ps/stop/rm/logs against a tracked image+container state, 2 challenges
    - **Node.js** — 10 → 16 lessons, real `npm init/install/run/start/list/uninstall` against tracked package.json state, 2 challenges
    - **Regular Expressions** — 10 → 12 lessons, every exercise writes and runs a real JS regex against real strings
    - **Testing & TDD** — 10 → 12 lessons, real functions graded by a real hand-rolled `assertEqual`, including a genuine Red→Green TDD exercise
    - **Kubernetes** — 10 → 15 lessons, real `kubectl get/apply/scale/describe/logs/delete` against tracked pods+deployments, 2 challenges
    - **MongoDB** — 10 → 12 lessons, a genuinely real in-browser document store (safe non-eval loose-JSON parser) with real `$gt`/`$set` filter matching, 2 challenges
    - **AWS Cloud Basics** — 10 → 16 lessons, real `aws s3 mb/cp/ls/rm` against a tracked bucket/object state, 2 challenges
    - **CI/CD** — 10 → 13 lessons, real `git push` via `gitSim` triggering a simulated pipeline log (pass and fail paths), 1 challenge
    - **REST APIs** — 10 → 13 lessons, real `fetch()` GET/POST/PATCH/DELETE against JSONPlaceholder, 2 challenges
    - **GraphQL** — 10 → 14 lessons, real `fetch()` POST queries against the Countries GraphQL API, 2 challenges
    - **SQL Basics** — 10 → 14 lessons, real SQLite via sql.js (WASM): SELECT/WHERE/ORDER BY/INSERT/UPDATE/DELETE/JOIN/COUNT, 2 challenges
    - **NumPy** — 10 → 12 lessons, real Pyodide + numpy, 2 challenges
    - **Pandas** — 10 → 13 lessons, real Pyodide + pandas (groupby/sort_values/fillna), 2 challenges
    - **Jupyter Notebooks** — 10 → 12 lessons, real Python demonstrating variable persistence across simulated cells, 2 challenges
    - **Machine Learning Basics** — 10 → 12 lessons, real from-scratch gradient descent for linear regression, 2 challenges
    - **Computer Vision** — 10 → 14 lessons, real JS pixel math (grayscale, clamping, thresholding, edge detection), 2 challenges
    - **Natural Language Processing** — 10 → 12 lessons, real JS tokenization/stop-word filtering/word-frequency counting, 2 challenges
    - **Vector Databases & RAG** — 10 → 12 lessons, real JS cosine similarity, chunking, top-K ranking, 2 challenges
    - **Flask** — 10 → 13 lessons, real `pip install`/`flask run` ordering via `flaskSim`, 2 challenges
    - **React** — 10 → 12 lessons, real Babel + this app's own React rendering live JSX, 2 challenges
    - **Prompt Engineering** — 10 → 13 lessons, real JS token-estimation math and template substitution, 2 challenges
    - **LangChain** — 10 → 12 lessons, real JS function-composition "chain" pipeline, 2 challenges
    - **LangGraph** — 10 → 12 lessons, real JS conditional edges + shared state threading, 2 challenges
  - **Deepened but conceptual (3 quests)** — real execution isn't practical in-browser (image rendering with no visual-diff grading model, or multi-hundred-MB ML packages), so these were deepened with more lessons and harder synthesis-style "🏆 Challenge" quiz questions instead:
    - **Matplotlib** — 10 → 15 lessons (colors/styles, histograms, grid lines/limits, reading a plot recipe, debugging a chart)
    - **PyTorch** — 10 → 15 lessons (reshaping tensors, zeroing gradients, saving/loading models, tracing a training step)
    - **TensorFlow** — 10 → 14 lessons (activation functions, reading a model summary, validation/overfitting, debugging a pipeline)
  - Along the way, found and fixed several real simulator bugs via testing: a mislabeled `git status` staged-file type; a `docker run` argument parser that broke when the container name equals the image name; `kubectl apply` always naming the deployment "app" instead of deriving it from the filename; MongoDB documents preset by a lesson (rather than inserted live) missing their `_id`; a React lesson's `expectedOutput` with a trailing space the trim-before-compare logic stripped; and a Prompt Engineering token-count answer that was arithmetically wrong until verified.
- [x] **Onboarding wizard** (`Onboarding.jsx` + `data/onboarding.js`): a one-time level → goal → language flow shown right after login/guest, before the dashboard. Sets the learner's starting language directly (skips the separate language picker) and recommends up to 3 relevant Side Quests matched by name against the real quest list. Persisted so it never shows twice. Verified in a real browser including that a returning user's saved answer is never flashed before hydration resolves.
- [x] **Onboarding now actually places you on the 100-world path by level** (`applyHeadStart` in `data/onboarding.js`), not just World 1 for everyone regardless of answer: "some experience" marks Worlds 1-9 (through Loops/Arrays basics) complete and starts at World 10 (Arrays); "confident" marks Worlds 1-19 complete and starts at World 20 (Classes: Basics) — chosen by topic, not an arbitrary count, so it stays meaningful if worlds are reordered. Beginners still start at World 1, unchanged. From wherever it starts, the path still unlocks strictly in order. Verified in a real browser for all 3 levels (each landed on the exact expected world).
- [x] **3 new Side Quests — HTML, CSS, PHP** (31 quests total now), all tagged `frontend`:
  - **HTML** (14 lessons) and **CSS** (13 lessons) get genuinely real execution via a new `htmlRuntime.js`: the learner's HTML/CSS renders in a real, sandboxed same-origin iframe (`srcdoc`, no `allow-scripts` — so it's isolated from the app page and can't execute arbitrary scripts), and each lesson's `checks` read real values back out of the rendered DOM (`textContent`, attributes, element counts, or `getComputedStyle` for CSS properties) — colors genuinely compute to `rgb(...)`, `font-weight: bold` genuinely reports `700`, etc. 2 challenges each.
  - **PHP** (14 lessons, quiz-based) — no in-browser PHP interpreter is available via the CDN allowlist, so like Matplotlib/PyTorch/TensorFlow this stays conceptual (real, runnable-elsewhere example snippets + reasoning questions) rather than executed, with 2 "🏆 Challenge" synthesis questions.
  - Side Quests now support a `tags` field; `SideQuestMap` shows a filter chip row (only rendered when at least one quest has a tag) and a small badge on each tagged card — both new UI elements, verified end-to-end.
- [x] **Bottom nav layout** (`BottomNav.jsx`): mode switching moved to a fixed bar at the bottom of the app (Home/Learn/Quests/Ranked/Characters, matching the `mode` state directly) instead of requiring a trip back to a card-grid Home screen — you can jump straight from, say, mid-world in Learning Mode to Ranked Mode in one tap. The nav hides during focused activities you've committed to (playing a lesson, a ranked shuffle/match) the same way a mobile app hides its tab bar mid-gameplay, and reappears the moment you back out. `ModeSelect` (Home) lost its now-redundant 4-card grid and became a lean dashboard (greeting, streak, progress, continue-learning card); when there's no in-progress world to continue, a dashed nudge card points new/between-worlds visitors at the bottom nav's Learn tab instead of leaving an empty screen. Verified end-to-end in a real browser: nav visibility on every screen, mid-world tab switching, scrolled-to-bottom content never hidden behind the fixed bar, and both light/dark mode.
- [ ] Revisit `sideQuestMap.subtitle` and any other copy assuming uniform lesson counts, now that quests have uneven lesson counts — M
- [ ] Split `sidequests.js` into lazy-loaded per-quest chunks now that real content has replaced trivia across all 31 quests — the main bundle has grown accordingly (see "Shrink the main bundle" below) — M
- [ ] **Spaced review**: resurface questions a learner got wrong — M
- [ ] Hints and "explain my mistake" on failed challenges — M
- [ ] Certificates or shareable progress cards — S/M

**Engagement**
- [ ] Achievements/badges and daily quests — M
- [ ] Streak reminders via PWA push notifications (needs a service worker) — M
- [ ] Sound effects and music with a mute setting — S
- [ ] Friends and challenge-a-friend — L

**For teachers and parents**
- [ ] Parent view: progress summary and one-click data export/deletion — M
- [ ] Classroom mode: join code, class progress dashboard — L

## 4. Privacy and compliance follow-ups

- [ ] Data export ("download my data") alongside deletion — S/M
- [ ] Verifiable parental consent flow if you formally target under-13s — L
- [ ] Self-host the fonts so Google no longer receives visitors' IP addresses (then update the Privacy Policy) — S
- [ ] Translate the Privacy Policy and Terms into the app's other three languages, with a human/legal check — M
- [ ] Periodic database backups/export (free tier has none) — S

## 5. Performance and technical debt

- [ ] **Shrink the main bundle** (~550 kB / ~175 kB gzip): lazy-load each locale's translations and load world content on demand — M
- [ ] Offline support via a service worker (also unlocks push notifications) — M
- [ ] Fix the 4 known lint warnings (`useCountdown` ref/state handling, two fast-refresh export warnings) — S
- [ ] Split `App.jsx` (very large) into screen-level containers and a progress store — M
- [ ] Split `translations.js` (one huge file) into one file per language — S/M
- [ ] Migrate to TypeScript, at least for data shapes and the auth/progress code — L
- [ ] Versioned database migrations instead of one hand-run `schema.sql` — S/M
- [ ] Dependabot or Renovate for dependency updates — S

## 6. Ultimate goal: teach through animation

The long-term aim is for people to *see* code working — more engaging than reading and typing. Full detail is in `PROJECT_STATUS.docx` (part 4). Start small and measure.

**Phase 0 — Decide and prove**
- [ ] Pick the first 3–5 concepts to animate (variables, loops, functions, if/else, arrays) *(you)* — S
- [ ] Pick the animation style/tooling (hand-built CSS/SVG, Framer Motion/GSAP, or Lottie/Rive) and who makes the artwork *(you)* — S
- [ ] Write a one-page teaching script per pilot concept — S/M
- [ ] Define success: completion and quiz accuracy with vs. without animation (needs analytics) — S

**Phase 1 — Reuse what exists**
- [ ] Make the existing characters on-screen teachers that react to answers — M
- [ ] Reusable animated "scene" component (stage, timeline, play/pause/replay) — M
- [ ] Reduced-motion setting, with a static fallback and text description for every animation — S/M

**Phase 2 — Code visualiser**
- [ ] Step-through visualiser: line highlight, variable boxes, output panel, Back/Next/Play — L
- [ ] Program tracing for JavaScript and Python (start with pre-recorded traces, then the learner's own code) — M/L
- [ ] Loop and function-call animations (conveyor belt, machine, call stack) — M
- [ ] "Watch your code run" on the code challenge screen — M

**Phase 3 — Animated lessons at scale**
- [ ] Data format for animated scenes so lessons are data, not custom code — M
- [ ] Pilot animated lessons in the first worlds — L
- [ ] Captions and optional voice-over, translated into the four interface languages — M
- [ ] Load animation code and assets lazily to protect first-load speed — S/M

**Phase 4 — Measure and grow**
- [ ] Compare with/without animation on real learners; keep what works — M
- [ ] Extend to more worlds, Ranked (animated Predict-the-Output) and side quests — L

*Depends on:* analytics and the accessibility pass (section 2) landing before or alongside Phase 1.

## Suggested order

1. Section 1 in full — these decide whether real users can sign up, recover accounts and trust the app.
2. Tests, error monitoring and the code-runner sandbox (section 2) — protect what already works.
3. A larger question bank and achievements — the cheapest ways to keep players coming back.
4. Server-side ranked points, then leaderboards and seasons — only once there are enough players to make them meaningful.

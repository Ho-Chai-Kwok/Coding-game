# Code Quest — Next Stage Plan & Open Work

- **Date:** 2026-10-13, 16:30 HKT
- **Based on:** the independent re-test in `QA_REPORT.md` → "Verification round 1". No source files have changed since that re-test.
- **Detail lives in `QA_REPORT.md`.** This file says *what is left and in what order*. Each ID (CQ-xx) has its evidence, fix and "Done when" checks there.

---

## How an AI agent should use this file

1. Work **one stage at a time, in order**. Don't start a stage until the previous stage's **exit check** passes.
2. For each item, open its section in `QA_REPORT.md` and meet every "Done when" box.
3. Run `npm run lint && npm run build` and all `scripts/verify-*.mjs` after each fix.
4. At the end of each stage, **stop and ask for independent re-verification** before marking items done. Last round, two items were reported "fixed" but were only partly fixed.
5. Items tagged **(owner)** need a human decision or a dashboard/legal action. Don't guess these; list them in your hand-off message.

---

## 1. Where things stand

| Status | Items |
|---|---|
| ✅ Verified fixed | CQ-02, CQ-03, CQ-04, CQ-05, CQ-07 |
| 🟡 Partly fixed | **CQ-01**: JS sandbox done; Python and React runtimes still unsafe (**CQ-01b**). **CQ-06**: display-name filter built but buggy (**CQ-06b**); age gate not built |
| ⬜ Not started (code) | CQ-01c, CQ-09, CQ-10, CQ-11, CQ-12, CQ-14, CQ-15, CQ-16, CQ-17, CQ-18, CQ-19, CQ-20 |
| ⬜ Waiting on owner decision | CQ-06 age gate, CQ-08 curriculum shape, CQ-13 target age, CQ-21 parent lock |
| ⬜ Owner dashboard/legal tasks | 11 items (see Stage 2) |

**Launch readiness**

| Audience | Ready? | What's blocking |
|---|---|---|
| Closed beta (teens and adults, invited) | **No** | Stage 1 |
| Public launch (any age) | **No** | Stages 1–3 |
| Marketed to under-13s / schools | **No** | Stages 1–3, the age-gate decision and legal review |

---

## 2. What is not done

### 2a. Code: still a launch blocker (P0)

| ID | Problem in one line | Main files |
|---|---|---|
| CQ-01b | Python `while True:` freezes the tab; `import js` can wipe progress; React lessons run on the main thread | `src/utils/pyRuntime.js`, `src/utils/reactRuntime.js` |
| CQ-06b | Name filter rejects "Grape", "Skyscraper", "Scunthorpe"; the DB lets `mysite.com` through (`\b` vs `\y`); an unsafe name at sign-up gives "Database error saving new user"; `schema.sql` aborts if an existing row already violates the new check | `src/utils/displayName.js`, `supabase/schema.sql`, `src/components/AuthGate.jsx` |

### 2b. Code: important (P1)

| ID | Problem in one line |
|---|---|
| CQ-09 | Text size can't be enlarged (px fonts, 13–14px labels and editor) |
| CQ-10 | Keyboard trap in the code editor; editor has no label; nav contrast 2.62:1; no `<main>` landmark or `<h1>` on lessons |
| CQ-11 | Browser language ignored (a `zh-HK` visitor gets English); lessons are English-only |
| CQ-12 | Beginner primer is 13 steps, includes argc/argv, and has no skip |
| CQ-08 *(owner + code)* | 9,250 of 9,577 main-path lessons are generated drills; lesson and world counts contradict each other across the app, README and meta tags |

### 2c. Code: polish (P2)

| ID | Problem in one line |
|---|---|
| CQ-01c | A slow `fetch` over 3 s shows the misleading "infinite loop" message |
| CQ-14 | Copy: "← Modes", "Continue →" on a game never played, "1 more days", "LP" unexplained |
| CQ-15 | "Continue as Guest" is a small link; it should be the main button |
| CQ-16 | Python's first run downloads about 5.4 MB with no loading message |
| CQ-17 | Kernel Dash needs on-screen buttons and an easy speed |
| CQ-18 | Main JS chunk is 905 kB (281 kB gzip) |
| CQ-19 | No unit tests or e2e tests in CI (only lint, build and verify scripts) |
| CQ-20 | 1 high npm audit finding; 7 lint warnings |
| CQ-21 *(owner)* | Optional parent lock on Settings |

### 2d. Owner-only (no code; dashboards and legal)

| # | Task | Blocks |
|---|---|---|
| O1 | Decide the age policy: block under-13 sign-ups, or build parental-email consent (CQ-06) | Public launch |
| O2 | Decide where the 50 drill worlds go: main path vs optional "Practice Gym" (CQ-08) | CQ-08 code |
| O3 | Decide the target age: "8+" vs a pre-reader mode for ages 3–6 (CQ-13) | Marketing copy |
| O4 | Run the updated `supabase/schema.sql` on the live DB, **only after CQ-06b is fixed** | Ranked name safety |
| O5 | Run the `delete_my_account()` SQL and test account deletion end to end | Public launch |
| O6 | Supabase: turn on "Confirm email" and set the Site URL and redirect URLs | Public launch |
| O7 | Set up a custom email sender (Resend, Brevo, etc.) | Public launch |
| O8 | Set up Turnstile keys in Supabase and Vercel | Public launch |
| O9 | Add the `SUPABASE_ANON_KEY` GitHub secret so the free-tier pause is prevented | Beta |
| O10 | Set `VITE_CONTACT_EMAIL` (Settings currently says "Support contact isn't set up yet") | Beta |
| O11 | Deploy the Code Helper Edge Function with an Anthropic API key | Beta (feature) |
| O12 | Legal review of Privacy Policy and Terms (COPPA, and HK PDPO if schools are targeted) | Public launch |
| O13 | Custom domain, then update `VITE_SITE_URL` | Public launch |
| O14 | Connect GitHub → Vercel auto-deploy | Convenience |

---

## 3. Next stages

### Stage 1 — Close the P0 gaps (code, about 1–2 days)
**Do:** CQ-01b, then CQ-06b. Optionally include CQ-01c, since it touches the same runner code.

**Notes for the agent**
- Python: move Pyodide into a Web Worker. Use `worker.terminate()` plus a lazy re-init as the hard stop, unless `SharedArrayBuffer` and the cross-origin headers are already set. Keep `runPythonCode(code, packages) → {logs, error}` unchanged so callers don't change.
- React: do the Babel transform on the main thread, then render inside the sandboxed iframe pattern already used in `htmlRuntime.js`, with a timeout.
- Names: match blocked words on word boundaries in both JS (`\b`) and SQL (`\y`). Add a shared good/bad name table and test it against both in CI. Postgres + psql work in the dev container.
- Migration: add the constraints `NOT VALID`, clean up existing rows, then run `VALIDATE CONSTRAINT`.

**Exit check**
- [ ] Python `while True: pass` gives a friendly timeout and the UI stays responsive.
- [ ] `import js; js.localStorage.clear()` doesn't touch progress.
- [ ] A React lesson containing `while(true){}` times out without freezing.
- [ ] "Grape", "Skyscraper" and "Scunthorpe" are allowed. `kid@mail.com`, `mysite.com` and `91234567` are blocked, **identically in JS and SQL**.
- [ ] Sign-up with an unsafe name shows a friendly inline error.
- [ ] `schema.sql` applies cleanly to a DB that already has a violating row.
- [ ] **Stop and request re-verification.**

### Stage 2 — Owner set-up (human, can run in parallel with Stage 1)
**Do:**
- Before the beta: O9, O10, O11 if you want the Code Helper in the beta, O6 and O7.
- After Stage 1 passes: O4.
- Decide O1, O2 and O3 now, because they shape Stage 3.

**Exit check**
- [ ] A new account can sign up, gets a confirmation email from the custom sender, can log in and can delete itself.
- [ ] The support email shows in Settings.
- [ ] O1, O2 and O3 decisions are written into `README.md`.

➡️ **After Stages 1 and 2: ready for a closed beta with invited teens and adults.**

### Stage 3 — Public-launch quality (code, about 1–2 weeks)
**Order:**
1. **CQ-19**, a minimal version first: Vitest for `progressSerialize` and streak/rank logic, plus Playwright checks for the CQ-01, CQ-04 and CQ-05 repros. This protects everything after it.
2. **CQ-10**, accessibility (axe: 0 critical or serious violations; Tab-only play works).
3. **CQ-09**, text-size setting and `rem` fonts.
4. **CQ-12**, shorter primer with a skip.
5. **CQ-15**, guest as the main button.
6. **CQ-11**, auto-detect locale; label "Lessons are in English".
7. **CQ-08**, implement whatever O2 decided, and make every count computed from data.
8. **CQ-06 age gate**, implement whatever O1 decided.

**Exit check**
- [ ] Every "Done when" box for the items above is ticked.
- [ ] CI runs unit tests, e2e tests and all verify scripts.
- [ ] Owner items O5, O8, O12 and O13 are done.
- [ ] **Stop and request a full re-test** (all 7 personas from the original report).

➡️ **After Stage 3: ready for public launch** (at the age range chosen in O3).

### Stage 4 — Polish after launch
CQ-14, CQ-16, CQ-17, CQ-18, CQ-20, CQ-21, CQ-01c (if not done in Stage 1), then the ROADMAP §2 items: Sentry, privacy-friendly analytics, real-phone testing and a staging environment.

---

## 4. Risks to watch

- **"Fixed" without independent checks.** CQ-01 and CQ-06 were reported done but were only partly fixed. Keep the stop-and-verify step at the end of every stage.
- **Running `schema.sql` too early.** If it runs on the live DB before CQ-06b, sign-ups with names like "Grape" will fail, and the migration may abort.
- **Build-environment stalls.** The coding agent reported multi-minute git and I/O stalls. Keep using `GIT_OPTIONAL_LOCKS=0`. iCloud syncing the Desktop folder is a likely cause: moving the repo out of `~/Desktop` (for example to `~/dev/coding-game`) should help.

---

## 5. Prompt to hand to your coding AI

> Read `NEXT_STAGE.md` and `QA_REPORT.md` in this folder. Do **Stage 1 only** (CQ-01b, then CQ-06b; optionally CQ-01c). Meet every "Done when" box in `QA_REPORT.md` for those IDs, run lint, build and all `scripts/verify-*.mjs`, then stop and summarise what changed so it can be independently re-verified. Do not run `schema.sql` against the live database and do not start Stage 3.

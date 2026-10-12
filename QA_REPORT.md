# Code Quest — Pre-Launch QA Report

- **Date:** 2026-10-13
- **Build tested:** local `~/Desktop/coding-game` (v0.1.0, `npm run build` of the current working tree) and the live site `https://code-quest-kwokhochai1-6781s-projects.vercel.app`
- **Method:** I read the source, ran lint and build, ran scripted checks over all 16,577 lessons, ran automated Playwright play-tests for 7 user types (ages 3 to 80), ran an axe-core accessibility scan, and did a live Python run on the real site.

---

## How an AI agent should use this file

1. Work through the issues **in ID order inside each priority band** (P0 → P1 → P2). Each issue is self-contained.
2. Every issue has **Evidence** (what was observed, so it can be reproduced), **Where** (files), **Fix** (the recommended approach) and **Done when** (acceptance criteria you must verify before you tick it).
3. After every fix, run `npm run lint && npm run build`. Where a "Done when" describes a scripted check, add that check to CI (`.github/workflows/ci.yml`) so it can't regress.
4. Don't change curriculum content by hand when a generator produced it. Fix the generator (`src/data/practiceGenerator.js`) and regenerate.
5. Items marked *(owner)* need a human decision or a dashboard/legal action. Leave a note for those and don't guess.
6. Tick the checklist at the bottom as you go.

---

## Verdict

**Not ready for a public launch aimed at kids yet. It is close to ready for a closed beta with teens and adults once the P0 items are fixed.**

The core loop is solid. It's fast, friendly, it never crashed under abuse, and it really runs code. The blockers are a handful of concrete defects:
- An unsafe code runner: one missing `i++` freezes the tab, and learner code can wipe all progress.
- Python learners are shown JavaScript instructions, and about 10% of Python drills can't be passed.
- The Back button exits the app.
- A layout bug on the first locked screen every new user taps.

The biggest product risk, after those, is the curriculum shape: about 96% of lessons are auto-generated drills.

| Area | Score /5 | One-liner |
|---|---|---|
| Stability | 5 | 350 random taps over 14 screens: 0 JS errors, 0 crashes |
| Core learning loop | 4 | Clear lesson cards, instant feedback, auto-advance |
| Code runner safety | 1 | Infinite loop freezes the tab; code can wipe storage (CQ-01) |
| Python experience | 2 | Runtime works live, but JS text and unsolvable drills (CQ-02, CQ-03) |
| Mobile layout | 3 | Good at 320–1440px, except locked screens (CQ-05) |
| Navigation | 2 | Browser/Android Back leaves the app (CQ-04) |
| Help when stuck | 2 | No hint before running, raw error text, no answer reveal (CQ-07) |
| Accessibility (seniors, keyboard, screen reader) | 2 | Keyboard trap in editor, unlabeled editor, fixed px text (CQ-09, CQ-10) |
| Content quality | 3 | Strong hand-written core, heavily padded by drills (CQ-08) |
| Kids' safety / compliance | 2 | Free-text names in PvP, no parental consent (CQ-06) |

---

## Who was simulated and what they did

| Persona | Setup | What they did | Main result |
|---|---|---|---|
| Toddler (3–5) | Phone 390×844, touch | 350 random taps and double-taps, keyboard mashing in the editor, random Escape | No crashes or errors. Reached Settings, changed the app language to Spanish, and opened the legal pages. Can't use lessons at all: they need reading and typing (CQ-13) |
| Child (6–10) | Phone, beginner, JavaScript | Onboarding → primer → lesson 1 with typical mistakes: wrong case, missing quote, `print()`, trailing space | Onboarding takes 3 taps plus 11 primer taps. Mistakes get "So close!" with no hint about *what's* different. A syntax error shows raw engine text (CQ-07). The primer covers `argc & argv` (CQ-12) |
| Teen (11–17) | Phone, Quests/Ranked/Kernel Dash | Tapped locked Quests and Ranked tabs, played Kernel Dash, opened Code Helper | Locked screens overflow sideways and push the tab bar off-screen (CQ-05). Kernel Dash works. Code Helper correctly asks guests to sign in |
| Adult learner (18–40), Python | Phone + live site | Picked Python, lesson 1 | First instruction says "Use console.log()" (CQ-02). Pyodide first run downloads ~5.4 MB in ~3–5 s, then runs correctly |
| Experienced coder | "Pretty confident" | Head-start, then ran tricky code | Head-start to World 20 works. `while` loop without `i++` froze the tab for over 20 s. `localStorage.clear()` wiped progress (CQ-01) |
| Senior (60–80) | 200% zoom (640×400 CSS px), OS text size 150%, browser Back | Read lessons, used Back | No overflow at 200% zoom. Enlarged OS/root font size is ignored (CQ-09). Browser Back left the app (CQ-04) |
| Keyboard / screen-reader user | Desktop, Tab only, axe-core | Tabbed through Home, Level map, Lesson, Settings | Tab in the editor inserts spaces and can't leave it (keyboard trap). Editor has no label. Nav-label contrast is 2.62:1 (CQ-10) |
| Locale / theme | `zh-TW` browser, dark mode | Fresh visit | Dark mode looks good. Browser language is ignored, so the app starts in English (CQ-11) |

---

## What's good — keep these

- **Guest-first, zero friction.** No login is needed, and a beginner is in lesson 1 within about 15 taps (3 onboarding choices plus the primer). The head-start for "Some experience" and "Pretty confident" works (starts at World 10 or World 20).
- **Real code execution.** JS runs instantly. Python via Pyodide verified on the live site: the first run took ~3–5 s and later runs were fast. The tests found no wrong grades for JavaScript: 1,200/1,200 sampled JS drill hints produce exactly the expected output.
- **Very robust UI.** 350 random taps across 14 screens produced 0 page errors and 0 console errors. The ErrorBoundary was never hit.
- **The learning loop feels good.** Short "Quick Lesson" card plus example, a friendly coach character (Pixel), confetti, and auto-advance to the next lesson (Duolingo-style).
- **Sensible gating.** Side Quests and Ranked stay locked until 10 main lessons are done, so beginners don't land in a timed PvP match.
- **Responsive.** No horizontal overflow on Home or Lesson at 320px, 390px, 1440px or 200% zoom. Dark mode is clean.
- **Privacy posture.** Guest data stays on the device. Export-my-data, delete account, legal pages, and a reduced-motion setting are all present.
- **Code Helper is built responsibly.** It fails closed for guests, has a daily cap of 20 and a turn cap, and uses a kid-appropriate tutor prompt that guides rather than handing over answers.
- **Engineering hygiene.** The build passes, lint has 0 errors (7 warnings), heavy screens are lazy-loaded, and the roadmap is honest and detailed.

---

## P0 — Launch blockers

### CQ-01 · Learner code runs unsandboxed in the page (freeze + data loss)
**Evidence**
- Lesson 1-1, JS: `let i = 0; while (i < 10) { console.log(i); }` (a beginner forgetting `i++`). The page stopped responding for over 20 s. Even the Run click never returned. The only way out is killing the tab.
- `localStorage.clear()` in a lesson, then reload: all guest progress gone and the user is back at the login screen. `document.title = "pwned"` and `document.body.innerHTML = ...` also work.
- `print("Hello")` in **JS** mode (a common Python habit) calls `window.print()` and opens the browser's print dialog. `alert()` and `confirm()` would block the page the same way.

**Where:** `src/utils/runCode.js` (`new Function` on the main thread). Callers: `src/components/CodeChallenge.jsx`, `src/components/ranked/CodeRace.jsx`, `src/components/ranked/CodeGolf.jsx`, and any other caller of `runJsCode`.

**Fix**
- Run JS in a **dedicated Web Worker** created per run from a Blob URL. Pass the code via `postMessage`, and capture `console.log/info/warn/error` inside the worker.
- Enforce a hard timeout (3 s for lessons, configurable) with `worker.terminate()`. Return a friendly message: "Your code ran for too long — is there a loop that never stops? Check your counter (like `i++`)."
- Workers have no `localStorage`, `document` or `window.print`, so the data-loss and dialog problems go away.
- Keep `fetch` available, because the REST/GraphQL lessons need it.
- Keep the `runJsCode(code) → {logs, error}` signature so callers don't change.
- Do the same for Python: move Pyodide into a worker (Pyodide supports this) so `while True:` can also be interrupted.

**Done when**
- [ ] `while(true){}` returns a timeout message within ≤4 s and the UI stays clickable (Playwright: `page.evaluate(() => 1)` resolves within 1 s after clicking Run).
- [ ] `localStorage.clear()` in a lesson leaves `codequest-progress` intact.
- [ ] `print("x")` in JS mode returns an error such as "`print` isn't JavaScript — use `console.log()`" and never opens a dialog.
- [ ] All existing JS drill hints still pass (re-run the drill check in CQ-03).

### CQ-02 · Python learners are shown JavaScript instructions
**Evidence**
- On the live site, Python mode, World 1 Lesson 1 ("First Print"): the tutorial correctly says `print()`, but the task says *"Use console.log() to print exactly: Hello, World!"*
- Lesson 6-2 (Python): *"Print whether 7 is equal to 7, using ===."* (Python uses `==`).
- Scripted count across all 9,299 code lessons in Python mode:

  | Field | Lessons with JS syntax |
  |---|---|
  | Instructions | 4,997 |
  | Tutorial | 1,852 |
  | Example | 9,251 |

- Drill worlds 101–150 copy the JS tutorial and example into the `python` block verbatim (for example `console.log(3 + 4)` and `let steps = [...]`).

**Where:** `src/data/practiceGenerator.js` (the drill `python` objects), `src/data/levels.js` (1-1, 6-2), and `resolveContent()` in `src/components/CodeChallenge.jsx`. It already merges `content.python.*`, so adding `python.instructions` / `python.tutorial` / `python.example` is enough.

**Fix**
- Make the generator emit Python-specific `instructions`, `tutorial` and `example` for every variant: `print()`, no `let`, `==`, `True/False`, lists not arrays.
- Add `python.instructions` to 1-1 and 6-2.

**Done when**
- [ ] A check script (add it to CI) reports **0** Python-mode lessons whose effective `instructions`/`tutorial`/`example` match `/console\.log|\blet\b|\bconst\b|===|\.push\(/`.

### CQ-03 · About 10% of Python drills can't be passed with the natural answer
**Evidence**
- Running `python.starterCode + python.hint` for every 8th drill: **120 of 1,200 Python drills fail** and **0 of 1,200 JS drills fail**.

  | Drill family | Python failures | Example |
  |---|---|---|
  | Arithmetic Drills 4 (division) | 24/240 | `print(16 / 4)` prints `4.0`; expected `4` |
  | Array Drills | 96/240 | `print(steps)` prints `[17, 49, 15, 2]`; expected `17,49,15,2` |

- Confirmed on the live site with Pyodide: `print(7/7)` → `1.0` and `print([1, 2])` → `[1, 2]`.
- Rough scale: about 740 Python drills inherit JS-formatted expected output.

**Where:** `src/data/practiceGenerator.js` (all 5 families × 10 tiers), and `expectedOutput` comparison in `CodeChallengeBody` (`CodeChallenge.jsx`).

**Fix**
- Compute `python.expectedOutput` per variant by actually running the Python hint at generation time (or derive it with Python semantics: `/` gives a float, lists print as `[a, b]`).
- Alternatively, change the Python hint to `print(16 // 4)` and teach `//`. Pick one approach and keep the explanation consistent with it.

**Done when**
- [ ] A new `scripts/verify-drills.mjs` runs **every** drill (not a sample) in both languages: JS via `runJsCode`, Python via `python3 -c` locally (or Pyodide in Node).
- [ ] It exits non-zero on any mismatch, is wired into CI, and passes with 0 failures.

### CQ-04 · Browser/Android Back button exits the app
**Evidence:** Home → Learn → World 1 → Lesson 1, then the browser Back button. The browser left Code Quest (went to the previous page). `history.length` stayed at 2, because screen changes never push history. On Android the hardware Back closes the installed PWA. Children and older users rely on Back more than on in-app "← Back" links.

**Where:** `src/App.jsx` (navigation is a `mode` state string, with no router).

**Fix**
- Mirror the navigation state (`mode`, `activeWorldId`, `activeLevel.id`, `activeSideQuestId`, lesson id, `rankedMode`) into the URL hash, for example `#/learn/w/1/l/1-1`.
- Use `history.pushState` on navigation and handle `popstate` to restore state.
- Keep the existing `#/privacy` and `#/terms` routes.
- During a live ranked match, intercept Back with an in-app "Leave match?" sheet. Don't use `window.confirm`.

**Done when**
- [ ] Playwright: Home → Learn → World 1 → Lesson → `goBack()` ×3 returns Level map → World map → Home, and the URL stays on the site.
- [ ] Reloading on `#/learn/w/1` reopens World 1.

### CQ-05 · Locked Quests/Ranked screen overflows phones and hides the tab bar
**Evidence:** On a 390×844 phone, tapping **Quests** or **Ranked** before finishing 10 lessons (which every new user does):
- The `.skill-gate` card renders 408px wide, and the document becomes 425px wide.
- The page scrolls sideways and the bottom nav moves to y=856, below the 844px screen.
- Playwright couldn't tap the nav because `.app` intercepted the pointer. The user is stranded unless they find "← Modes".
- Desktop at 1280px is fine.

**Where:** `src/App.css` line ~1449: `.skill-gate { width: 100%; max-width: 360px; padding: 28px 24px; }` has no `box-sizing: border-box`.

**Fix:** Add `box-sizing: border-box` to `.skill-gate`, or better, a global `*, *::before, *::after { box-sizing: border-box; }` in `src/index.css`, then re-check other components.

**Done when**
- [ ] On every screen reachable from the bottom nav, at 320, 360, 390 and 430px widths: `document.documentElement.scrollWidth === clientWidth`, and the bottom nav sits fully inside the viewport and is tappable.
- [ ] This runs as a Playwright check in CI.

### CQ-06 · Kids' safety and compliance gaps *(owner + code)*
**Evidence**
- The app is marketed to "kids and teens", and accounts collect an email.
- There is no age gate or parental-consent step. The roadmap already lists a lawyer review.
- Ranked PvP shows the opponent a **free-text display name** of up to 20 characters (`profiles.display_name`, `RankedQueue` `displayName`), with no profanity or personal-info filter.

**Fix (code side)**
- Add an age question to sign-up. For under-13s, either block account creation (guest only) or require parent-email consent.
- In Ranked, show generated safe names (for example "Swift Falcon 42") or run names through a blocklist that also blocks emails, phone numbers and URLs. Apply the check in Postgres too, as a CHECK constraint or trigger.

**Done when**
- [ ] Display names containing an email, a phone number or a blocklisted word are rejected both client-side and by the database.
- [ ] Under-13s can't create an account without the consent flow.
- [ ] *(owner)* Legal review is done. This matters for COPPA and for Hong Kong's PDPO if you target HK schools.

---

## P1 — Fix before or right after launch

### CQ-07 · No help when a learner is stuck
**Evidence**
- **No hint up front:** the hint only appears after a run produces *wrong output*. On an error such as `console.log(Hello, World!)`, the learner sees only the raw engine text "missing ) after argument list", with no hint.
- **No diff:** typing `hello world` vs the expected `Hello, World!` only says "So close! Let's try again 💪". It doesn't show *what* differs.
- **No way out:** there's no "show me the answer" option, so a 7-year-old or a 75-year-old can be stuck forever. Quizzes, on the other hand, allow unlimited retries, so any quiz can be passed by guessing.

**Where:** `src/components/CodeChallenge.jsx`, `src/components/QuizChallenge.jsx`, `src/i18n/translations.js`.

**Fix**
- Add a "💡 Hint" button that's always visible.
- Map common errors to plain language: unterminated string, missing `)`, undefined variable, `print is not defined`, Python `IndentationError` and `NameError`. Show the plain message first and the raw message under a "details" toggle.
- On a mismatch, show **Expected** and **Your output** side by side, with the first differing character highlighted, plus a note on case and punctuation.
- After 3 failed runs, offer "Show solution" (the existing `hint` for drills already *is* the solution). Mark the lesson "completed with help" for analytics.
- In quizzes, show the explanation after the first wrong answer.

**Done when**
- [ ] A syntax error shows a friendly sentence and the hint.
- [ ] A case mismatch shows the highlighted diff.
- [ ] After 3 failures a "Show solution" button appears and fills the editor.

### CQ-08 · Curriculum is mostly auto-generated drills, and the numbers are inconsistent
**Evidence**

| Part | Worlds | Lessons | Notes |
|---|---|---|---|
| Hand-written path | 1–100 | 327 | Only 49 are code; 278 are multiple-choice |
| Generated drills | 101–150 | 9,250 | 185 near-identical lessons per world |
| Side quests | 35 quests | 7,000 | `verify-sidequest-drills.mjs` reports 43–56 exact-duplicate questions per expanded topic |

- Five chapters of drill worlds are all named "More Adventures". The World Map page is about 24,300px tall.
- The lesson totals contradict each other:
  - Home: "0/16577 lessons complete"
  - Meta and OG tags: "10,000+ lessons across 150 worlds"
  - World Map subtitle: "100 worlds"
  - README: "100-world learning path", "31 Side Quests", "10 unlockable characters"
  - Characters screen: "1/12 unlocked"

**Fix** *(owner decision on scope)*
- Move worlds 101–150 out of the main path into an optional **"Practice Gym"** that is endless, generates on demand, and has no 185-node maps.
- Spend the effort on turning more worlds 13–100 into hands-on code lessons.
- De-duplicate side-quest pools, or cap each topic at its unique-question count.
- Make one source of truth for counts (compute from data) and update the README, `index.html` meta and the WorldMap subtitle.

**Done when**
- [ ] No world has more than ~15 lessons on the main path.
- [ ] Every user-visible count is computed from data.
- [ ] The verify script reports 0 exact duplicates.

### CQ-09 · Text size can't be enlarged (seniors, low vision)
**Evidence:** Font sizes are in px. With the root font size forced to 150% (which is how many OS and browser "larger text" settings work), the continue-card title stayed at 17px. The code editor is 14px, and several labels are 13px (coach name, "Quick Lesson", the example code).

**Where:** `src/App.css`, `src/index.css`, `src/components/byteborn/byteborn.css`, `src/components/Settings.jsx`.

**Fix**
- Convert font sizes to `rem`.
- Add **Settings → Accessibility → Text size** (Default / Large / Extra large) that sets `html { font-size }` and is saved with the profile.
- Set a minimum of 16px for body text and the code editor at Default.

**Done when**
- [ ] Setting `html{font-size:150%}` scales all text.
- [ ] At XL plus a 390px phone there's no horizontal overflow (reuse the CQ-05 check).

### CQ-10 · Accessibility defects (axe-core + keyboard test)
| # | Problem | Where | Fix |
|---|---|---|---|
| a | **Keyboard trap:** Tab inside the code editor inserts 4 spaces and focus never leaves (WCAG 2.1.2) | `CodeEditor.jsx` Tab handler | After `Esc`, the next Tab moves focus out (CodeMirror pattern). Show "Press Esc then Tab to leave the editor" for screen readers |
| b | Code editor `<textarea>` has no accessible name (axe: critical) | `CodeEditor.jsx` | Add `aria-label="Code editor"` plus `aria-describedby` pointing at the instructions |
| c | Active bottom-nav label contrast is 2.62:1 (`#ff6f61` on `#fffaf0`) | `.bottom-nav__tab--active` | Darken to ≥4.5:1 (for example `#c2410c`) |
| d | Level nodes and locked avatars: visible text isn't in the accessible name | `LevelNode.jsx`, Settings avatars | Include the visible label in `aria-label`, or drop `aria-label` |
| e | No `<main>` landmark; lesson screen has no `<h1>` | `App.jsx`, `LevelScreen.jsx` | Wrap screens in `<main>`; make the lesson title an `h1` |
| f | A non-interactive wrapper on Home receives focus with no focus ring | Home header (`ModeSelect.jsx`) | Remove the stray tabindex, or add `:focus-visible` styling |
| g | Character cards read out 20 pose emoji in a row to screen readers | `CharacterRoster.jsx` | `aria-hidden="true"` on decorative pose strips |

**Done when**
- [ ] axe-core reports 0 critical or serious violations on Home, World map, Level map, Lesson, Settings, Quests and Ranked.
- [ ] A Tab-only run can open lesson 1, type, run, and continue.

### CQ-11 · Language isn't auto-detected, and translation is partial
**Evidence:** With the browser set to `zh-TW`, the app opened in English. `detectInitialLocale()` ignores `navigator.languages`. The legal pages stay English after switching the UI to Spanish, and lesson content is English-only, which the README states.

**Fix**
- Detect locale from `navigator.languages`: `zh-HK`, `zh-TW` and `zh-Hant` map to `zh-TW`; `es-*` to `es`; `ko-*` to `ko`.
- In the language picker, say clearly "Lessons are in English".
- Translate at least the first two worlds into 繁體中文 if HK schools are a target.

**Done when**
- [ ] A fresh visit with a `zh-HK` browser opens in 繁體中文.

### CQ-12 · Beginner primer is too long and too advanced for children
**Evidence:** Beginners go through 13 primer steps before lesson 1, including "Fun fact: argc & argv", with no skip option.

**Fix**
- Cut the primer to 4–5 steps (code, function, parentheses, variable, then the quiz).
- Move argc/argv to a C/C++ side quest.
- Add a "Skip — take me to my first lesson" link.

**Done when**
- [ ] Beginner onboarding reaches lesson 1 in ≤ 8 taps.

---

## P2 — Polish and product

| ID | Issue | Evidence | Fix | Done when |
|---|---|---|---|---|
| CQ-13 | Ages 3–6 can't use the app *(owner: positioning)* | Every lesson needs reading and typing syntax | Either state "Ages 8+" in the meta, store listing and onboarding, or add a pre-reader mode (drag-and-drop blocks, audio narration of instructions, picture-based quizzes) | The positioning decision is written in the README and meta |
| CQ-14 | Jargon and copy errors | "← Modes" back label; "Kernel Dash · Continue →" for a game never played; "Just 1 more days"; "LP" never explained | Use "← Home", "Play →", fix the plural, add a one-line LP tooltip | Copy review done in all 4 locales |
| CQ-15 | Guest path is de-emphasised | Live site: "Continue as Guest →" is a small text link under the login form | Make "Start playing (no account needed)" the primary button and put Log in / Sign up second | Primary CTA is guest |
| CQ-16 | Python first-run wait is unexplained | Live: the first run downloads ~5.4 MB (stdlib 2.2 MB + wasm 2.9 MB), ~3–5 s, showing only "Running…" | Show "Loading Python (first time only)…" with progress; start preloading Pyodide when a Python lesson opens | The first run shows a loading message |
| CQ-17 | Kernel Dash for young or older players | Controls are arrow keys or swipes only; random play ended in ~9 s | Add visible on-screen ↑ ↓ ← → buttons and an "Easy" speed | Playable with taps only |
| CQ-18 | Bundle size | Main chunk is 885 kB (277 kB gzip); `sidequests.js` (301 kB source) loads up front | Lazy-load per quest as planned in ROADMAP; move drills to the on-demand generator (CQ-08) | Main chunk under 400 kB |
| CQ-19 | Missing automated tests | CI is lint + build only | Add Vitest for `applyRankedResult`, `progressSerialize`, `computeStreak` and unlock logic, plus the Playwright checks from CQ-01, CQ-04, CQ-05 and CQ-10 | CI runs unit + e2e |
| CQ-20 | Dependency and lint hygiene | `npm audit`: 1 high (`source-map-js`, dev-only); oxlint: 7 warnings (`only-export-components`, `react(refs)` and `set-state-in-effect` in `useCountdown.js`) | `npm audit fix`; move non-component exports out of component files; refactor `useCountdown` | 0 audit highs, 0 lint warnings |
| CQ-21 | Toddler-proofing settings | Random tapping changed the app language and opened the login and legal pages | Optional "Parent lock" (hold for 2 s, or a simple sum) on Settings and Account | A child can't change settings by accident |

---

## Owner-only items still open (from ROADMAP §1, not re-tested)

These are still unchecked in `ROADMAP.md`:
- Run the `delete_my_account()` SQL.
- Turn on "Confirm email" and set the redirect URLs.
- Set up a custom email sender.
- Set up the Turnstile keys.
- Add the keep-alive secret.
- Set `VITE_CONTACT_EMAIL` (the live Settings page shows "Support contact isn't set up yet").
- Deploy the Code Helper function.
- Get the legal review.
- Connect a custom domain.
- Turn on GitHub → Vercel auto-deploy.

---

## Suggested work order

1. CQ-05 (one line of CSS)
2. CQ-01 (worker sandbox)
3. CQ-02 + CQ-03 together (generator + verify script in CI)
4. CQ-04 (history)
5. CQ-07 (help when stuck)
6. CQ-10 + CQ-09 (accessibility + text size)
7. CQ-12, CQ-11, CQ-15
8. Owner decisions: CQ-06, CQ-08, CQ-13
9. P2 polish + CQ-19 tests

## Reproduction notes

- **Local:** `npm ci && npm run build && npx vite preview --port 4173`. Without `.env.local` it runs guest-only, which is what was tested.
- **Playwright** setup: viewport 390×844 with `isMobile` and `hasTouch` for phones; 640×400 at `deviceScaleFactor: 2` for 200% zoom. Beginner flow:
  1. Click "Continue as Guest".
  2. Choose "Total beginner" → "Just for fun" → "JavaScript".
  3. Click primer "Got it!" buttons and answer the quiz until the Home screen (`.mode-select`) appears.
  4. Tap the continue card → "Skip" → "First Print".
- **Drill check:** for each level in worlds 101–150:
  - Run `starterCode + "\n" + hint` with `runJsCode` and compare it to `expectedOutput`.
  - Run `python.starterCode + "\n" + python.hint` with `python3 -c` and compare it to `python.expectedOutput ?? expectedOutput`.

## Checklist

- [x] CQ-01  - [ ] CQ-02  - [ ] CQ-03  - [ ] CQ-04  - [x] CQ-05  - [ ] CQ-06
- [ ] CQ-07  - [ ] CQ-08  - [ ] CQ-09  - [ ] CQ-10  - [ ] CQ-11  - [ ] CQ-12
- [ ] CQ-13  - [ ] CQ-14  - [ ] CQ-15  - [ ] CQ-16  - [ ] CQ-17  - [ ] CQ-18
- [ ] CQ-19  - [ ] CQ-20  - [ ] CQ-21

## Fix log (added as items are completed — not part of the original report)

**CQ-05 (fixed):** Added a global `*, *::before, *::after { box-sizing: border-box; }`
reset in `src/index.css`. Root cause confirmed: `box-sizing: border-box` was
applied piecemeal to ~20 individual rules instead of globally, and
`.skill-gate` was one of the ones missed. Verified at 320/360/390/430px on
the exact repro (locked Quests screen, 0 lessons complete): `scrollWidth ===
clientWidth` at every width, bottom nav fully inside the viewport and
tappable at all four.

**CQ-01 (fixed):** Rewrote `src/utils/runCode.js` to run learner JS inside a
dedicated Web Worker (built from a Blob URL, one per run, hard-terminated on
timeout) instead of on the main thread. This is a structural fix, not a
patch — the worker has no `window`, `document`, or `localStorage` at all,
so the data-loss and dialog-hijack issues aren't mitigated, they're
unreachable. `fetch` still works (available in worker scope) for the REST/
GraphQL lessons. Added friendly-message rewriting for the `print`/`alert`/
`confirm`-is-not-defined mistakes. `runJsCode(code) → {logs, error}`
signature unchanged, so `CodeChallenge.jsx` and `CodeGolf.jsx` needed no
changes. Verified live: an `i++`-less `while` loop no longer freezes the
page (UI stays responsive, times out in ~3s with the suggested message),
`localStorage.clear()` run from a lesson leaves `codequest-progress`
intact, `print("x")` shows the friendly message with zero dialogs opened,
and a normal correct program still runs and grades correctly. The "all
existing JS drill hints still pass" criterion is covered by CQ-03's new
`scripts/verify-drills.mjs` (not yet written as of this commit — see CQ-03).

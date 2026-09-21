# Code Quest — Roadmap

Where the app stands and what to improve next. Effort: **S** = hours, **M** = a day or two, **L** = a week or more.
Items marked *(you)* need an account dashboard (Supabase / Vercel / GitHub) rather than code.

## Already done

- 100-world learning path, 28 side quests, 8 ranked modes with a daily shuffle
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
- [ ] **Server-side ranked points.** LP is stored in the browser and saved as raw JSON, so a determined user can edit their own rank. Fine for solo play, but it must move server-side (Supabase function that validates results) before any leaderboard — L
- [ ] **Leaderboards** (weekly / all-time / friends) once LP is validated — M
- [ ] **Seasons**: periodic soft reset with rewards for peak rank — M
- [ ] **Bigger question bank**: 70 questions (10 per tier) will feel repetitive. Grow to 50+ per tier and avoid repeats across matches — M (mostly content)
- [ ] **Relay mode** (currently "coming soon") needs real-time matchmaking — L
- [ ] **Adaptive difficulty** using recent accuracy, not only LP — M

**Learning**
- [ ] Real code execution beyond the first 12 worlds — L
- [x] C, C++ and Java added (JavaScript and Python already existed): 49 hand-written lessons each for worlds 1–12, run on the Wandbox online compiler. Every solution is verified against the real compiler
- [ ] Keep the online compiler dependable: it's a free third-party service that can slow down or go away. Consider a fallback provider or self-hosting one (e.g. a small Piston server) — M
- [ ] Run C/C++/Java inside the browser (WebAssembly) so code never leaves the device and Ranked code modes can use them — L
- [ ] More languages/topics: HTML/CSS, TypeScript, SQL, Go, Rust, Git in the browser — L
- [ ] Save the language lesson checks as an automated test in CI (currently a one-off script) — S/M
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

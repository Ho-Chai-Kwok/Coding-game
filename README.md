# Code Quest 🎮

A free, Duolingo-style coding game for kids and teens — learn to code by
solving bite-sized, hands-on challenges, racing through ranked mini-games,
and unlocking characters along the way.

## Features

- **100-world learning path** — one topic per world, broken into small
  gradually-harder steps. The first 12 worlds run real, graded code in
  **five languages**: JavaScript and Python run right in the browser
  (Python via [Pyodide](https://pyodide.org)), while **C, C++ and Java** run
  on the free [Wandbox](https://wandbox.org) online compiler (the learner's
  code is sent to it when they press Run — see the Privacy Policy). The rest
  are fast concept quizzes so every world works no matter which language you
  picked. Timed Ranked modes use JavaScript for C/C++/Java learners, since
  online compiling is too slow for them.
- **31 Side Quests** — optional courses on real tools: Git, Docker, SQL,
  React, HTML, CSS, PHP, AWS, Kubernetes, and AI/ML topics like Prompt
  Engineering, LangChain, LangGraph, Computer Vision, NLP, and RAG.
- **Ranked Mode** — real player-vs-player: 7 playable game modes (Code
  Race, Bug Hunt, Predict the Output, Code Golf, Showdown, Debug Duel,
  Chaos Round, plus a Relay mode awaiting real team matchmaking), picked
  via a daily-rotating slot-machine shuffle, then matched against a real
  opponent of similar rank (see `supabase/schema.sql`) — closest LP first,
  widening the search over time. Both players get identical content, and
  LP moves on a real, server-computed, zero-sum ELO-style swing based on
  who you actually beat. Questions scale across 7 difficulty tiers
  (Bronze → Grandmaster) that track your rank. Requires an account (not
  guest) to be matched.
- **10 unlockable characters** — a shared parametric SVG rig reskinned
  per character, each with a real mechanical bonus tied to their
  archetype (not just flavor text), unlocked through genuine progress.
- **Daily login rewards** — a calendar with a streak milestone ladder.
- **Guest-first accounts** — progress saves to this device by default;
  signing in with email syncs it via Supabase instead. No login is ever
  required to play.
- **4 languages** — English, Spanish, Traditional Chinese, and Korean UI
  (lesson content itself is English-only).
- Light/dark theme, following system preference or an explicit choice.

## Getting started

```bash
npm install
npm run dev
```

The app runs fully in **guest mode** out of the box — no setup required.
Progress is stored on-device via `localStorage`.

### Optional: real accounts (Supabase)

To let players log in and sync progress across devices, create a
[Supabase](https://supabase.com) project, run `supabase/schema.sql` in its
SQL editor, then copy `.env.example` to `.env.local` and fill in your
project's URL and anon key. Without this, Code Quest works exactly the
same — just guest-only.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

## Tech stack

React 19 + Vite, no router (single `mode` state string drives screen
navigation), plain CSS with custom properties for theming, Supabase
(optional, Postgres + Auth), Pyodide (WASM Python, lazy-loaded on demand).

## Project structure

```
src/
  components/     UI screens and shared widgets
  components/ranked/   The 8 Ranked Mode game components
  data/           Curriculum, side quests, characters, question banks
  i18n/           Translations and the locale context
  auth/           Supabase auth context (guest-mode fallback built in)
  hooks/          useProgressSync, useCountdown
  utils/          Streak math, JS/Python/online-compiler code execution
```

## Privacy

Guest mode (the default) never sends anything off the device — progress
lives only in this browser's `localStorage`. Creating an account stores an
email, display name, and play progress in Supabase; nothing is sold or
shared with third parties, and there are no ads or trackers. If you're
under 13, please ask a parent or guardian before creating an account.

## License

Private project — all rights reserved.

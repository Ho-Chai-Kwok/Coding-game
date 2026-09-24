# Code Helper — Edge Function setup

This function powers Settings → 🆘 Code Helper: a learner pastes a question
and/or their code, and gets back a real AI tutor's reply. It's written and
ready to go, but — unlike everything else in this app — it needs a one-time
manual deploy, because there's no CLI/dashboard access from inside a chat
session to do it automatically. Until you do these steps, the feature fails
closed with a friendly "not set up yet" message in the app (it never
pretends to work, and it never silently breaks anything else).

## What you need

1. **An Anthropic API key** — https://console.anthropic.com/ → Settings →
   API Keys → Create Key. This is a paid API (Claude Haiku, a cheap/fast
   model chosen specifically for this use case); keep an eye on usage
   early on. A server-side daily-request cap (20/user/day, see
   `check_and_log_code_help_usage()` in `supabase/schema.sql`) limits how
   much any single account can run up, but you're still responsible for
   the bill.
2. **The Supabase CLI** — via Homebrew (the reliable path; a global `npm
   install -g supabase` is blocked/unsupported by Supabase's own package):

   ```bash
   brew install supabase/tap/supabase
   ```

## Steps

```bash
# 1. Run the new SQL block if you haven't already (adds code_help_usage +
#    check_and_log_code_help_usage() — safe to re-run the whole file, every
#    statement in it is create-if-not-exists / create-or-replace):
#    Supabase Dashboard → SQL Editor → paste supabase/schema.sql → Run.

# 2. Log in and link this repo to your project (project ref is the id in
#    your Supabase project's URL, e.g. https://<ref>.supabase.co):
supabase login
supabase link --project-ref <your-project-ref>

# 3. Set the secret (never goes in .env.local / never gets bundled client-side):
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 4. Deploy this function:
supabase functions deploy code-help
```

That's it — no other app config needed. The frontend already calls
`supabase.functions.invoke("code-help", ...)` (see `src/utils/codeHelper.js`)
using your existing `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.

## Verifying it worked

Open the app → Home → 🆘 → paste any question → Ask for Help. A real reply
appearing (not the "not set up yet" message) means it's live.

## Changing the daily limit or model

- Daily cap: `DAILY_LIMIT` in `index.ts`, and it's also passed explicitly
  as `p_daily_limit` to the SQL function (so you can change it per-call
  without a redeploy if you ever want a different limit for a different
  caller — today only this function calls it, with the same constant).
- Model: `MODEL` in `index.ts`. Swap to a stronger model if replies feel
  too shallow for harder questions — costs more per request.

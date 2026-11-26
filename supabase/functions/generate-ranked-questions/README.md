# Dynamic Ranked Questions — Edge Function setup

This function powers Ranked Mode's three quiz-based games (Predict the
Output, Showdown, Chaos Round): instead of always drawing from the fixed
70-question bank, each real match tries to get a fresh, AI-generated batch
of questions at a difficulty matched to that match's own rank.

It shares the exact same deploy process and the exact same
`ANTHROPIC_API_KEY` secret as Code Helper — if you've already deployed that
function, you're most of the way there already.

## What you need

Same as Code Helper (see `supabase/functions/code-help/README.md` for the
full explanation): an Anthropic API key set as the `ANTHROPIC_API_KEY`
secret, and the Supabase CLI.

## Steps

```bash
# 1. Run the new SQL block if you haven't already (adds
#    generated_questions to ranked_matches + save_match_questions() —
#    safe to re-run the whole file):
#    Supabase Dashboard → SQL Editor → paste supabase/schema.sql → Run.

# 2. If you already ran `supabase link` for Code Helper, skip this.
supabase login
supabase link --project-ref <your-project-ref>

# 3. Same secret as Code Helper — skip if already set.
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 4. Deploy this function:
supabase functions deploy generate-ranked-questions
```

**Optional settings** (`supabase secrets set NAME=value`):

- `ALLOWED_ORIGINS` — once you have your domain, set it (comma-separated,
  e.g. `https://codequest.app,https://www.codequest.app`) so browsers only
  accept responses on your own site. Unset, any origin works (still safe,
  since every request needs a signed-in user's token).
- `ANTHROPIC_MODEL` — overrides the default Claude model.

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are
provided to Edge Functions by Supabase automatically.

## What happens if you don't deploy this

Nothing breaks. Every quiz-based ranked mode already falls back to the
existing static question bank (`data/rankedQuestionBank.js`) the instant
this function is unreachable, not configured, or returns anything that
doesn't parse into valid questions — a ranked match is never blocked by
this being unavailable. Until you deploy it, ranked mode plays exactly as
it always has.

## Verifying it worked

Play a real ranked match in Predict the Output, Showdown, or Chaos Round.
Since matches only generate once (see below), the easiest way to actually
see different questions than the static bank is to play a few matches —
static-bank questions repeat from the same familiar 70; freshly generated
ones won't.

## How fairness and cost are handled

- **Fairness**: both matched players must see the identical question set.
  Generation happens once per match — whichever player's client asks
  first triggers it, and the result is cached on the match row itself
  (`generated_questions`). The other player's client (or a retry) just
  reads it back, never generates its own separate batch.
- **Cost**: this calls Claude Haiku once per real match that plays a
  quiz-based mode (not once per player, not once per question) — a bounded,
  naturally-throttled cost since matches take real time to set up via
  matchmaking. There's no separate daily cap on this the way Code Helper
  has one; if usage ever becomes a concern, the same kind of per-user cap
  (see `check_and_log_code_help_usage()`) could be added the same way.

## Changing the batch size or model

- `QUESTIONS_PER_BATCH` in `index.ts` — sized to Showdown's `MAX_ROUNDS`
  (15) since it's the largest consumer of the three modes.
- `MODEL` in `index.ts` — same Haiku model Code Helper uses, chosen for
  cost/speed on a batch of short quiz questions.

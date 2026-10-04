import { getSupabase } from "../lib/supabaseClient";

export const CODE_HELP_QUESTION_MAX = 500;
export const CODE_HELP_CODE_MAX = 4000;
export const CODE_HELP_MAX_TURNS = 20;

// Turns a question + optional pasted code into the single content string
// sent as one "user" turn — same combined format the Edge Function has
// always expected, just factored out now that a turn can be one of many
// in a running conversation instead of a single one-shot request.
//
// No language is passed along on purpose — the tutor reads real code and
// recognizes the language on its own; asking the learner to pick one from
// a list first was friction with no real payoff.
export function buildUserTurnContent({ question, code }) {
  const parts = [];
  const q = (question ?? "").trim();
  const c = (code ?? "").trim();
  if (q) parts.push(`Question: ${q}`);
  if (c) parts.push(`Their code:\n\`\`\`\n${c}\n\`\`\``);
  return parts.join("\n\n");
}

// Calls the code-help Edge Function (supabase/functions/code-help) — see
// its README.md for the one-time deploy steps. Never calls the AI
// directly from the browser: the API key and the daily-usage check both
// have to stay server-side (see that function's own comments).
//
// `messages` is the FULL conversation so far, including the newest user
// turn — Claude's API is stateless, so the whole history has to be resent
// every call (same pattern Anthropic's own docs use for multi-turn chat).
// Capped at CODE_HELP_MAX_TURNS user turns; the server enforces this too,
// never just the client.
//
// Returns one of:
//   { ok: true, reply, usedToday, dailyLimit }
//   { ok: false, reason: "not_configured" | "rate_limited" | "empty_request" | "conversation_too_long" | "unauthenticated" | "network" | "unknown", usedToday?, dailyLimit? }
export async function askForCodeHelp({ messages }) {
  const supabase = await getSupabase();
  if (!supabase) return { ok: false, reason: "not_configured" };

  let response;
  try {
    response = await supabase.functions.invoke("code-help", {
      body: { messages },
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  const { data, error } = response;
  if (!error) {
    return { ok: true, reply: data.reply, usedToday: data.usedToday, dailyLimit: data.dailyLimit };
  }

  // supabase-js throws a FunctionsHttpError for any non-2xx response, with
  // the real Response object on `error.context` — read the structured
  // { error: "..." } body this function always returns, rather than just
  // surfacing a generic "Edge Function returned a non-2xx status code."
  let body = null;
  try {
    body = await error.context?.json();
  } catch {
    // context wasn't JSON (e.g. a network-level failure before the
    // function ever ran) — fall through to the generic reason below.
  }

  const reason = body?.error ?? "unknown";
  return { ok: false, reason, usedToday: body?.usedToday, dailyLimit: body?.dailyLimit };
}

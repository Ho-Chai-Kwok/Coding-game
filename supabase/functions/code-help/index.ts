// Code Helper — Supabase Edge Function (Deno)
//
// A learner pastes a question and/or their code; this calls Claude to act
// as a patient tutor and returns a plain-text reply. Deploy + configure
// steps are in this folder's README.md — this function does nothing until
// both are done (it fails closed with a clear "not_configured" error, it
// never silently no-ops).
//
// Why this lives server-side instead of calling the AI API from the
// browser: the API key must never reach client code (anyone could read it
// out of the bundle and rack up charges on it), and every request needs a
// server-verified identity to enforce the daily cap in
// check_and_log_code_help_usage() (supabase/schema.sql) — a client could
// otherwise just skip calling that function.
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "jsr:@supabase/supabase-js@2";

// ALLOWED_ORIGINS (comma-separated, e.g. "https://codequest.app") locks
// the browser CORS check to the real site once a domain exists. Unset, it
// stays "*" — still safe, since every request needs a valid user JWT.
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",").map((o) => o.trim()).filter(Boolean);
let CORS_HEADERS: Record<string, string> = {};
function setCors(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allow = ALLOWED_ORIGINS.length === 0 ? "*" : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  CORS_HEADERS = {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const MAX_QUESTION_LEN = 500;
const MAX_CODE_LEN = 4000;
const DAILY_LIMIT = 20;
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-4-5-20251001";
// A continuous chat, not one-shot Q&A — but still bounded: 20 user turns
// (+ up to 20 matching assistant replies) per conversation. This isn't
// just a UX nicety — it's the real defense against someone hand-crafting
// one raw request with a huge fabricated `messages` array to burn a lot
// of tokens using only a single one of their 20 daily calls. The daily
// cap (below) limits how many *requests* land; this limits how big any
// one request can be.
const MAX_TURNS = 20;
const MAX_MESSAGES = MAX_TURNS * 2;
const MAX_MESSAGE_LEN = MAX_QUESTION_LEN + MAX_CODE_LEN + 100;

const SYSTEM_PROMPT = `You are a warm, patient coding tutor inside Code Quest, a learn-to-code app for kids and teens. A student will share a question and/or their own code — recognize the language from the code itself, no language name is given.

How to help:
- Read their code for real and reason about what it actually does.
- Prefer guiding them to the answer over just handing over fixed code: explain what's happening, point at the specific line or concept that matters, ask a leading question, or describe the fix in words — only paste a corrected code snippet if they clearly asked for the working code or are completely stuck.
- If their code has a bug, name what's actually wrong before suggesting anything.
- Keep it encouraging and age-appropriate. Never be condescending or say things like "just" or "simply" or "obviously" — apparent-easy things aren't always easy to a beginner.
- Keep replies short: a few sentences to a short paragraph, plain text (no markdown headers, no code fences unless showing an actual snippet).
- If the question is missing or unclear, help with whatever code they gave anyway (or ask one short clarifying question).
- If what they're asking has nothing to do with code, gently steer back to coding help.`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  setCors(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // Fails closed and says exactly why, instead of pretending to work —
    // the frontend shows a friendly "not set up yet" message for this
    // specific error code (see src/utils/codeHelper.js).
    return jsonResponse({ error: "not_configured" }, 503);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !authHeader) {
    return jsonResponse({ error: "unauthenticated" }, 401);
  }

  // Pass the caller's own JWT through so auth.uid() inside the RPC below
  // is the real signed-in user, never something the client could forge —
  // same trust pattern every SECURITY DEFINER function in this app uses.
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return jsonResponse({ error: "unauthenticated" }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  // A continuous chat: the client sends its whole conversation so far
  // (built from real prior replies, never invented — see
  // src/utils/codeHelper.js) plus the newest user turn, since Claude's API
  // is stateless and needs the full history every call. Every message is
  // still validated server-side, not just trusted from the client.
  const rawMessages = Array.isArray(body?.messages) ? body.messages : null;
  if (!rawMessages || rawMessages.length === 0) {
    return jsonResponse({ error: "empty_request" }, 400);
  }
  if (rawMessages.length > MAX_MESSAGES) {
    return jsonResponse({ error: "conversation_too_long" }, 400);
  }

  const messages: { role: string; content: string }[] = [];
  for (const m of rawMessages) {
    const role = m?.role === "assistant" ? "assistant" : m?.role === "user" ? "user" : null;
    const content = typeof m?.content === "string" ? m.content.trim().slice(0, MAX_MESSAGE_LEN) : "";
    if (!role || !content) return jsonResponse({ error: "invalid_body" }, 400);
    messages.push({ role, content });
  }
  // The API requires the conversation to end on a user turn, and Anthropic
  // requires strictly alternating roles — enforce both rather than trust
  // the client got it right.
  if (messages[messages.length - 1].role !== "user") {
    return jsonResponse({ error: "invalid_body" }, 400);
  }
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === messages[i - 1].role) {
      return jsonResponse({ error: "invalid_body" }, 400);
    }
  }

  // Counted only once the request is known to be well-formed.
  const { data: usage, error: usageError } = await supabase
    .rpc("check_and_log_code_help_usage", { p_daily_limit: DAILY_LIMIT })
    .single();
  if (usageError) {
    console.error("usage_check_failed:", usageError.message, usageError.code);
    return jsonResponse({ error: "usage_check_failed" }, 500);
  }
  const usageRow = usage as { allowed: boolean; used_today: number; daily_limit: number };
  if (!usageRow.allowed) {
    return jsonResponse(
      { error: "rate_limited", usedToday: usageRow.used_today, dailyLimit: usageRow.daily_limit },
      429,
    );
  }

  let aiRes: Response;
  try {
    aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      signal: AbortSignal.timeout(30000),
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
  } catch (err) {
    console.error("ai_unreachable:", err instanceof Error ? err.message : String(err));
    return jsonResponse({ error: "ai_unreachable" }, 502);
  }

  if (!aiRes.ok) {
    // Log Anthropic's own error body — this is where "invalid key",
    // "insufficient credit balance", "model not found", etc. actually show
    // up. Never logs the key itself, only Anthropic's response.
    const errorBody = await aiRes.text().catch(() => "(could not read body)");
    console.error("ai_error:", aiRes.status, errorBody);
    return jsonResponse({ error: "ai_error", status: aiRes.status }, 502);
  }

  const aiData = await aiRes.json();
  const reply = aiData?.content?.[0]?.text;
  if (typeof reply !== "string" || !reply) {
    console.error("ai_empty_reply:", JSON.stringify(aiData));
    return jsonResponse({ error: "ai_empty_reply" }, 502);
  }

  return jsonResponse({ reply, usedToday: usageRow.used_today, dailyLimit: usageRow.daily_limit });
});

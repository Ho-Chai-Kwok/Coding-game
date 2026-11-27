// Ranked Mode: dynamically-generated quiz questions, one fresh batch per
// real match, at a difficulty matched to that match's own rank. See
// supabase/schema.sql's generated_questions column + save_match_questions()
// and src/utils/rankedQuestionGenerator.js.
//
// Both matched players must see IDENTICAL questions — the same fairness
// guarantee the static question bank's shared seed already provides
// everywhere else in ranked mode. Generating independently per-client
// would let one player draw an easier or just different set. Instead,
// whichever client asks first triggers generation and the result gets
// written ONCE to the match row itself (save_match_questions is a
// compare-and-set); this function then always re-reads the row before
// replying, so a client that raced and "lost" the save still gets back
// the one true batch instead of trusting its own now-orphaned generation.
//
// If anything here fails — no API key configured yet, the AI call errors,
// the output doesn't parse into valid questions — the caller (see
// src/utils/rankedQuestionGenerator.js) falls back to the existing static
// question bank. A ranked match must never be blocked by this being
// unavailable; dynamic questions are a bonus on top of an already-working
// system, never a new single point of failure for it.
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

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-4-5-20251001";
// Sized to the largest consumer (Showdown's MAX_ROUNDS) so every quiz-based
// ranked mode has enough unique questions for a full match without reuse.
const QUESTIONS_PER_BATCH = 15;

// Mirrors src/data/rank.js's TIERS/getDifficultyLevel exactly — kept as a
// small local copy (like every other server-side function in this app)
// rather than importing across the client/server boundary.
const TIERS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 1000 },
  { name: "Gold", min: 2000 },
  { name: "Platinum", min: 3000 },
  { name: "Diamond", min: 4000 },
  { name: "Master", min: 5000 },
  { name: "Grandmaster", min: 6000 },
];

function getDifficultyLevel(points: number) {
  const clamped = Math.max(0, points);
  let tierIndex = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (clamped >= TIERS[i].min) {
      tierIndex = i;
      break;
    }
  }
  return tierIndex + 1; // 1 (Bronze) .. 7 (Grandmaster)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function buildPrompt(tierName: string, level: number) {
  return `Generate exactly ${QUESTIONS_PER_BATCH} original multiple-choice programming quiz questions for a ranked competitive coding game, at "${tierName}" difficulty (tier ${level} of 7, where 1 is a total beginner just learning to code and 7 is advanced computer science / algorithms).

Rules:
- Cover a MIX of topics appropriate for this exact difficulty. Lower tiers: variables, loops, conditionals, arrays, functions, basic JavaScript syntax. Higher tiers: closures, async/promises, algorithms, data structures, Big-O complexity, recursion, design patterns.
- Every question needs exactly 4 answer options, all the SAME type/format as each other (e.g. all booleans, all short values of the same kind, all short phrases) — never mix a plausible answer with obviously-wrong-type decoys, since that lets someone eliminate wrong answers without any real understanding. Every wrong option should be a genuinely plausible mistake someone with a shaky understanding of the concept might pick.
- Base every question on real, correct JavaScript language behavior — never invent syntax or behavior that isn't real.
- Write a one-sentence explanation of why the correct answer is right.
- Keep questions short enough to read at a glance — this is a timed quiz, not a code-reading exercise.
- Return ONLY a raw JSON array, no prose before or after it and no markdown code fences, matching exactly this shape:
[{"topic": "short topic name", "question": "the question text", "options": ["option A", "option B", "option C", "option D"], "correctIndex": 0, "explanation": "one sentence"}]`;
}

function isValidQuestion(q: any) {
  return (
    q &&
    typeof q.topic === "string" &&
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((o: unknown) => typeof o === "string" && o.length > 0) &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex <= 3 &&
    typeof q.explanation === "string"
  );
}

Deno.serve(async (req) => {
  setCors(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !authHeader) {
    return jsonResponse({ error: "unauthenticated" }, 401);
  }

  // Same trust pattern as every other function in this app: pass the
  // caller's own JWT through, never a client-supplied "which player am I."
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

  const matchId = typeof body?.matchId === "string" ? body.matchId : null;
  if (!matchId) {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  // RLS on ranked_matches already restricts this to the match's own two
  // players — a non-participant simply gets no row back here, the same
  // way it already works for the rest of the app's match-reading code.
  const { data: match, error: matchError } = await supabase
    .from("ranked_matches")
    .select("player1_points, player2_points, generated_questions")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) {
    return jsonResponse({ error: "match_not_found" }, 404);
  }

  // Fast path: someone already generated this match's questions (possibly
  // the other player's client, moments ago) — never call the AI twice for
  // the same match.
  if (match.generated_questions) {
    return jsonResponse({ questions: match.generated_questions });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // Fails closed with a clear reason — the frontend falls back to the
    // static question bank for this specific error, never pretends to work.
    return jsonResponse({ error: "not_configured" }, 503);
  }

  const avgPoints = Math.round(((match.player1_points ?? 0) + (match.player2_points ?? 0)) / 2);
  const level = getDifficultyLevel(avgPoints);
  const tierName = TIERS[level - 1].name;

  let aiRes: Response;
  try {
    aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      signal: AbortSignal.timeout(45000),
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        messages: [{ role: "user", content: buildPrompt(tierName, level) }],
      }),
    });
  } catch (err) {
    console.error("ai_unreachable:", err instanceof Error ? err.message : String(err));
    return jsonResponse({ error: "ai_unreachable" }, 502);
  }

  if (!aiRes.ok) {
    const errorBody = await aiRes.text().catch(() => "(could not read body)");
    console.error("ai_error:", aiRes.status, errorBody);
    return jsonResponse({ error: "ai_error", status: aiRes.status }, 502);
  }

  const aiData = await aiRes.json();
  const rawText = aiData?.content?.[0]?.text;
  if (typeof rawText !== "string") {
    console.error("ai_empty_reply:", JSON.stringify(aiData));
    return jsonResponse({ error: "ai_empty_reply" }, 502);
  }

  // The prompt asks for raw JSON with no fences, but models sometimes
  // wrap output in ```json ... ``` anyway — strip defensively.
  const cleaned = rawText.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let questions: any;
  try {
    questions = JSON.parse(cleaned);
  } catch (err) {
    console.error("ai_bad_output (parse):", err instanceof Error ? err.message : String(err), cleaned.slice(0, 300));
    return jsonResponse({ error: "ai_bad_output" }, 502);
  }

  // Never save or serve output that doesn't genuinely match the shape
  // every quiz-based ranked mode expects — a malformed question would
  // crash QuizChallenge mid-match, which is worse than falling back.
  const valid =
    Array.isArray(questions) &&
    questions.length >= QUESTIONS_PER_BATCH &&
    questions.every(isValidQuestion);
  if (!valid) {
    console.error("ai_bad_output (shape):", JSON.stringify(questions).slice(0, 300));
    return jsonResponse({ error: "ai_bad_output" }, 502);
  }

  // Best-effort, idempotent save — then ALWAYS re-read, so two clients
  // racing on the same brand-new match both end up returning the exact
  // same stored batch regardless of which one's save actually won.
  // save_match_questions is server-only (see schema.sql), so this one
  // call uses the service-role key. The player was already proven to be in
  // this match by the RLS-restricted read above; that id is passed in.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    return jsonResponse({ error: "not_configured" }, 503);
  }
  const admin = createClient(supabaseUrl, serviceKey);
  const { error: saveError } = await admin.rpc("save_match_questions", {
    p_match_id: matchId,
    p_questions: questions,
    p_player_id: userData.user.id,
  });
  if (saveError) {
    console.error("save_match_questions failed:", saveError.message);
  }

  const { data: finalMatch } = await supabase
    .from("ranked_matches")
    .select("generated_questions")
    .eq("id", matchId)
    .maybeSingle();

  return jsonResponse({ questions: finalMatch?.generated_questions ?? questions });
});

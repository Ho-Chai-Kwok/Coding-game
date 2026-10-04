import { getSupabase } from "../lib/supabaseClient";

// Calls the generate-ranked-questions Edge Function (see its README for
// the one-time deploy steps — same deploy process as Code Helper) to get
// a fresh, AI-generated batch of questions for a real ranked match, at a
// difficulty matched to that match's own rank tier. Both matched players
// end up with the identical batch (cached server-side on the match row —
// see the function's own comments), never two independently-generated sets.
//
// Deliberately fails soft: any problem at all — not deployed yet, no API
// key configured, a bad AI response — resolves to `null` rather than
// throwing, so callers can fall back to the static question bank and a
// ranked match is never blocked by this being unavailable.
export async function generateMatchQuestions(matchId) {
  if (!matchId) return null;
  try {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.functions.invoke("generate-ranked-questions", {
      body: { matchId },
    });
    if (error || !Array.isArray(data?.questions) || data.questions.length === 0) return null;
    return data.questions;
  } catch {
    return null;
  }
}

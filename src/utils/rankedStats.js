import { getSupabase } from "../lib/supabaseClient";

// Server-authoritative ranked LP/wins/losses/shield (see ranked_stats in
// supabase/schema.sql) — the client only ever reads this table directly;
// every write happens inside a SECURITY DEFINER function, never a raw
// insert/update from here. Guests have no account to store this against
// at all, so these are only ever called for a signed-in userId.

// One-time-per-account migration: carries over whatever LP this account
// already had (from the old client-synced save) into server storage.
// Safe to call on every login — a no-op after the first real call, since
// claim_initial_ranked_stats() only ever INSERTs, never overwrites.
export async function bootstrapRankedStats(seed) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("claim_initial_ranked_stats", {
    p_points: seed.points ?? 0,
    p_peak_points: seed.peakPoints ?? 0,
    p_wins: seed.wins ?? 0,
    p_losses: seed.losses ?? 0,
    p_shield: seed.shield ?? 0,
  });
  if (error) {
    console.error("Code Quest: ranked stats bootstrap failed", error.message);
    return null;
  }
  return data?.[0] ?? null;
}

export async function fetchRankedStats(userId) {
  if (!userId) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("ranked_stats")
    .select("points, peak_points, wins, losses, shield")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Code Quest: fetching ranked stats failed", error.message);
    return null;
  }
  // No row yet (never played, never bootstrapped) — same starting point
  // as a genuinely brand-new player.
  return data ?? { points: 0, peak_points: 0, wins: 0, losses: 0, shield: 0 };
}

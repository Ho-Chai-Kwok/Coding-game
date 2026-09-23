import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";

// Tracks one ranked_matches row live: fetches it once, then subscribes to
// Realtime updates so the opponent's result (and the eventual settlement)
// arrives the moment the server writes it, no polling needed once matched.
export function useRankedMatch(matchId) {
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId) return undefined;
    let cancelled = false;
    let channel = null;

    (async () => {
      const supabase = await getSupabase();
      const { data, error: fetchError } = await supabase
        .from("ranked_matches")
        .select("*")
        .eq("id", matchId)
        .maybeSingle();
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setMatch(data);

      channel = supabase
        .channel(`ranked-match-${matchId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "ranked_matches", filter: `id=eq.${matchId}` },
          (payload) => {
            if (!cancelled) setMatch(payload.new);
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      channel?.unsubscribe();
    };
  }, [matchId]);

  async function submitResult(score) {
    const supabase = await getSupabase();
    const { error: rpcError } = await supabase.rpc("submit_ranked_result", {
      p_match_id: matchId,
      p_score: score,
      p_finished_at: new Date().toISOString(),
    });
    if (rpcError) setError(rpcError.message);
  }

  async function claimForfeitWin() {
    const supabase = await getSupabase();
    const { error: rpcError } = await supabase.rpc("claim_forfeit_win", { p_match_id: matchId });
    if (rpcError) setError(rpcError.message);
  }

  return { match, error, submitResult, claimForfeitWin };
}

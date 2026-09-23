import { useEffect, useRef, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";

// How the acceptable rank gap widens the longer someone waits: tight at
// first (so a close-rank opponent is always preferred), growing every
// few seconds so nobody waits forever if the ladder is quiet. See
// try_ranked_match() in supabase/schema.sql — this schedule only decides
// what gap *this client* asks for each poll; the actual pairing (and the
// "closest rank first" priority within that gap) happens server-side.
const POLL_MS = 2500;
const BASE_GAP = 150;
const GAP_STEP = 150;
const GAP_STEP_SECONDS = 5;
const MAX_GAP = 3000;

function gapForWait(waitedSeconds) {
  return Math.min(MAX_GAP, BASE_GAP + Math.floor(waitedSeconds / GAP_STEP_SECONDS) * GAP_STEP);
}

// Polls try_ranked_match() every couple of seconds while `active`,
// widening the acceptable rank gap over time, until it's paired with an
// opponent (or the caller cancels). A real opponent, once found, is
// permanent for this session — polling stops entirely at that point.
// Doesn't take the caller's own points as a prop: the server reads that
// from ranked_stats itself now (see try_ranked_match() in
// supabase/schema.sql), so there's nothing for the client to pass or
// spoof there.
export function useRankedQueue({ active, modeId, displayName }) {
  const [status, setStatus] = useState("searching"); // "searching" | "matched" | "error"
  const [matchId, setMatchId] = useState(null);
  const [waitedSeconds, setWaitedSeconds] = useState(0);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    cancelledRef.current = false;
    const startedAt = Date.now();
    setStatus("searching");
    setMatchId(null);
    setWaitedSeconds(0);

    tickRef.current = setInterval(() => {
      if (!cancelledRef.current) setWaitedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    async function poll() {
      if (cancelledRef.current) return;
      const waited = Math.floor((Date.now() - startedAt) / 1000);
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.rpc("try_ranked_match", {
          p_mode_id: modeId,
          p_display_name: displayName,
          p_max_gap: gapForWait(waited),
        });
        if (cancelledRef.current) return;
        if (error) throw error;
        const found = data?.[0]?.match_id ?? null;
        if (found) {
          setMatchId(found);
          setStatus("matched");
          return;
        }
      } catch (err) {
        console.error("Code Quest: ranked matchmaking failed", err?.message ?? err);
        if (!cancelledRef.current) setStatus("error");
        return;
      }
      timeoutRef.current = setTimeout(poll, POLL_MS);
    }
    poll();

    return () => {
      cancelledRef.current = true;
      clearTimeout(timeoutRef.current);
      clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, modeId, displayName]);

  async function cancel() {
    cancelledRef.current = true;
    clearTimeout(timeoutRef.current);
    clearInterval(tickRef.current);
    try {
      const supabase = await getSupabase();
      await supabase.rpc("leave_ranked_queue");
    } catch {
      // Best-effort: the row goes stale on its own if this fails, and
      // never blocks anyone else since matching always excludes it once
      // this device stops polling.
    }
  }

  return { status, matchId, waitedSeconds, cancel };
}

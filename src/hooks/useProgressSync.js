import { useEffect, useRef, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";

const GUEST_KEY = "codequest-progress";
const userKey = (userId) => `codequest-progress:${userId}`;
const CLOUD_DEBOUNCE_MS = 1000;

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Private browsing or storage full — progress just won't persist here.
  }
}

// Every change is written to this device immediately, and to the cloud a
// moment later. The device copy is the safety net: if the tab closes before
// the cloud save lands, the newer device copy wins on the next load and is
// pushed up. `userId` null means guest mode (device only).
//
// `onHydrate(saved, userId)` gets the resolved blob plus the same userId
// this load cycle resolved for — used by App.jsx to know whether a given
// field in `saved` (like ranked LP) should still be trusted from this
// blob, or has moved to its own server-authoritative storage that only
// applies once someone's actually signed in (see ranked_stats in
// supabase/schema.sql).
//
// Returns { syncStatus }: "guest" | "saving" | "saved" | "error".
export function useProgressSync({ userId, state, onHydrate }) {
  const hydratedRef = useRef(false);
  const timeoutRef = useRef(null);
  const latestRef = useRef(null);
  const [syncStatus, setSyncStatus] = useState(userId ? "saved" : "guest");

  useEffect(() => {
    let cancelled = false;
    hydratedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSyncStatus(userId ? "saving" : "guest");

    async function load() {
      if (!(userId && isSupabaseConfigured)) {
        onHydrate(readLocal(GUEST_KEY), null);
        if (!cancelled) hydratedRef.current = true;
        return;
      }

      let cloud = null;
      let cloudFailed = false;
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("progress")
          .select("data")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) cloudFailed = true;
        else cloud = data?.data ?? null;
      } catch {
        cloudFailed = true;
      }
      if (cancelled) return;

      const local = readLocal(userKey(userId));
      let chosen = cloud;
      if (local && (!cloud || (local.savedAt ?? 0) > (cloud.savedAt ?? 0))) chosen = local;

      // First login on this device with nothing saved anywhere: bring over
      // whatever this person built as a guest so signing up doesn't reset it.
      if (!chosen && !cloudFailed) {
        const guest = readLocal(GUEST_KEY);
        if (guest) {
          chosen = guest;
          try {
            localStorage.removeItem(GUEST_KEY);
          } catch {
            // Nothing to clean up.
          }
        }
      }

      onHydrate(chosen, userId);
      hydratedRef.current = true;
      setSyncStatus(cloudFailed ? "error" : "saved");
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function pushToCloud(payload) {
    try {
      const supabase = await getSupabase();
      // Supabase query builders are lazy — the request only fires once awaited.
      const { error } = await supabase.from("progress").upsert({
        user_id: userId,
        data: payload,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      if (latestRef.current === payload) setSyncStatus("saved");
    } catch (err) {
      console.error("Code Quest: cloud save failed", err?.message ?? err);
      setSyncStatus("error");
    }
  }

  useEffect(() => {
    if (!hydratedRef.current) return;

    const payload = { ...state, savedAt: Date.now() };
    latestRef.current = payload;
    writeLocal(userId ? userKey(userId) : GUEST_KEY, payload);

    if (!(userId && isSupabaseConfigured)) return;

    setSyncStatus("saving"); // eslint-disable-line react-hooks/set-state-in-effect
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => pushToCloud(payload), CLOUD_DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId]);

  // Retry a failed cloud save when the connection comes back.
  useEffect(() => {
    function retry() {
      if (userId && latestRef.current) pushToCloud(latestRef.current);
    }
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { syncStatus };
}

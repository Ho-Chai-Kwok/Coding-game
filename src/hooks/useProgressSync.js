import { useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const LOCAL_KEY = "codequest-progress";
const SAVE_DEBOUNCE_MS = 800;

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    // Private browsing or storage full — progress just won't persist.
  }
}

// Loads saved progress once (from Supabase when logged in, otherwise from
// localStorage), then debounced-saves it back on every change. `userId`
// being null means guest mode.
export function useProgressSync({ userId, state, onHydrate }) {
  const hydratedRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    hydratedRef.current = false;

    async function load() {
      if (userId && isSupabaseConfigured) {
        const { data } = await supabase
          .from("progress")
          .select("data")
          .eq("user_id", userId)
          .maybeSingle();
        if (!cancelled) onHydrate(data?.data ?? null);
      } else {
        onHydrate(loadLocal());
      }
      if (!cancelled) hydratedRef.current = true;
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      if (userId && isSupabaseConfigured) {
        supabase
          .from("progress")
          .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() });
      } else {
        saveLocal(state);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId]);
}

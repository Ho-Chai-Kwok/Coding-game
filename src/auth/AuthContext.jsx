import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { AuthContext } from "./useAuth";

const GUEST_STORAGE_KEY = "codequest-guest";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem(GUEST_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [authError, setAuthError] = useState(null);
  // True while someone who clicked a "reset password" email link is choosing
  // a new password. Detected from the link's URL right away because Supabase
  // may announce the recovery before our listener is attached.
  const [recovering, setRecovering] = useState(
    () => isSupabaseConfigured && window.location.hash.includes("type=recovery"),
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let subscription;
    let cancelled = false;

    getSupabase().then(async (supabase) => {
      if (cancelled) return;
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
      subscription = supabase.auth.onAuthStateChange((event, newSession) => {
        setSession(newSession);
        if (event === "PASSWORD_RECOVERY") setRecovering(true);
      }).data.subscription;
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  function continueAsGuest() {
    setIsGuest(true);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, "true");
    } catch {
      // Guest mode still works for this session even if it can't persist.
    }
  }

  async function signUp(email, password, displayName, captchaToken) {
    if (!isSupabaseConfigured) {
      setAuthError("backendNotConfigured");
      return { error: "backendNotConfigured" };
    }
    setAuthError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || "Coder" }, captchaToken },
    });
    if (error) setAuthError(error.message);
    return { error: error?.message ?? null };
  }

  async function signIn(email, password, captchaToken) {
    if (!isSupabaseConfigured) {
      setAuthError("backendNotConfigured");
      return { error: "backendNotConfigured" };
    }
    setAuthError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });
    if (error) setAuthError(error.message);
    return { error: error?.message ?? null };
  }

  async function resetPassword(email, captchaToken) {
    if (!isSupabaseConfigured) return { error: "backendNotConfigured" };
    const supabase = await getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
      captchaToken,
    });
    return { error: error?.message ?? null };
  }

  async function updatePassword(newPassword) {
    if (!isSupabaseConfigured) return { error: "backendNotConfigured" };
    const supabase = await getSupabase();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setRecovering(false);
      // Drop the leftover recovery tokens from the address bar.
      window.history.replaceState(null, "", window.location.pathname);
    }
    return { error: error?.message ?? null };
  }

  // Permanently deletes the signed-in account and its saved progress via the
  // delete_my_account() database function (see supabase/schema.sql).
  async function deleteAccount() {
    if (!isSupabaseConfigured || !session?.user) return { error: "backendNotConfigured" };
    const userId = session.user.id;
    const supabase = await getSupabase();
    const { error } = await supabase.rpc("delete_my_account");
    if (error) return { error: error.message };
    try {
      localStorage.removeItem(`codequest-progress:${userId}`);
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      // Nothing to clean up if storage isn't available.
    }
    await supabase.auth.signOut();
    setIsGuest(false);
    return { error: null };
  }

  async function signOut() {
    if (isSupabaseConfigured) await (await getSupabase()).auth.signOut();
    setIsGuest(false);
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      // Nothing to clean up if storage isn't available.
    }
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    isGuest,
    isLoggedIn: Boolean(session?.user),
    authError,
    recovering,
    resetPassword,
    updatePassword,
    deleteAccount,
    continueAsGuest,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

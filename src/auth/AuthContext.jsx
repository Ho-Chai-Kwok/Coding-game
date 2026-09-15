import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const GUEST_STORAGE_KEY = "codequest-guest";

const AuthContext = createContext(null);

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

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function continueAsGuest() {
    setIsGuest(true);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, "true");
    } catch {
      // Guest mode still works for this session even if it can't persist.
    }
  }

  async function signUp(email, password, displayName) {
    if (!isSupabaseConfigured) {
      setAuthError("backendNotConfigured");
      return { error: "backendNotConfigured" };
    }
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || "Coder" } },
    });
    if (error) setAuthError(error.message);
    return { error: error?.message ?? null };
  }

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      setAuthError("backendNotConfigured");
      return { error: "backendNotConfigured" };
    }
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    return { error: error?.message ?? null };
  }

  async function signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
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
    continueAsGuest,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

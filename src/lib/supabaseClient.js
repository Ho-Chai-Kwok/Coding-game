import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Both values are meant to be public/client-exposed for Supabase — real
// security comes from Row Level Security policies on the database side,
// not from hiding these. Until they're set, the app runs in guest-only
// mode instead of crashing.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

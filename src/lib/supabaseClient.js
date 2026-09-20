const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Both values are meant to be public/client-exposed for Supabase — real
// security comes from Row Level Security policies on the database side,
// not from hiding these. Until they're set, the app runs in guest-only
// mode instead of crashing.
export const isSupabaseConfigured = Boolean(url && anonKey);

let clientPromise = null;

// The SDK is ~200kB, so it's loaded on demand rather than in the first bundle.
export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url, anonKey),
    );
  }
  return clientPromise;
}

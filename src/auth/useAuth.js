import { createContext, useContext } from "react";

// Same split as src/i18n/useI18n.js, same reason: AuthContext.jsx
// exporting the context (or the hook) alongside its Provider component
// broke Fast Refresh for every one of its consumers (CQ-20).
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

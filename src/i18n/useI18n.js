import { createContext, useContext } from "react";

// The context object and the hook both live here, away from the
// Provider component in I18nContext.jsx (CQ-20) — a file exporting a
// component alongside anything else (a hook, or even just the raw
// context) breaks Fast Refresh for every one of its many consumers.
export const I18nContext = createContext(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

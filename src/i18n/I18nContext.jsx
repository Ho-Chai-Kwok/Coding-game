import { createContext, useContext, useState, useMemo } from "react";
import { getTranslation, LOCALES } from "./translations";

const STORAGE_KEY = "codequest-locale";

const I18nContext = createContext(null);

function detectInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES.some((l) => l.code === saved)) return saved;
  } catch {
    // localStorage unavailable — fall through to default.
  }
  return "en";
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitialLocale);

  function setLocale(code) {
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore write failures (private browsing, etc.) — locale still
      // applies for this session.
    }
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key) => getTranslation(locale, key),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

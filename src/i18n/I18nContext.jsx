import { useState, useMemo, useEffect } from "react";
import { getTranslation, LOCALES } from "./translations";
import { I18nContext } from "./useI18n";

const STORAGE_KEY = "codequest-locale";

// CQ-11: a saved choice (the user explicitly picked a language before)
// always wins; otherwise matches the browser's own language list against
// what's actually translated, so a fresh visitor gets their own language
// when there's a real match instead of always landing in English.
const BASE_LANGUAGE_TO_LOCALE = {
  es: "es",
  ko: "ko",
  // Chinese has no single BCP-47 tag that means "the one Chinese variant
  // this app ships" — zh-HK and zh-TW (Hong Kong/Taiwan, both
  // Traditional-script) and the script-only zh-Hant all mean the same
  // thing here, since zh-TW is the only Chinese locale translated.
  // Simplified-script zh-CN/zh-SG intentionally don't match: showing
  // Traditional characters to a Simplified reader isn't actually better
  // than English, so those fall through to the "en" default below.
  "zh-hk": "zh-TW",
  "zh-tw": "zh-TW",
  "zh-hant": "zh-TW",
};

function detectInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES.some((l) => l.code === saved)) return saved;
  } catch {
    // localStorage unavailable — fall through to browser detection.
  }

  const browserLanguages = typeof navigator !== "undefined" ? navigator.languages || [navigator.language] : [];
  for (const tag of browserLanguages) {
    if (!tag) continue;
    const lower = tag.toLowerCase();
    if (BASE_LANGUAGE_TO_LOCALE[lower]) return BASE_LANGUAGE_TO_LOCALE[lower];
    const base = lower.split("-")[0];
    if (BASE_LANGUAGE_TO_LOCALE[base]) return BASE_LANGUAGE_TO_LOCALE[base];
  }
  return "en";
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitialLocale);

  // Keeps the <html lang> attribute in sync with the chosen locale —
  // screen readers and browser translation prompts rely on this, and it
  // costs nothing to keep accurate.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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

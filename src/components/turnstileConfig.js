// Split out of TurnstileWidget.jsx (CQ-20) — same Fast Refresh reason as
// useI18n/useAuth: a component file exporting plain constants alongside
// its component broke Fast Refresh for every consumer of either.
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
export const isCaptchaEnabled = Boolean(TURNSTILE_SITE_KEY);

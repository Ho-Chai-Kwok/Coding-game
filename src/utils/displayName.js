// Guards against a Ranked display name leaking contact info (email,
// phone number, URL) to an opponent, or containing an obviously
// inappropriate word — see QA_REPORT.md CQ-06. This is client-side UX
// (an immediate, friendly rejection while typing); the real backstop
// that can't be bypassed by calling the API directly is the matching
// is_safe_display_name() CHECK constraint in supabase/schema.sql — keep
// the two in sync if either changes.
//
// This blocklist is a deliberately short, basic first pass (the most
// unambiguous, universally-recognized severe terms), not a complete
// content-moderation system — no list like this ever is. It exists to
// catch the obvious cases, not to replace real moderation tooling if
// this app ever needs it at scale.
//
// Matched on WHOLE-WORD boundaries only (\b...\b), not as a raw
// substring — see QA_REPORT.md CQ-06b. A plain .includes() check is the
// classic "Scunthorpe problem": it blocked "Grape", "Skyscraper",
// "Trapeze", and "Drapery" (all contain "rape"), "Scunthorpe" (contains
// "cunt"), and "Ganazi" (contains "nazi"). \b only matches at an actual
// word edge, so "cunt" inside "sCUNThorpe" (letter on both sides, no
// boundary) never matches, while a real standalone "cunt" still does.
const BLOCKED_WORDS = ["nigger", "nigga", "faggot", "retard", "cunt", "rape", "nazi"];
const BLOCKED_WORD_PATTERN = new RegExp(`\\b(?:${BLOCKED_WORDS.join("|")})\\b`, "i");

const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const URL_PATTERN = /(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|net|org|io|co|me|tv|gg)\b/i;

function hasLongDigitRun(text) {
  // A phone number, with or without separators (spaces, dashes, dots,
  // parens) — strip everything that isn't a digit and look for a run of
  // 7+ (a US/intl local number minimum), not just "any number" (so a
  // display name like "Player2024" or "Level99" is never falsely caught).
  const digitsOnly = text.replace(/[^0-9]/g, "");
  return /\d{7,}/.test(digitsOnly);
}

/**
 * Returns a reason string if `name` should be rejected, or null if it's
 * fine. Mirrors is_safe_display_name() in supabase/schema.sql.
 */
export function unsafeDisplayNameReason(name) {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "empty";
  if (trimmed.length > 30) return "too-long";
  if (EMAIL_PATTERN.test(trimmed)) return "email";
  if (URL_PATTERN.test(trimmed)) return "url";
  if (hasLongDigitRun(trimmed)) return "phone";
  if (BLOCKED_WORD_PATTERN.test(trimmed)) return "blocked-word";
  return null;
}

export function isSafeDisplayName(name) {
  return unsafeDisplayNameReason(name) === null;
}

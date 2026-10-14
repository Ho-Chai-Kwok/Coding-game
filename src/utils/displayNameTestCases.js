// Shared good/bad display-name test cases, checked against BOTH
// src/utils/displayName.js (JS) and is_safe_display_name() in
// supabase/schema.sql (SQL) by scripts/verify-display-names.mjs — see
// QA_REPORT.md CQ-06b. The two implementations are meant to agree
// exactly; this table is what keeps that true instead of assumed.
//
// The "allowed" cases aren't filler — every one of them is a name the
// first (buggy) version of this filter actually rejected, because a raw
// substring match caught "rape" inside "Grape"/"Skyscraper"/"Trapeze"/
// "Drapery", "cunt" inside "Scunthorpe", and "nazi" inside "Ganazi" (the
// classic "Scunthorpe problem"). The "blocked" cases are the ones that
// slipped through the database specifically because its old URL pattern
// used \b, which in Postgres's regex dialect is a literal backspace
// character, not a word boundary — so it never matched real input.
export const DISPLAY_NAME_TEST_CASES = [
  { name: "Grape", expected: true },
  { name: "GrapeJuice", expected: true },
  { name: "Skyscraper", expected: true },
  { name: "Trapeze", expected: true },
  { name: "Drapery", expected: true },
  { name: "Scunthorpe", expected: true },
  { name: "Ganazi", expected: true },
  { name: "Coder", expected: true },
  { name: "Pixel99", expected: true },
  { name: "Swift Falcon", expected: true },
  { name: "kid@mail.com", expected: false },
  { name: "mysite.com", expected: false },
  { name: "coolsite.gg", expected: false },
  { name: "go to coolsite.gg now", expected: false },
  { name: "91234567", expected: false },
  { name: "call 555-123-4567", expected: false },
  { name: "www.example.org", expected: false },
  { name: "cunt", expected: false },
  { name: "nazi", expected: false },
  { name: "rape", expected: false },
];

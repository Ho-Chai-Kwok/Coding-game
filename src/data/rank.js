export const TIERS = [
  { name: "Bronze", min: 0, color: "#b08d57" },
  { name: "Silver", min: 1000, color: "#9ca3af" },
  { name: "Gold", min: 2000, color: "#f59e0b" },
  { name: "Platinum", min: 3000, color: "#22d3ee" },
  { name: "Diamond", min: 4000, color: "#818cf8" },
  { name: "Master", min: 5000, color: "#f43f5e" },
  { name: "Grandmaster", min: 6000, color: "#d946ef" },
];

const DIVISIONS = ["III", "II", "I"];

export function getRankInfo(points) {
  const clamped = Math.max(0, points);
  let tierIndex = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (clamped >= TIERS[i].min) {
      tierIndex = i;
      break;
    }
  }

  const tier = TIERS[tierIndex];
  const nextTier = TIERS[tierIndex + 1];
  const isMaxTier = !nextTier;
  const rangeStart = tier.min;
  const rangeEnd = nextTier ? nextTier.min : tier.min + 900;
  const rangeSize = rangeEnd - rangeStart;

  const progressInTier = clamped - rangeStart;
  const divisionSize = rangeSize / DIVISIONS.length;
  const divisionIndex = Math.min(
    DIVISIONS.length - 1,
    Math.floor(progressInTier / divisionSize),
  );
  const division = isMaxTier ? "" : DIVISIONS[divisionIndex];

  const progressPercent = Math.min(
    100,
    (progressInTier / rangeSize) * 100,
  );

  return {
    tierIndex,
    divisionIndex: isMaxTier ? 0 : divisionIndex,
    tierName: tier.name,
    color: tier.color,
    division,
    label: division ? `${tier.name} ${division}` : tier.name,
    points: clamped,
    pointsToNext: isMaxTier ? null : rangeEnd - clamped,
    progressPercent,
    isMaxTier,
  };
}

// Which of the 7 ranked-question difficulty levels a player's LP maps to
// (1 = Bronze, easiest, 7 = Grandmaster, hardest) — used to pick
// appropriately-hard questions from the ranked question bank.
export function getDifficultyLevel(points) {
  const clamped = Math.max(0, points);
  let tierIndex = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (clamped >= TIERS[i].min) {
      tierIndex = i;
      break;
    }
  }
  return tierIndex + 1;
}

// After a promotion into a new tier the player gets a shield: for the next
// few matches a loss can't drop them back below that tier's floor. Stops one
// unlucky match from instantly undoing a promotion.
export const PROMOTION_SHIELD_MATCHES = 3;

// A rank position that orders divisions across tiers (Silver III > Bronze I).
export function rankPosition(info) {
  return info.tierIndex * DIVISIONS.length + info.divisionIndex;
}

// Describes how a real, already-settled match changed a player's rank —
// purely for the celebration/softening UI (RankChange.jsx). The LP
// arithmetic itself already happened server-side
// (apply_ranked_settlement() in supabase/schema.sql, called from
// submit_ranked_result()/claim_forfeit_win()); this only compares the
// before/after totals the server gave back to decide which message to
// show, it never computes or trusts a new points value itself. `delta`
// (the server-computed per-match swing — still legitimate, see
// estimatedEloDelta's comment below) is used only to notice a shield
// save: a negative delta that would have dropped the raw total below the
// tier floor, but didn't because the server's own floor-clamp caught it.
// `hadShield` (the player's shield count going INTO the match) matters
// because Bronze III's floor is 0 — the same value everyone's LP is
// already clamped to regardless of any shield (see apply_ranked_settlement's
// unconditional `greatest(0, ...)`) — so landing exactly on 0 doesn't by
// itself prove a shield did anything; without checking hadShield, a
// brand-new player at 0 LP taking any loss would wrongly get credited
// with a "shield save" they never had.
export function describeRankChange(oldPoints, newPoints, delta, hadShield) {
  const before = getRankInfo(oldPoints);
  const after = getRankInfo(newPoints);
  const beforePos = rankPosition(before);
  const afterPos = rankPosition(after);

  const floor = TIERS[before.tierIndex].min;
  const shieldSaved =
    hadShield &&
    delta < 0 &&
    oldPoints + delta < floor &&
    after.tierIndex === before.tierIndex &&
    newPoints === floor;

  let kind = null;
  if (after.tierIndex > before.tierIndex) kind = "promoted";
  else if (after.tierIndex < before.tierIndex) kind = "demoted";
  else if (afterPos > beforePos) kind = "divisionUp";
  else if (afterPos < beforePos) kind = "divisionDown";
  else if (shieldSaved) kind = "shielded";

  return kind && { kind, from: before, to: after, shieldSaved };
}

// Ranked matches are player-vs-player: the LP swing depends on how the two
// real opponents' ranks compare, not a fixed per-mode amount — beating a
// higher-ranked opponent nets more, beating a lower-ranked one nets less
// (and the mirror image for a loss). This is the same zero-sum,
// ELO-style formula the server uses to actually settle a match
// (submit_ranked_result() in supabase/schema.sql) — it's exported here
// only so the client can show a "before the match" LP estimate; the real
// number always comes back from the server afterward, never computed
// or trusted from the client.
export const RANKED_ELO_K = 40;

export function estimatedEloDelta(myPoints, opponentPoints, outcome) {
  const expected = 1 / (1 + 10 ** ((opponentPoints - myPoints) / 400));
  return Math.round(RANKED_ELO_K * (outcome - expected));
}

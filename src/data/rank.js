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

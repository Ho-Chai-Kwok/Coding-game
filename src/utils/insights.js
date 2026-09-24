import { STREAK_MILESTONES } from "../data/rewards";
import { SKILL_GATE_LESSONS, meetsSkillGate } from "../data/skillGate";

// Settings → "For You": a handful of personalized, honest observations
// about how someone's actually been doing — built entirely from real,
// already-tracked state (no guessing, no fabricated stats). Deliberately
// avoids repeating what's already visible elsewhere (the rank badge, the
// Home progress bar) in favor of things that only show up when you look
// across several pieces of data at once — same "kind" + params pattern
// as describeRankChange()/RankChange.jsx: this decides WHICH notes apply
// and with what numbers, the component does the actual t() lookup so
// every string stays in translations.js like everywhere else.
const CATEGORY_ORDER = ["computerScience", "dataScience", "ai", "career"];

function sideQuestCategoryStats(sideQuestsState) {
  const stats = {};
  for (const cat of CATEGORY_ORDER) stats[cat] = { completed: 0, total: 0 };
  for (const quest of sideQuestsState) {
    const cat = quest.tags?.[0];
    if (!cat || !stats[cat]) continue;
    stats[cat].completed += quest.lessons.filter((l) => l.status === "completed").length;
    stats[cat].total += quest.lessons.length;
  }
  return stats;
}

export function getSuggestions({
  mainLessonsCompleted,
  streak,
  sideQuestsState,
  rankedWins,
  rankedLosses,
  rankedShield,
  unlockedAvatarsCount,
  totalAvatarsCount,
}) {
  const suggestions = [];
  const skillGateMet = meetsSkillGate(mainLessonsCompleted);

  // Learning path: only one of these two, since a locked skill gate is
  // implied by "hasn't started" and repeating both would be redundant.
  if (mainLessonsCompleted === 0) {
    suggestions.push({ kind: "learningNotStarted" });
  } else if (!skillGateMet) {
    suggestions.push({ kind: "skillGateLocked", n: SKILL_GATE_LESSONS - mainLessonsCompleted });
  }

  // Streak: the next reward on the ladder and how many days are left —
  // genuinely new information, not shown anywhere else in the app today.
  const nextMilestone = STREAK_MILESTONES.find((m) => m.day > streak);
  if (streak >= 1 && nextMilestone) {
    suggestions.push({
      kind: "streakMilestone",
      streak,
      n: nextMilestone.day - streak,
      reward: nextMilestone.avatar ?? `${nextMilestone.lp} LP`,
    });
  }

  // Ranked: at most one note, most actionable first (an unused shield is
  // time-sensitive — it's only good until the next match settles).
  const rankedGames = rankedWins + rankedLosses;
  if (rankedShield > 0) {
    suggestions.push({ kind: "rankedShieldActive", n: rankedShield });
  } else if (rankedGames >= 3) {
    const winRate = rankedWins / rankedGames;
    if (winRate < 0.4) suggestions.push({ kind: "rankedToughStretch" });
    else if (winRate >= 0.6) suggestions.push({ kind: "rankedGoodWinRate", n: Math.round(winRate * 100) });
  } else if (skillGateMet && rankedGames === 0) {
    suggestions.push({ kind: "rankedNotTried" });
  }

  // Side quest categories: only meaningful once quests are actually
  // reachable — no point suggesting one while they're still locked.
  if (skillGateMet) {
    const stats = sideQuestCategoryStats(sideQuestsState);
    const unexplored = CATEGORY_ORDER.find((cat) => stats[cat].completed === 0 && stats[cat].total > 0);
    if (unexplored) suggestions.push({ kind: "categoryUnexplored", category: unexplored });

    const strongest = CATEGORY_ORDER.filter((cat) => stats[cat].completed >= 3).sort(
      (a, b) => stats[b].completed - stats[a].completed,
    )[0];
    if (strongest) {
      suggestions.push({ kind: "categoryStrong", category: strongest, n: stats[strongest].completed });
    }
  }

  // Characters
  if (unlockedAvatarsCount < totalAvatarsCount) {
    suggestions.push({ kind: "charactersToUnlock", n: totalAvatarsCount - unlockedAvatarsCount });
  }

  return suggestions;
}

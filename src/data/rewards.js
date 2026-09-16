// Streak milestones: reached using the user's best current login streak.
// Once claimed, a milestone stays claimed forever (even if the streak
// later resets) — this is a lifetime achievement ladder, not something
// you have to re-earn every cycle.
export const STREAK_MILESTONES = [
  { day: 1, lp: 10 },
  { day: 2, lp: 10 },
  { day: 3, avatar: "🐨" },
  { day: 5, lp: 25 },
  { day: 7, lp: 50, avatar: "🦉" },
  { day: 10, lp: 50 },
  { day: 14, avatar: "🐲" },
  { day: 21, lp: 100 },
  { day: 30, lp: 200, avatar: "🦄" },
];

// Avatars everyone can pick from the start.
export const BASE_AVATARS = ["🦊", "🐱", "🐶", "🐼", "🦁", "🐸", "🐹", "🐧"];

// Avatars only unlockable via the streak reward ladder above.
export const REWARD_AVATARS = STREAK_MILESTONES.filter((m) => m.avatar).map(
  (m) => ({ avatar: m.avatar, day: m.day }),
);

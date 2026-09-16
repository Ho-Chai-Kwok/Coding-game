function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

// Given the previously saved streak count and the date it was last updated,
// returns the streak as of today: unchanged if already played today,
// incremented if played yesterday (kept the streak alive), or reset to 1
// if there's a gap of more than a day.
export function computeStreak(prevStreak, lastPlayedDate) {
  const today = todayKey();
  if (lastPlayedDate === today) {
    return { streak: prevStreak || 1, lastPlayedDate: today };
  }
  if (lastPlayedDate === yesterdayKey()) {
    return { streak: (prevStreak || 0) + 1, lastPlayedDate: today };
  }
  return { streak: 1, lastPlayedDate: today };
}

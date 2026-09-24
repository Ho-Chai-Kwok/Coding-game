// Side Quests and Ranked Mode both assume some basic coding literacy
// (reading real syntax, knowing what a variable/function is) that a
// learner who just signed up doesn't have yet. Rather than let a total
// beginner wander into a timed Ranked match or a "REST APIs" quiz with
// zero foundation, both are locked behind finishing a small amount of
// the main Learning Mode path first — see App.jsx's `mainLessonsCompleted`
// (counts ONLY worldsState, never side-quest lessons, so this can't be
// circularly unlocked by the very thing it's gating).
export const SKILL_GATE_LESSONS = 10;

export function meetsSkillGate(mainLessonsCompleted) {
  return mainLessonsCompleted >= SKILL_GATE_LESSONS;
}

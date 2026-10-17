import { useMemo, useState } from "react";
import { useI18n } from "../i18n/useI18n";
import { PRACTICE_PROBLEMS, PRACTICE_TOPICS, TOPIC_HINTS, leetcodeUrl } from "../data/practiceProblems";
import { SKILL_GATE_LESSONS, meetsSkillGate } from "../data/skillGate";
import SkillGateNotice from "./SkillGateNotice";

const DIFFICULTIES = [...new Set(PRACTICE_PROBLEMS.map((p) => p.difficulty))];

// A reference index of well-known, classic algorithm problems (see
// data/practiceProblems.js for why this links OUT to the real problem
// instead of reproducing it) — the actual value this screen adds over
// just Googling a problem list is the right-hand "skills you'll need"
// panel, cross-referencing each problem to real Code Quest worlds so a
// stuck learner has somewhere concrete to go back to.
export default function PracticeProblems({ worldsState, mainLessonsCompleted = 0, onReviewWorld, onGoToLearning, onBack }) {
  const { t } = useI18n();
  const unlocked = meetsSkillGate(mainLessonsCompleted);
  const [difficultyFilter, setDifficultyFilter] = useState(null);
  const [topicFilter, setTopicFilter] = useState(null);
  const [selectedId, setSelectedId] = useState(PRACTICE_PROBLEMS[0]?.id ?? null);

  const visible = useMemo(
    () =>
      PRACTICE_PROBLEMS.filter(
        (p) =>
          (!difficultyFilter || p.difficulty === difficultyFilter) &&
          (!topicFilter || p.topic === topicFilter),
      ),
    [difficultyFilter, topicFilter],
  );

  const selected = visible.find((p) => p.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="practice-problems">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>
      <h1>🧩 {t("practiceProblems.title")}</h1>

      {!unlocked ? (
        <SkillGateNotice
          lessonsCompleted={mainLessonsCompleted}
          lessonsRequired={SKILL_GATE_LESSONS}
          onGoToLearning={onGoToLearning}
        />
      ) : (
        <>
          <p className="practice-problems__intro">{t("practiceProblems.intro")}</p>

          <div className="practice-problems__filter-row">
            <button
              className={`practice-problems__chip${!difficultyFilter ? " practice-problems__chip--active" : ""}`}
              onClick={() => setDifficultyFilter(null)}
            >
              {t("practiceProblems.allDifficulties")}
            </button>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`practice-problems__chip${difficultyFilter === d ? " practice-problems__chip--active" : ""}`}
                onClick={() => setDifficultyFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="practice-problems__filter-row practice-problems__filter-row--topics">
            <button
              className={`practice-problems__chip${!topicFilter ? " practice-problems__chip--active" : ""}`}
              onClick={() => setTopicFilter(null)}
            >
              {t("practiceProblems.allTopics")}
            </button>
            {PRACTICE_TOPICS.map((topic) => (
              <button
                key={topic}
                className={`practice-problems__chip${topicFilter === topic ? " practice-problems__chip--active" : ""}`}
                onClick={() => setTopicFilter(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          {topicFilter && TOPIC_HINTS[topicFilter] && (
            <p className="practice-problems__topic-hint">
              💡 {t("practiceProblems.topicHintLabel")} {TOPIC_HINTS[topicFilter]}
            </p>
          )}

          <div className="practice-problems__layout">
            <div className="practice-problems__list">
              {visible.map((p) => (
                <button
                  key={p.id}
                  className={`practice-problems__row${selected?.id === p.id ? " practice-problems__row--active" : ""}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <span className={`practice-problems__difficulty practice-problems__difficulty--${p.difficulty.toLowerCase()}`}>
                    {p.difficulty}
                  </span>
                  <span className="practice-problems__row-title">{p.title}</span>
                  <span className="practice-problems__row-topic">{p.topic}</span>
                </button>
              ))}
              {visible.length === 0 && (
                <p className="practice-problems__empty">{t("practiceProblems.noneMatch")}</p>
              )}
            </div>

            {selected && (
              <div className="practice-problems__detail">
                <span className={`practice-problems__difficulty practice-problems__difficulty--${selected.difficulty.toLowerCase()}`}>
                  {selected.difficulty}
                </span>
                <h2>{selected.title}</h2>
                <p className="practice-problems__topic-tag">{selected.topic}</p>
                <p className="practice-problems__summary">{selected.summary}</p>
                {TOPIC_HINTS[selected.topic] && (
                  <p className="practice-problems__topic-hint practice-problems__topic-hint--detail">
                    💡 {t("practiceProblems.topicHintLabel")} {TOPIC_HINTS[selected.topic]}
                  </p>
                )}
                <a
                  className="practice-problems__leetcode-link"
                  href={leetcodeUrl(selected.leetcodeSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("practiceProblems.openOnLeetcode")} ↗
                </a>

                <h3 className="practice-problems__skills-title">
                  📚 {t("practiceProblems.skillsTitle")}
                </h3>
                <div className="practice-problems__skills">
                  {selected.requiredWorldIds.map((wid) => {
                    const world = worldsState.find((w) => w.id === wid);
                    if (!world) return null;
                    const locked = world.status === "locked";
                    const completedCount = world.levels.filter((l) => l.status === "completed").length;
                    const done = completedCount === world.levels.length;
                    return (
                      <div key={wid} className="practice-problems__skill">
                        <span className="practice-problems__skill-icon">{locked ? "🔒" : world.icon}</span>
                        <span className="practice-problems__skill-name">{world.name}</span>
                        {locked ? (
                          <span className="practice-problems__skill-locked">
                            {t("practiceProblems.lockedHint")}
                          </span>
                        ) : (
                          <button
                            className="practice-problems__skill-review"
                            onClick={() => onReviewWorld(wid)}
                          >
                            {done ? t("practiceProblems.reviewDone") : t("practiceProblems.review")} →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

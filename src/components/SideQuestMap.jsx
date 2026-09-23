import { useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nContext";

export default function SideQuestMap({ sidequests, onSelectQuest, onBack }) {
  const { t } = useI18n();
  const [activeTag, setActiveTag] = useState(null);
  const totalLessons = sidequests.reduce((sum, q) => sum + q.lessons.length, 0);
  const completedLessons = sidequests.reduce(
    (sum, q) => sum + q.lessons.filter((l) => l.status === "completed").length,
    0,
  );

  // Every unique tag across all quests, in first-seen order, so a filter
  // row only ever shows categories that actually exist — most quests have
  // no tags at all today and simply aren't affected by any filter.
  const tags = useMemo(() => {
    const seen = [];
    for (const q of sidequests) {
      for (const tag of q.tags ?? []) {
        if (!seen.includes(tag)) seen.push(tag);
      }
    }
    return seen;
  }, [sidequests]);

  const visibleQuests = activeTag
    ? sidequests.filter((q) => q.tags?.includes(activeTag))
    : sidequests;

  return (
    <div className="world-map">
      <header className="world-map__header">
        <button className="back-link" onClick={onBack}>
          ← {t("backToModes")}
        </button>
        <h1>{t("sideQuestMap.title")}</h1>
        <p>
          {t("sideQuestMap.subtitle")} {completedLessons}/{totalLessons}{" "}
          {t("sideQuestMap.lessonsComplete")}
        </p>
      </header>

      {tags.length > 0 && (
        <div className="side-quest-map__tags">
          <button
            className={`side-quest-map__tag-chip${activeTag === null ? " side-quest-map__tag-chip--active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            {t("sideQuestMap.allQuests")}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`side-quest-map__tag-chip${activeTag === tag ? " side-quest-map__tag-chip--active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {t(`sideQuestMap.tag_${tag}`)}
            </button>
          ))}
        </div>
      )}

      <div className="world-map__grid">
        {visibleQuests.map((quest) => {
          const completedCount = quest.lessons.filter(
            (l) => l.status === "completed",
          ).length;
          const done = completedCount === quest.lessons.length;

          return (
            <button
              key={quest.id}
              className="world-card side-quest-card"
              style={{ "--world-from": quest.from, "--world-to": quest.to }}
              onClick={() => onSelectQuest(quest)}
            >
              {done && <span className="side-quest-card__badge">✓</span>}
              {quest.tags?.length > 0 && (
                <span className="side-quest-card__tag">
                  {t(`sideQuestMap.tag_${quest.tags[0]}`)}
                </span>
              )}
              <span className="world-card__icon">{quest.icon}</span>
              <span className="world-card__name">{quest.name}</span>
              <span className="world-card__progress">
                {completedCount}/{quest.lessons.length} {t("sideQuestMap.lessons")}
              </span>
              <span className="world-card__bar">
                <span
                  className="world-card__bar-fill"
                  style={{
                    width: `${(completedCount / quest.lessons.length) * 100}%`,
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

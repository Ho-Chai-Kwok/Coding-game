import { useI18n } from "../i18n/I18nContext";

export default function SideQuestMap({ sidequests, onSelectQuest, onBack }) {
  const { t } = useI18n();
  const totalLessons = sidequests.reduce((sum, q) => sum + q.lessons.length, 0);
  const completedLessons = sidequests.reduce(
    (sum, q) => sum + q.lessons.filter((l) => l.status === "completed").length,
    0,
  );

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

      <div className="world-map__grid">
        {sidequests.map((quest) => {
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

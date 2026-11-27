import { useI18n } from "../i18n/useI18n";

export default function SideQuestPath({ quest, onSelectLesson, onBack }) {
  const { t } = useI18n();
  const completedCount = quest.lessons.filter(
    (l) => l.status === "completed",
  ).length;
  const progressPercent = (completedCount / quest.lessons.length) * 100;

  return (
    <div
      className="quest-path"
      style={{ "--world-from": quest.from, "--world-to": quest.to }}
    >
      <button className="back-link" onClick={onBack}>
        ← {t("backToAllQuests")}
      </button>

      <header className="quest-path__header">
        <span className="quest-path__icon">{quest.icon}</span>
        <h1>{quest.name}</h1>
        <p>
          {completedCount}/{quest.lessons.length} {t("sideQuestPath.lessonsComplete")}
        </p>
        <div className="quest-path__progress-track">
          <div
            className="quest-path__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <div className="quest-path__list">
        {quest.lessons.map((lesson) => {
          const locked = lesson.status === "locked";
          const completed = lesson.status === "completed";

          return (
            <button
              key={lesson.id}
              className={`quest-lesson-row${locked ? " quest-lesson-row--locked" : ""}${
                completed ? " quest-lesson-row--completed" : ""
              }`}
              onClick={() => !locked && onSelectLesson(lesson)}
              disabled={locked}
            >
              <span className="quest-lesson-row__number">
                {completed ? "✓" : locked ? "🔒" : lesson.lessonNumber}
              </span>
              <span className="quest-lesson-row__title">{lesson.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useI18n } from "../i18n/I18nContext";

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default function WorldMap({
  worlds,
  language,
  onChangeLanguage,
  onSelectWorld,
  onBack,
}) {
  const { t } = useI18n();
  const chapters = chunk(worlds, 10);
  const chapterNames = t("worldMap.chapters");

  return (
    <div className="world-map">
      <header className="world-map__header">
        <button className="back-link" onClick={onBack}>
          ← {t("backToModes")}
        </button>
        <h1>{t("worldMap.title")}</h1>
        <p>{t("worldMap.subtitle")}</p>
        {language && (
          <button
            className={`language-pill language-pill--${language}`}
            onClick={onChangeLanguage}
          >
            {language === "python" ? "🐍 Python" : "💛 JavaScript"} · {t("worldMap.change")}
          </button>
        )}
      </header>

      {chapters.map((chapterWorlds, chapterIndex) => (
        <section className="world-map__chapter" key={chapterIndex}>
          <h2 className="world-map__chapter-title">
            {t("worldMap.chapterLabel").replace("{n}", chapterIndex + 1)}:{" "}
            {chapterNames[chapterIndex] ?? t("worldMap.moreAdventures")}
          </h2>
          <div className="world-map__grid">
            {chapterWorlds.map((world) => {
              const locked = world.status === "locked";
              const completedCount = world.levels.filter(
                (l) => l.status === "completed",
              ).length;

              return (
                <button
                  key={world.id}
                  className={`world-card${locked ? " world-card--locked" : ""}`}
                  style={{
                    "--world-from": world.from,
                    "--world-to": world.to,
                  }}
                  onClick={() => !locked && onSelectWorld(world.id)}
                  disabled={locked}
                >
                  <span className="world-card__icon">
                    {locked ? "🔒" : world.icon}
                  </span>
                  <span className="world-card__name">{world.name}</span>
                  <span className="world-card__progress">
                    {completedCount}/{world.totalStages} {t("worldMap.stages")}
                  </span>
                  <span className="world-card__bar">
                    <span
                      className="world-card__bar-fill"
                      style={{
                        width: `${(completedCount / world.totalStages) * 100}%`,
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

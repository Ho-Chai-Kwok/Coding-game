import { getLanguage } from "../data/languages";
import { useI18n } from "../i18n/useI18n";
import CharacterBadge from "./CharacterBadge";

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Reacts to the world the player is actually mid-way through, same spirit
// as Home's continue-card: the one nearest to completion, not just the
// first one in the list, since that's the one tugging at them right now.
function worldMapCharacterState(worlds) {
  const unlocked = worlds.filter((w) => w.status !== "locked");
  if (unlocked.length === 0) return "idle";
  const allDone = unlocked.every((w) =>
    w.levels.every((l) => l.status === "completed"),
  );
  if (allDone) return "perfect";

  const inProgress = unlocked
    .map((w) => ({
      world: w,
      completed: w.levels.filter((l) => l.status === "completed").length,
    }))
    .filter((w) => w.completed < w.world.totalStages);

  if (inProgress.length === 0) return "idle";
  const nearest = inProgress.reduce((best, cur) =>
    cur.completed / cur.world.totalStages > best.completed / best.world.totalStages ? cur : best,
  );
  const ratio = nearest.completed / nearest.world.totalStages;
  if (ratio === 0) return "greet";
  if (ratio >= 0.7) return "hype";
  return "idle";
}

export default function WorldMap({
  worlds,
  language,
  selectedCharacter,
  onChangeLanguage,
  onSelectWorld,
  onOpenPractice,
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
            {getLanguage(language).icon} {getLanguage(language).name} · {t("worldMap.change")}
          </button>
        )}
        <button className="world-map__practice-link" onClick={onOpenPractice}>
          🧩 {t("worldMap.practiceProblems")}
        </button>
        {selectedCharacter && (
          <div className="world-map__character">
            <CharacterBadge character={selectedCharacter} state={worldMapCharacterState(worlds)} />
          </div>
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

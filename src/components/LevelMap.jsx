import LevelNode from "./LevelNode";
import { useI18n } from "../i18n/useI18n";

const ZIGZAG_PATTERN = [0, 1, 2, 2, 1, 0, -1, -2, -2, -1];
const ZIGZAG_STEP = 44; // px of horizontal offset per pattern unit

function getEncouragementKey(completedCount, total) {
  if (completedCount === 0) return "levelMap.encourageStart";
  if (completedCount === total) return "levelMap.encourageDone";
  if (completedCount / total >= 0.5) return "levelMap.encourageHalf";
  return "levelMap.encourageProgress";
}

export default function LevelMap({ world, onSelectLevel, onBack }) {
  const { t } = useI18n();
  const completedCount = world.levels.filter(
    (l) => l.status === "completed",
  ).length;

  return (
    <div
      className="level-map"
      style={{ "--world-from": world.from, "--world-to": world.to }}
    >
      <header className="level-map__header">
        <button className="back-link" onClick={onBack}>
          ← {t("backToWorlds")}
        </button>
        <span className="level-map__world-icon">{world.icon}</span>
        <h1>{world.name}</h1>
        <p className="level-map__stages">
          World {world.id} · {completedCount}/{world.totalStages}{" "}
          {t("levelMap.stagesComplete")}
        </p>
        <p className="level-map__encouragement">
          {t(getEncouragementKey(completedCount, world.totalStages))}
        </p>
      </header>

      <div className="level-map__path">
        {world.levels.map((level, i) => (
          <div
            key={level.id}
            className="level-map__node-wrap"
            style={{
              transform: `translateX(${ZIGZAG_PATTERN[i % ZIGZAG_PATTERN.length] * ZIGZAG_STEP}px)`,
            }}
          >
            <LevelNode level={level} onSelect={onSelectLevel} />
          </div>
        ))}
      </div>
    </div>
  );
}

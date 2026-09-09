import LevelNode from "./LevelNode";

const ZIGZAG_PATTERN = [0, 1, 2, 2, 1, 0, -1, -2, -2, -1];
const ZIGZAG_STEP = 44; // px of horizontal offset per pattern unit

export default function LevelMap({ world, onSelectLevel, onBack }) {
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
          ← Worlds
        </button>
        <span className="level-map__world-icon">{world.icon}</span>
        <h1>{world.name}</h1>
        <p>
          World {world.id} · {completedCount}/{world.totalStages} stages
          complete
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

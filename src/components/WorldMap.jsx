export default function WorldMap({ worlds, onSelectWorld, onBack }) {
  return (
    <div className="world-map">
      <header className="world-map__header">
        <button className="back-link" onClick={onBack}>
          ← Modes
        </button>
        <h1>Choose a World</h1>
        <p>10 worlds, 20 stages each — 200 adventures await.</p>
      </header>

      <div className="world-map__grid">
        {worlds.map((world) => {
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
                {completedCount}/{world.totalStages} stages
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
    </div>
  );
}

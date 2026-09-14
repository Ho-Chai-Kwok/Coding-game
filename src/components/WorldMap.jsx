const CHAPTER_NAMES = [
  "Foundations",
  "Core Skills",
  "Data & Structures",
  "Functions Deep Dive",
  "Web Basics",
  "Async & APIs",
  "Patterns & Practices",
  "Problem Solving",
  "Interview Prep",
  "Final Challenges",
];

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default function WorldMap({ worlds, onSelectWorld, onBack }) {
  const chapters = chunk(worlds, 10);

  return (
    <div className="world-map">
      <header className="world-map__header">
        <button className="back-link" onClick={onBack}>
          ← Modes
        </button>
        <h1>Choose a World 🗺️</h1>
        <p>100 worlds, one topic each — learn slowly, one step at a time!</p>
      </header>

      {chapters.map((chapterWorlds, chapterIndex) => (
        <section className="world-map__chapter" key={chapterIndex}>
          <h2 className="world-map__chapter-title">
            Chapter {chapterIndex + 1}: {CHAPTER_NAMES[chapterIndex] ?? "More Adventures"}
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
        </section>
      ))}
    </div>
  );
}

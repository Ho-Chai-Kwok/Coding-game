export default function SideQuestMap({ sidequests, onSelectQuest, onBack }) {
  const completedCount = sidequests.filter((q) => q.completed).length;

  return (
    <div className="world-map">
      <header className="world-map__header">
        <button className="back-link" onClick={onBack}>
          ← Modes
        </button>
        <h1>Side Quests 🧭</h1>
        <p>
          Real-world tools and libraries, in bite-sized lessons — {completedCount}/
          {sidequests.length} explored!
        </p>
      </header>

      <div className="world-map__grid">
        {sidequests.map((quest) => (
          <button
            key={quest.id}
            className="world-card side-quest-card"
            style={{ "--world-from": quest.from, "--world-to": quest.to }}
            onClick={() => onSelectQuest(quest)}
          >
            {quest.completed && <span className="side-quest-card__badge">✓</span>}
            <span className="world-card__icon">{quest.icon}</span>
            <span className="world-card__name">{quest.name}</span>
            <span className="world-card__progress">
              {quest.completed ? "Completed" : "Not started"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

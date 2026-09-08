export default function LevelNode({ level, onSelect }) {
  const locked = level.status === "locked";
  const completed = level.status === "completed";

  return (
    <button
      className={`level-node level-node--${level.status}`}
      onClick={() => !locked && onSelect(level)}
      disabled={locked}
      aria-label={locked ? `${level.title} (locked)` : level.title}
    >
      <span className="level-node__badge">
        {locked ? "🔒" : completed ? "⭐" : level.character}
      </span>
      <span className="level-node__title">{level.title}</span>
    </button>
  );
}

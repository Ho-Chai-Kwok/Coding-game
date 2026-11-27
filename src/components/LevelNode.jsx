export default function LevelNode({ level, onSelect }) {
  const locked = level.status === "locked";
  const completed = level.status === "completed";

  return (
    <button
      className={`level-node level-node--${level.status}`}
      onClick={() => !locked && onSelect(level)}
      disabled={locked}
      // CQ-10d: the stage number is visible text too (.level-node__stage)
      // — aria-label replaces all of a button's content for accessibility
      // purposes, so leaving it out would drop information a sighted
      // user sees but a screen-reader user wouldn't.
      aria-label={`Stage ${level.stageNumber}: ${level.title}${locked ? " (locked)" : ""}`}
    >
      <span className="level-node__stage">{level.stageNumber}</span>
      <span className="level-node__badge">
        {locked ? "🔒" : completed ? "⭐" : level.character}
      </span>
      <span className="level-node__title">{level.title}</span>
    </button>
  );
}

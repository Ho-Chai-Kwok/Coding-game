const FUN_MESSAGES = [
  "Your guide is warming up its circuits...",
  "This lesson is still being coded (very meta, we know).",
  "Great choice! The exercises for this one are on their way.",
];

export default function LevelScreen({ level, onBack }) {
  const message =
    FUN_MESSAGES[level.id % FUN_MESSAGES.length] ?? FUN_MESSAGES[0];

  return (
    <div className="level-screen">
      <button className="level-screen__back" onClick={onBack}>
        ← Back to map
      </button>

      <div className="level-screen__character">{level.character}</div>
      <h2>{level.title}</h2>
      <p className="level-screen__message">{message}</p>
    </div>
  );
}

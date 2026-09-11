import CodeChallenge from "./CodeChallenge";
import QuizChallenge from "./QuizChallenge";

const FUN_MESSAGES = [
  "Your guide is warming up its circuits...",
  "This lesson is still being coded (very meta, we know).",
  "Great choice! The exercises for this one are on their way.",
];

export default function LevelScreen({
  level,
  mode = "learning",
  onBack,
  onCompleteLevel,
  onFinishRanked,
}) {
  const message =
    FUN_MESSAGES[level.stageNumber % FUN_MESSAGES.length] ?? FUN_MESSAGES[0];

  return (
    <div className="level-screen">
      <button className="level-screen__back" onClick={onBack}>
        ← Back
      </button>

      <div className="level-screen__character">{level.character}</div>
      <h2>{level.title}</h2>

      {mode === "learning" && level.content?.type === "code" && (
        <CodeChallenge
          content={level.content}
          onSolved={() => onCompleteLevel(level)}
        />
      )}

      {mode === "learning" && level.content?.type === "quiz" && (
        <QuizChallenge
          content={level.content}
          onSolved={() => onCompleteLevel(level)}
        />
      )}

      {(mode === "ranked" || !level.content) && (
        <p className="level-screen__message">{message}</p>
      )}

      {mode === "ranked" && (
        <div className="level-screen__ranked-actions">
          <p className="level-screen__ranked-hint">
            Demo controls — report how the match went:
          </p>
          <div className="level-screen__ranked-buttons">
            <button
              className="level-screen__ranked-btn level-screen__ranked-btn--win"
              onClick={() => onFinishRanked(true)}
            >
              🎉 I Won
            </button>
            <button
              className="level-screen__ranked-btn level-screen__ranked-btn--loss"
              onClick={() => onFinishRanked(false)}
            >
              💔 I Lost
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

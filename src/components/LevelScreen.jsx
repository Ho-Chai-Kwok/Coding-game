import CodeChallenge from "./CodeChallenge";
import QuizChallenge from "./QuizChallenge";
import TerminalChallenge from "./TerminalChallenge";
import { useI18n } from "../i18n/useI18n";
import { CHARACTERS } from "../data/characters";
import BuddyCoach from "./byteborn/BuddyCoach";
import { useBuddy } from "./byteborn/useBuddy";
import "./byteborn/byteborn.css";

export default function LevelScreen({
  level,
  language = "javascript",
  onBack,
  onCompleteLevel,
  character = CHARACTERS[0],
}) {
  const { t } = useI18n();
  const [mood, feedback] = useBuddy();
  const placeholders = t("levelScreen.placeholder");
  const message = placeholders[level.stageNumber % placeholders.length] ?? placeholders[0];

  return (
    <div className="level-screen">
      <button className="level-screen__back" onClick={onBack}>
        ← {t("back")}
      </button>

      {/* CQ-10e: was an h2 with no h1 anywhere on this screen — each
          screen in this SPA is its own "page", so its own title is the
          h1. className keeps the existing visual size (index.css's bare
          h1 selector is much bigger, meant for an actual page title). */}
      <h1 className="level-screen__title">{level.title}</h1>
      <BuddyCoach character={character} mood={mood} />

      {level.content?.type === "code" && (
        <CodeChallenge
          content={level.content}
          levelId={level.id}
          language={language}
          onSolved={() => onCompleteLevel(level)}
          onFeedback={feedback}
        />
      )}

      {level.content?.type === "quiz" && (
        <QuizChallenge
          content={level.content}
          onSolved={() => onCompleteLevel(level)}
          onFeedback={feedback}
        />
      )}

      {level.content?.type === "terminal" && (
        <TerminalChallenge
          content={level.content}
          onSolved={() => onCompleteLevel(level)}
          onFeedback={feedback}
        />
      )}

      {!level.content && <p className="level-screen__message">{message}</p>}
    </div>
  );
}

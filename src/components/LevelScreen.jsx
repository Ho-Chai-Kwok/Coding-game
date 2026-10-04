import CodeChallenge from "./CodeChallenge";
import QuizChallenge from "./QuizChallenge";
import TerminalChallenge from "./TerminalChallenge";
import { useI18n } from "../i18n/I18nContext";
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

      <h2>{level.title}</h2>
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

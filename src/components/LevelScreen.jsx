import CodeChallenge from "./CodeChallenge";
import QuizChallenge from "./QuizChallenge";
import { useI18n } from "../i18n/I18nContext";

export default function LevelScreen({
  level,
  language = "javascript",
  onBack,
  onCompleteLevel,
}) {
  const { t } = useI18n();
  const placeholders = t("levelScreen.placeholder");
  const message = placeholders[level.stageNumber % placeholders.length] ?? placeholders[0];

  return (
    <div className="level-screen">
      <button className="level-screen__back" onClick={onBack}>
        ← {t("back")}
      </button>

      <div className="level-screen__character">{level.character}</div>
      <h2>{level.title}</h2>

      {level.content?.type === "code" && (
        <CodeChallenge
          content={level.content}
          levelId={level.id}
          language={language}
          onSolved={() => onCompleteLevel(level)}
        />
      )}

      {level.content?.type === "quiz" && (
        <QuizChallenge
          content={level.content}
          onSolved={() => onCompleteLevel(level)}
        />
      )}

      {!level.content && <p className="level-screen__message">{message}</p>}
    </div>
  );
}

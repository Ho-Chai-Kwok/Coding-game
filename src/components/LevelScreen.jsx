import CodeChallenge from "./CodeChallenge";
import QuizChallenge from "./QuizChallenge";
import { useI18n } from "../i18n/I18nContext";

export default function LevelScreen({
  level,
  mode = "learning",
  language = "javascript",
  onBack,
  onCompleteLevel,
  onFinishRanked,
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

      {mode !== "ranked" && level.content?.type === "code" && (
        <CodeChallenge
          content={level.content}
          language={language}
          onSolved={() => onCompleteLevel(level)}
        />
      )}

      {mode !== "ranked" && level.content?.type === "quiz" && (
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
          <p className="level-screen__ranked-hint">{t("levelScreen.rankedHint")}</p>
          <div className="level-screen__ranked-buttons">
            <button
              className="level-screen__ranked-btn level-screen__ranked-btn--win"
              onClick={() => onFinishRanked(true)}
            >
              {t("levelScreen.won")}
            </button>
            <button
              className="level-screen__ranked-btn level-screen__ranked-btn--loss"
              onClick={() => onFinishRanked(false)}
            >
              {t("levelScreen.lost")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

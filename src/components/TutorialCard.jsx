import { useI18n } from "../i18n/I18nContext";

export default function TutorialCard({ tutorial, example }) {
  const { t } = useI18n();
  if (!tutorial) return null;

  return (
    <div className="tutorial-card">
      <p className="tutorial-card__label">{t("tutorialCard.label")}</p>
      <p className="tutorial-card__text">{tutorial}</p>
      {example && (
        <pre className="tutorial-card__example">
          <code>{example}</code>
        </pre>
      )}
    </div>
  );
}

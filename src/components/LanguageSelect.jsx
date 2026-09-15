import { useI18n } from "../i18n/I18nContext";

export default function LanguageSelect({ onSelect, onBack }) {
  const { t } = useI18n();

  return (
    <div className="mode-select">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>

      <header className="mode-select__header">
        <h1>{t("languageSelect.title")}</h1>
        <p>{t("languageSelect.subtitle")}</p>
      </header>

      <div className="mode-select__grid">
        <button
          className="mode-card mode-card--js"
          onClick={() => onSelect("javascript")}
        >
          <span className="mode-card__icon">💛</span>
          <span className="mode-card__title">JavaScript</span>
          <span className="mode-card__desc">{t("languageSelect.jsDesc")}</span>
        </button>

        <button
          className="mode-card mode-card--python"
          onClick={() => onSelect("python")}
        >
          <span className="mode-card__icon">🐍</span>
          <span className="mode-card__title">Python</span>
          <span className="mode-card__desc">{t("languageSelect.pyDesc")}</span>
        </button>
      </div>
    </div>
  );
}

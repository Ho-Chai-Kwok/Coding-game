import { useI18n } from "../i18n/useI18n";
import { LANGUAGES } from "../data/languages";

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
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            className={`mode-card mode-card--${lang.id}`}
            onClick={() => onSelect(lang.id)}
          >
            <span className="mode-card__icon">{lang.icon}</span>
            <span className="mode-card__title">{lang.name}</span>
            <span className="mode-card__desc">{t(`languageSelect.${lang.descKey}`)}</span>
            {lang.compiled && (
              <span className="mode-card__badge">☁️ {t("languageSelect.onlineBadge")}</span>
            )}
          </button>
        ))}
      </div>

      <p className="language-select__note">{t("languageSelect.onlineNote")}</p>
    </div>
  );
}

import { useI18n } from "../i18n/I18nContext";

export default function ModeSelect({ onSelect, onOpenSettings }) {
  const { t } = useI18n();

  return (
    <div className="mode-select">
      <button className="mode-select__settings" onClick={onOpenSettings} aria-label="Settings">
        ⚙️
      </button>

      <header className="mode-select__header">
        <h1>{t("appName")} 🎮</h1>
        <p>{t("modeSelect.greeting")}</p>
      </header>

      <div className="mode-select__grid">
        <button
          className="mode-card mode-card--learning"
          onClick={() => onSelect("learning")}
        >
          <span className="mode-card__icon">🗺️</span>
          <span className="mode-card__title">{t("modeSelect.learningTitle")}</span>
          <span className="mode-card__desc">{t("modeSelect.learningDesc")}</span>
        </button>

        <button
          className="mode-card mode-card--sidequest"
          onClick={() => onSelect("sidequest")}
        >
          <span className="mode-card__icon">🧭</span>
          <span className="mode-card__title">{t("modeSelect.sidequestTitle")}</span>
          <span className="mode-card__desc">{t("modeSelect.sidequestDesc")}</span>
        </button>

        <button
          className="mode-card mode-card--ranked"
          onClick={() => onSelect("ranked")}
        >
          <span className="mode-card__icon">🏆</span>
          <span className="mode-card__title">{t("modeSelect.rankedTitle")}</span>
          <span className="mode-card__desc">{t("modeSelect.rankedDesc")}</span>
        </button>
      </div>
    </div>
  );
}

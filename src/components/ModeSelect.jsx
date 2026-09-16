import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../auth/AuthContext";

export default function ModeSelect({
  profile,
  streak,
  overallProgress,
  continueWorld,
  onContinueLearning,
  onSelect,
  onOpenSettings,
  onOpenCalendar,
  onOpenCharacters,
}) {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const progressPercent =
    overallProgress.total > 0 ? (overallProgress.completed / overallProgress.total) * 100 : 0;

  return (
    <div className="mode-select">
      <button className="mode-select__settings" onClick={onOpenSettings} aria-label="Settings">
        ⚙️
      </button>

      <div className="mode-select__profile-row">
        <span className="mode-select__avatar">{profile.avatar}</span>
        <div className="mode-select__profile-text">
          <p className="mode-select__welcome">
            {isLoggedIn ? t("modeSelect.welcomeBack") : t("modeSelect.welcomeGuest")}{" "}
            <strong>{profile.displayName}</strong>
          </p>
          {streak > 0 && (
            <button className="mode-select__streak" onClick={onOpenCalendar}>
              🔥 {streak} {t("modeSelect.dayStreak")} · 📅
            </button>
          )}
        </div>
      </div>

      <div className="mode-select__progress">
        <div className="mode-select__progress-track">
          <div
            className="mode-select__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mode-select__progress-label">
          {overallProgress.completed}/{overallProgress.total} {t("modeSelect.overallProgress")}
        </p>
      </div>

      {continueWorld && (
        <button className="continue-card" onClick={onContinueLearning}>
          <span className="continue-card__icon">{continueWorld.icon}</span>
          <div className="continue-card__text">
            <span className="continue-card__label">{t("modeSelect.continueLearning")}</span>
            <span className="continue-card__world">{continueWorld.name}</span>
          </div>
          <span className="continue-card__cta">{t("modeSelect.continueButton")}</span>
        </button>
      )}

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

        <button
          className="mode-card mode-card--characters"
          onClick={onOpenCharacters}
        >
          <span className="mode-card__icon">🎭</span>
          <span className="mode-card__title">{t("modeSelect.charactersTitle")}</span>
          <span className="mode-card__desc">{t("modeSelect.charactersDesc")}</span>
        </button>
      </div>
    </div>
  );
}

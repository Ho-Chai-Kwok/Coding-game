import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../auth/AuthContext";

// Home: a dashboard, not a navigation menu — switching to Learning Mode,
// Side Quests, Ranked Mode, or Characters now happens via the persistent
// bottom nav (see BottomNav.jsx) instead of a grid of cards here.
export default function ModeSelect({
  profile,
  streak,
  overallProgress,
  continueWorld,
  onContinueLearning,
  onOpenSettings,
  onOpenCalendar,
}) {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const progressPercent =
    overallProgress.total > 0 ? (overallProgress.completed / overallProgress.total) * 100 : 0;

  return (
    <div className="mode-select">
      <header className="mode-select__header">
        <button className="mode-select__settings" onClick={onOpenSettings} aria-label="Settings">
          ⚙️
        </button>
        <h1>{t("appName")} 🎮</h1>
        <p>{t("modeSelect.greeting")}</p>
      </header>

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

      {continueWorld ? (
        <button className="continue-card" onClick={onContinueLearning}>
          <span className="continue-card__icon">{continueWorld.icon}</span>
          <div className="continue-card__text">
            <span className="continue-card__label">{t("modeSelect.continueLearning")}</span>
            <span className="continue-card__world">{continueWorld.name}</span>
          </div>
          <span className="continue-card__cta">{t("modeSelect.continueButton")}</span>
        </button>
      ) : (
        // No world in progress (brand new account, or just finished one) —
        // point new visitors at the bottom nav rather than leaving them
        // with an empty dashboard and no obvious next step.
        <div className="mode-select__nudge">
          <span className="mode-select__nudge-bounce">👇</span>
          <p className="mode-select__nudge-title">{t("modeSelect.nudgeTitle")}</p>
          <p className="mode-select__nudge-desc">{t("modeSelect.nudgeDesc")}</p>
        </div>
      )}
    </div>
  );
}

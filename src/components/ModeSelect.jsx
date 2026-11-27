import { useI18n } from "../i18n/useI18n";
import { useAuth } from "../auth/useAuth";
import CharacterBadge from "./CharacterBadge";

// What the player's Byteborn is doing on the Home dashboard, picked from
// real signals already on this screen rather than anything random — a hot
// streak gets a confident pump, finishing every available lesson gets the
// big "perfect" celebration, and a brand-new/just-cleared account (no
// world in progress, so the nudge below is showing) gets a wave hello.
// Otherwise it's just keeping you company.
function homeCharacterState({ streak, overallProgress, continueWorld }) {
  if (streak >= 5) return "streak";
  if (overallProgress.total > 0 && overallProgress.completed === overallProgress.total) return "perfect";
  if (!continueWorld) return "greet";
  return "idle";
}

// Home: a dashboard, not a navigation menu — switching to Learning Mode,
// Side Quests, Ranked Mode, or Characters now happens via the persistent
// bottom nav (see BottomNav.jsx) instead of a grid of cards here.
export default function ModeSelect({
  profile,
  streak,
  overallProgress,
  pathProgress,
  continueWorld,
  selectedCharacter,
  onContinueLearning,
  onOpenSettings,
  onOpenCalendar,
  onOpenHelper,
  onOpenKernelDash,
}) {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const progressPercent = pathProgress.percent;

  return (
    <div className="mode-select">
      <header className="mode-select__header">
        <button className="mode-select__helper" onClick={onOpenHelper} aria-label={t("codeHelper.title")}>
          🆘
        </button>
        <button className="mode-select__settings" onClick={onOpenSettings} aria-label="Settings">
          ⚙️
        </button>
        <h1>{t("appName")} 🎮</h1>
        <p>{t("modeSelect.greeting")}</p>
      </header>

      {selectedCharacter && (
        <div className="mode-select__character">
          <CharacterBadge
            character={selectedCharacter}
            state={homeCharacterState({ streak, overallProgress, continueWorld })}
          />
        </div>
      )}

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
          {t("modeSelect.worldsProgress")
            .replace("{done}", pathProgress.worldsDone)
            .replace("{total}", pathProgress.worldsTotal)}
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

      {/* A break from the curriculum, not part of it — a leisure mode,
          clearly set apart from the "continue learning" card above. */}
      <button className="kernel-dash-card" onClick={onOpenKernelDash}>
        <span className="kernel-dash-card__icon">🏃</span>
        <div className="kernel-dash-card__text">
          <span className="kernel-dash-card__label">{t("modeSelect.leisureLabel")}</span>
          <span className="kernel-dash-card__name">{t("kernelDash.title")}</span>
        </div>
        {/* CQ-14: this is a casual arcade mode with no "progress" to
            resume, so it always says "Play", never "Continue" — unlike
            the learning-path continue-card above. */}
        <span className="kernel-dash-card__cta">{t("modeSelect.kernelDashCta")}</span>
      </button>
    </div>
  );
}

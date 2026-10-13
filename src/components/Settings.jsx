import { useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { LOCALES } from "../i18n/translations";
import { useAuth } from "../auth/AuthContext";
import { BASE_AVATARS, REWARD_AVATARS } from "../data/rewards";
import { LANGUAGES } from "../data/languages";
import { getSuggestions } from "../utils/insights";
import { isSafeDisplayName } from "../utils/displayName";
import { version as APP_VERSION } from "../../package.json";

const ALL_AVATARS = [
  ...BASE_AVATARS.map((a) => ({ avatar: a, day: null })),
  ...REWARD_AVATARS,
];

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

// One suggestion "kind" -> one translation-key pair. Numeric/name params
// are substituted with .replaceAll so a key can safely use {n} more than
// once (see the earlier {need}/{need} bug this same fix pattern covers).
function InsightCard({ suggestion, t }) {
  const { kind } = suggestion;
  let text = t(`insights.${kind}Text`);
  if (suggestion.n != null) text = text.replaceAll("{n}", suggestion.n);
  if (suggestion.streak != null) text = text.replaceAll("{streak}", suggestion.streak);
  if (suggestion.reward != null) text = text.replaceAll("{reward}", suggestion.reward);
  if (suggestion.category != null) {
    text = text.replaceAll("{category}", t(`sideQuestMap.tag_${suggestion.category}`));
  }
  return <p className="insights__card">{text}</p>;
}

// A logged-in user's own password, changed directly (their live session
// already proves who they are — Supabase's updateUser() needs no old
// password), separate from AuthGate's "forgot password" email-link flow
// for someone who's locked out entirely.
function ChangePasswordForm({ onClose }) {
  const { t } = useI18n();
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t("settings.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: updateError } = await updatePassword(newPassword);
    setSubmitting(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    setDone(true);
    setNewPassword("");
    setConfirmPassword("");
  }

  if (done) {
    return (
      <p className="settings__password-success" role="status">
        {t("settings.passwordUpdated")}
      </p>
    );
  }

  return (
    <form className="settings__password-form" onSubmit={handleSubmit}>
      <input
        className="settings__text-input"
        type="password"
        placeholder={t("auth.newPassword")}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
      />
      <input
        className="settings__text-input"
        type="password"
        placeholder={t("settings.confirmPassword")}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
      />
      {error && <p className="settings__delete-error">{error}</p>}
      <div className="settings__delete-actions">
        <button className="settings__signout" type="submit" disabled={submitting}>
          {submitting ? t("auth.loading") : t("auth.newPasswordSave")}
        </button>
        <button
          className="settings__delete-cancel"
          type="button"
          onClick={onClose}
          disabled={submitting}
        >
          {t("settings.passwordCancel")}
        </button>
      </div>
    </form>
  );
}

export default function Settings({
  profile,
  onChangeProfile,
  theme,
  onChangeTheme,
  reducedMotion = "system",
  onChangeReducedMotion,
  codingLanguage,
  onChangeCodingLanguage,
  unlockedAvatars = BASE_AVATARS,
  mainLessonsCompleted = 0,
  streak = 0,
  sideQuestsState = [],
  rankedWins = 0,
  rankedLosses = 0,
  rankedShield = 0,
  onBack,
  onResetProgress,
  onExportData,
  syncStatus = "guest",
}) {
  const { t, locale, setLocale } = useI18n();
  const { user, isGuest, signOut, deleteAccount } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const suggestions = useMemo(
    () =>
      getSuggestions({
        mainLessonsCompleted,
        streak,
        sideQuestsState,
        rankedWins,
        rankedLosses,
        rankedShield,
        unlockedAvatarsCount: unlockedAvatars.length,
        totalAvatarsCount: ALL_AVATARS.length,
      }).slice(0, 4),
    [mainLessonsCompleted, streak, sideQuestsState, rankedWins, rankedLosses, rankedShield, unlockedAvatars],
  );

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteAccount();
    // On success the account is gone and this screen unmounts.
    if (error) {
      setDeleting(false);
      setDeleteError(error);
    }
  }

  function handleReset() {
    if (window.confirm(t("settings.resetConfirm"))) {
      onResetProgress();
    }
  }

  function handleExportData() {
    const data = onExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code-quest-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="settings">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>

      <h1>{t("settings.title")}</h1>

      {suggestions.length > 0 && (
        <section className="settings__section insights">
          <h2 className="settings__section-title">{t("insights.title")}</h2>
          <p className="settings__hint">{t("insights.subtitle")}</p>
          {suggestions.map((s) => (
            <InsightCard key={s.kind} suggestion={s} t={t} />
          ))}
        </section>
      )}

      <section className="settings__section">
        <h2 className="settings__section-title">{t("settings.profile")}</h2>

        <label className="settings__label" htmlFor="display-name">
          {t("settings.displayNameLabel")}
        </label>
        <input
          id="display-name"
          className="settings__text-input"
          type="text"
          value={profile.displayName}
          placeholder={t("settings.displayNamePlaceholder")}
          maxLength={20}
          aria-describedby="display-name-warning"
          onChange={(e) => onChangeProfile({ ...profile, displayName: e.target.value })}
        />
        {/* Warns, doesn't block typing — the real enforcement is the
            fallback in useRankedQueue.js and the database CHECK
            constraint, both of which can't be bypassed by ignoring this.
            See QA_REPORT.md CQ-06. */}
        {!isSafeDisplayName(profile.displayName) && (
          <p id="display-name-warning" className="settings__warning">
            ⚠️ {t("settings.displayNameWarning")}
          </p>
        )}

        <p className="settings__label">{t("settings.chooseAvatar")}</p>
        <div className="settings__avatar-grid">
          {ALL_AVATARS.map(({ avatar, day }) => {
            const unlocked = unlockedAvatars.includes(avatar);
            return (
              <button
                key={avatar}
                className={`settings__avatar-btn${
                  avatar === profile.avatar ? " settings__avatar-btn--active" : ""
                }${!unlocked ? " settings__avatar-btn--locked" : ""}`}
                onClick={() => unlocked && onChangeProfile({ ...profile, avatar })}
                disabled={!unlocked}
                aria-label={unlocked ? `Choose avatar ${avatar}` : `Locked avatar, unlock at day ${day}`}
              >
                {unlocked ? avatar : "🔒"}
                {!unlocked && <span className="settings__avatar-day">D{day}</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="settings__section">
        <h2 className="settings__section-title">{t("settings.appearance")}</h2>
        <div className="settings__pill-row">
          {[
            { value: "system", label: t("settings.themeSystem"), icon: "🌓" },
            { value: "light", label: t("settings.themeLight"), icon: "☀️" },
            { value: "dark", label: t("settings.themeDark"), icon: "🌙" },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`settings__pill${theme === opt.value ? " settings__pill--active" : ""}`}
              onClick={() => onChangeTheme(opt.value)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings__section">
        <h2 className="settings__section-title">{t("settings.accessibility")}</h2>
        <p className="settings__label">{t("settings.reducedMotion")}</p>
        <div className="settings__pill-row">
          {[
            { value: "system", label: t("settings.reducedMotionSystem"), icon: "🖥️" },
            { value: "on", label: t("settings.reducedMotionOn"), icon: "🐢" },
            { value: "off", label: t("settings.reducedMotionOff"), icon: "✨" },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`settings__pill${reducedMotion === opt.value ? " settings__pill--active" : ""}`}
              onClick={() => onChangeReducedMotion(opt.value)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
        <p className="settings__hint">{t("settings.reducedMotionNote")}</p>
      </section>

      {codingLanguage && (
        <section className="settings__section">
          <h2 className="settings__section-title">{t("settings.codingLanguage")}</h2>
          <div className="settings__pill-row">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                className={`settings__pill${
                  codingLanguage === lang.id ? " settings__pill--active" : ""
                }`}
                onClick={() => onChangeCodingLanguage(lang.id)}
              >
                {lang.icon} {lang.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="settings__section">
        <h2 className="settings__section-title">{t("settings.language")}</h2>
        <div className="settings__language-grid">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              className={`settings__language-btn${
                l.code === locale ? " settings__language-btn--active" : ""
              }`}
              onClick={() => setLocale(l.code)}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings__section">
        <h2 className="settings__section-title">{t("settings.account")}</h2>
        {user ? (
          <>
            <p className="settings__account-info">
              {t("auth.loggedInAs")} {user.email}
            </p>
            <button className="settings__signout" onClick={signOut}>
              {t("auth.signOut")}
            </button>

            {changingPassword ? (
              <ChangePasswordForm onClose={() => setChangingPassword(false)} />
            ) : (
              <button className="settings__link-btn" onClick={() => setChangingPassword(true)}>
                🔑 {t("settings.changePassword")}
              </button>
            )}

            {confirmingDelete ? (
              <div className="settings__delete-panel" role="alertdialog">
                <p>{t("settings.deleteWarning")}</p>
                {deleteError && (
                  <p className="settings__delete-error">
                    {t("settings.deleteError")} ({deleteError})
                  </p>
                )}
                <div className="settings__delete-actions">
                  <button
                    className="settings__delete-confirm"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? t("auth.loading") : t("settings.deleteConfirm")}
                  </button>
                  <button
                    className="settings__delete-cancel"
                    onClick={() => {
                      setConfirmingDelete(false);
                      setDeleteError(null);
                    }}
                    disabled={deleting}
                  >
                    {t("settings.deleteCancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button className="settings__delete" onClick={() => setConfirmingDelete(true)}>
                {t("settings.deleteAccount")}
              </button>
            )}
          </>
        ) : (
          isGuest && (
            <>
              <p className="settings__account-info">{t("auth.guestMode")}</p>
              <button className="settings__signout" onClick={signOut}>
                {t("auth.logIn")} / {t("auth.signUp")}
              </button>
            </>
          )
        )}
      </section>

      <section className="settings__section">
        <h2 className="settings__section-title">{t("settings.dataSection")}</h2>
        <p className="settings__hint">{t("settings.exportDataDesc")}</p>
        <button className="settings__export" onClick={handleExportData}>
          ⬇️ {t("settings.exportData")}
        </button>
        <button className="settings__reset" onClick={handleReset}>
          {t("settings.resetProgress")}
        </button>
      </section>

      <p className={`settings__sync settings__sync--${syncStatus}`} role="status">
        {t(`settings.sync${syncStatus[0].toUpperCase()}${syncStatus.slice(1)}`)}
      </p>

      <section className="settings__section">
        <h2 className="settings__section-title">{t("settings.support")}</h2>
        <p className="settings__hint">{t("settings.supportDesc")}</p>
        {CONTACT_EMAIL ? (
          <a className="settings__signout settings__support-link" href={`mailto:${CONTACT_EMAIL}`}>
            ✉️ {t("settings.supportEmail")}
          </a>
        ) : (
          <p className="settings__hint">{t("settings.supportUnavailable")}</p>
        )}
      </section>

      <footer className="settings__about">
        <p className="settings__about-title">{t("settings.about")}</p>
        <p className="settings__about-text">Code Quest · v{APP_VERSION}</p>
        <p className="settings__about-text">{t("settings.madeWith")}</p>
        <p className="settings__about-privacy">🔒 {t("settings.privacyNote")}</p>
        <p className="settings__about-links">
          <a href="#/terms">{t("legal.terms")}</a> · <a href="#/privacy">{t("legal.privacy")}</a>
        </p>
      </footer>
    </div>
  );
}

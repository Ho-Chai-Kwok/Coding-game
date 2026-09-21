import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { LOCALES } from "../i18n/translations";
import { useAuth } from "../auth/AuthContext";
import { BASE_AVATARS, REWARD_AVATARS } from "../data/rewards";
import { LANGUAGES } from "../data/languages";

const ALL_AVATARS = [
  ...BASE_AVATARS.map((a) => ({ avatar: a, day: null })),
  ...REWARD_AVATARS,
];

export default function Settings({
  profile,
  onChangeProfile,
  theme,
  onChangeTheme,
  codingLanguage,
  onChangeCodingLanguage,
  unlockedAvatars = BASE_AVATARS,
  onBack,
  onResetProgress,
  syncStatus = "guest",
}) {
  const { t, locale, setLocale } = useI18n();
  const { user, isGuest, signOut, deleteAccount } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  return (
    <div className="settings">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>

      <h1>{t("settings.title")}</h1>

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
          onChange={(e) => onChangeProfile({ ...profile, displayName: e.target.value })}
        />

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
        <button className="settings__reset" onClick={handleReset}>
          {t("settings.resetProgress")}
        </button>
      </section>

      <p className={`settings__sync settings__sync--${syncStatus}`} role="status">
        {t(`settings.sync${syncStatus[0].toUpperCase()}${syncStatus.slice(1)}`)}
      </p>

      <footer className="settings__about">
        <p className="settings__about-title">{t("settings.about")}</p>
        <p className="settings__about-text">Code Quest · v1.0</p>
        <p className="settings__about-text">{t("settings.madeWith")}</p>
        <p className="settings__about-privacy">🔒 {t("settings.privacyNote")}</p>
        <p className="settings__about-links">
          <a href="#/terms">{t("legal.terms")}</a> · <a href="#/privacy">{t("legal.privacy")}</a>
        </p>
      </footer>
    </div>
  );
}

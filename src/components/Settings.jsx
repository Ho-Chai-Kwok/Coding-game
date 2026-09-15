import { useI18n } from "../i18n/I18nContext";
import { LOCALES } from "../i18n/translations";
import { useAuth } from "../auth/AuthContext";

export default function Settings({ onBack, onResetProgress }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isGuest, signOut } = useAuth();

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
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function AuthGate({ children }) {
  const { isLoggedIn, isGuest, loading, continueAsGuest, signIn, signUp } = useAuth();
  const { t } = useI18n();

  const [tab, setTab] = useState("logIn"); // "logIn" | "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  if (loading) {
    return (
      <div className="auth-gate">
        <p className="auth-gate__loading">{t("auth.loading")}</p>
      </div>
    );
  }

  if (isLoggedIn || isGuest) {
    return children;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const { error } =
      tab === "logIn" ? await signIn(email, password) : await signUp(email, password, displayName);

    setSubmitting(false);
    if (error === "backendNotConfigured") {
      setFormError(t("auth.backendNotConfigured"));
    } else if (error) {
      setFormError(error);
    }
  }

  return (
    <div className="auth-gate">
      <div className="auth-gate__card">
        <h1 className="auth-gate__title">Code Quest 🎮</h1>
        <p className="auth-gate__subtitle">{t("auth.subtitle")}</p>

        <div className="auth-gate__tabs">
          <button
            className={`auth-gate__tab${tab === "logIn" ? " auth-gate__tab--active" : ""}`}
            onClick={() => setTab("logIn")}
            type="button"
          >
            {t("auth.logIn")}
          </button>
          <button
            className={`auth-gate__tab${tab === "signUp" ? " auth-gate__tab--active" : ""}`}
            onClick={() => setTab("signUp")}
            type="button"
          >
            {t("auth.signUp")}
          </button>
        </div>

        <form className="auth-gate__form" onSubmit={handleSubmit}>
          {tab === "signUp" && (
            <input
              className="auth-gate__input"
              type="text"
              placeholder={t("auth.displayName")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
            />
          )}
          <input
            className="auth-gate__input"
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-gate__input"
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {tab === "signUp" && <p className="auth-gate__privacy-note">{t("auth.privacyNote")}</p>}

          {formError && <p className="auth-gate__error">{formError}</p>}

          <button className="auth-gate__submit" type="submit" disabled={submitting}>
            {submitting ? t("auth.loading") : tab === "logIn" ? t("auth.logIn") : t("auth.signUp")}
          </button>
        </form>

        <button className="auth-gate__guest" onClick={continueAsGuest} type="button">
          {t("auth.continueAsGuest")}
        </button>

        {!isSupabaseConfigured && (
          <p className="auth-gate__hint">{t("auth.backendNotConfigured")}</p>
        )}
      </div>
    </div>
  );
}

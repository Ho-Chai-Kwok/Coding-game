import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import TurnstileWidget, { isCaptchaEnabled } from "./TurnstileWidget";
import { isSafeDisplayName } from "../utils/displayName";

export default function AuthGate({ children }) {
  const {
    isLoggedIn,
    isGuest,
    loading,
    recovering,
    continueAsGuest,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
  } = useAuth();
  const { t } = useI18n();

  const [tab, setTab] = useState("logIn"); // "logIn" | "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [view, setView] = useState("main"); // "main" | "forgot"
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const captchaBlocked = isCaptchaEnabled && !captchaToken;

  // Bot-check tokens are single-use: get a fresh one after every attempt.
  function resetCaptcha() {
    setCaptchaToken(null);
    setCaptchaKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className="auth-gate">
        <p className="auth-gate__loading">{t("auth.loading")}</p>
      </div>
    );
  }

  if (recovering && isLoggedIn) {
    return (
      <div className="auth-gate">
        <div className="auth-gate__card">
          <h1 className="auth-gate__title">🔑 {t("auth.newPasswordTitle")}</h1>
          <form className="auth-gate__form" onSubmit={handleNewPassword}>
            <input
              className="auth-gate__input"
              type="password"
              placeholder={t("auth.newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            {formError && <p className="auth-gate__error">{formError}</p>}
            <button className="auth-gate__submit" type="submit" disabled={submitting}>
              {submitting ? t("auth.loading") : t("auth.newPasswordSave")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoggedIn || isGuest) {
    return children;
  }

  async function handleNewPassword(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const { error } = await updatePassword(newPassword);
    setSubmitting(false);
    if (error) setFormError(error);
  }

  async function handleForgot(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const { error } = await resetPassword(email, captchaToken);
    setSubmitting(false);
    resetCaptcha();
    if (error === "backendNotConfigured") setFormError(t("auth.backendNotConfigured"));
    else if (error) setFormError(error);
    else setResetSent(true);
  }

  function openForgot() {
    resetCaptcha();
    setFormError(null);
    setResetSent(false);
    setView("forgot");
  }

  function closeForgot() {
    resetCaptcha();
    setFormError(null);
    setView("main");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    // Validated here too, not just in Settings — previously an unsafe
    // name just surfaced as Supabase's raw "Database error saving new
    // user" with no account created, since the only enforcement was the
    // database CHECK constraint. An empty name is fine (falls back to
    // the default "Coder" server-side); only a non-empty unsafe one is
    // blocked here. See QA_REPORT.md CQ-06b.
    if (tab === "signUp" && displayName.trim() && !isSafeDisplayName(displayName)) {
      setFormError(t("settings.displayNameWarning"));
      return;
    }

    setSubmitting(true);

    const { error } =
      tab === "logIn"
        ? await signIn(email, password, captchaToken)
        : await signUp(email, password, displayName, captchaToken);

    setSubmitting(false);
    resetCaptcha();
    if (error === "backendNotConfigured") {
      setFormError(t("auth.backendNotConfigured"));
    } else if (error) {
      setFormError(error);
    }
  }

  if (view === "forgot") {
    return (
      <div className="auth-gate">
        <div className="auth-gate__card">
          <h1 className="auth-gate__title">🔑 {t("auth.resetTitle")}</h1>
          <p className="auth-gate__subtitle">{t("auth.resetSubtitle")}</p>
          {resetSent ? (
            <p className="auth-gate__success" role="status">
              {t("auth.resetSent")}
            </p>
          ) : (
            <form className="auth-gate__form" onSubmit={handleForgot}>
              <input
                className="auth-gate__input"
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <TurnstileWidget key={captchaKey} onToken={setCaptchaToken} />
              {formError && <p className="auth-gate__error">{formError}</p>}
              <button className="auth-gate__submit" type="submit" disabled={submitting || captchaBlocked}>
                {submitting ? t("auth.loading") : t("auth.resetSend")}
              </button>
            </form>
          )}
          <button className="auth-gate__guest" onClick={closeForgot} type="button">
            ← {t("auth.backToLogin")}
          </button>
        </div>
      </div>
    );
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

          {tab === "signUp" && (
            <>
              <p className="auth-gate__privacy-note">{t("auth.privacyNote")}</p>
              <p className="auth-gate__privacy-note">
                {t("legal.agreePrefix")} <a href="#/terms">{t("legal.terms")}</a> &{" "}
                <a href="#/privacy">{t("legal.privacy")}</a>
              </p>
            </>
          )}

          <TurnstileWidget key={captchaKey} onToken={setCaptchaToken} />

          {formError && <p className="auth-gate__error">{formError}</p>}

          <button className="auth-gate__submit" type="submit" disabled={submitting || captchaBlocked}>
            {submitting ? t("auth.loading") : tab === "logIn" ? t("auth.logIn") : t("auth.signUp")}
          </button>
        </form>

        {tab === "logIn" && isSupabaseConfigured && (
          <button className="auth-gate__guest" onClick={openForgot} type="button">
            {t("auth.forgotPassword")}
          </button>
        )}

        <button className="auth-gate__guest" onClick={continueAsGuest} type="button">
          {t("auth.continueAsGuest")}
        </button>

        <p className="auth-gate__legal">
          <a href="#/terms">{t("legal.terms")}</a> · <a href="#/privacy">{t("legal.privacy")}</a>
        </p>

        {!isSupabaseConfigured && (
          <p className="auth-gate__hint">{t("auth.backendNotConfigured")}</p>
        )}
      </div>
    </div>
  );
}

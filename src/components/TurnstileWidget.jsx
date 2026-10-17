import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY, isCaptchaEnabled } from "./turnstileConfig";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Could not load the bot check"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Cloudflare Turnstile bot check. Renders nothing unless VITE_TURNSTILE_SITE_KEY
// is set. Tokens are single-use, so remount (change `key`) after each attempt.
export default function TurnstileWidget({ onToken }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isCaptchaEnabled) return;
    let widgetId;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => onToken(null));

    return () => {
      cancelled = true;
      if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isCaptchaEnabled) return null;
  return <div className="auth-gate__captcha" ref={containerRef} />;
}

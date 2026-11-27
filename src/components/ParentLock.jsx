import { useState } from "react";
import { useI18n } from "../i18n/useI18n";

// CQ-21: gates whatever it wraps behind a simple "can you add two small
// numbers" check — not real security, just enough friction to stop a
// toddler's random tapping from reaching Settings/Account (the actual
// reported problem: changing the app language, opening login/legal
// pages by accident). A parent can solve 4+5 in one try; the standard
// "parental gate" pattern (App Store age gates use the same idea) — not
// foolproof against someone determined to keep mashing buttons, just
// against the accidental case this was actually about. `enabled` comes
// from the setting itself (off by default, see Settings.jsx) so this
// renders through untouched when a parent hasn't turned it on.
function randomChallenge() {
  const a = 2 + Math.floor(Math.random() * 7); // 2-8
  const b = 2 + Math.floor(Math.random() * 7); // 2-8
  const answer = a + b;
  const wrongChoices = new Set();
  while (wrongChoices.size < 2) {
    const offset = 1 + Math.floor(Math.random() * 4);
    const candidate = Math.random() < 0.5 ? answer - offset : answer + offset;
    if (candidate !== answer && candidate > 0) wrongChoices.add(candidate);
  }
  const choices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
  return { a, b, answer, choices };
}

export default function ParentLock({ enabled, onBack, children }) {
  const { t } = useI18n();
  const [challenge, setChallenge] = useState(randomChallenge);
  const [wrong, setWrong] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  if (!enabled || unlocked) return children;

  function handleChoice(value) {
    if (value === challenge.answer) {
      setUnlocked(true);
      return;
    }
    // A fresh question on a wrong guess, not just another try at the same
    // one — someone randomly mashing the same 3 buttons would otherwise
    // get through in a handful of tries by pure chance.
    setWrong(true);
    setChallenge(randomChallenge());
  }

  return (
    <div className="parent-lock">
      <div className="parent-lock__card">
        <h1 className="parent-lock__title">🔒 {t("parentLock.title")}</h1>
        <p className="parent-lock__question">
          {t("parentLock.question").replace("{a}", challenge.a).replace("{b}", challenge.b)}
        </p>
        <div className="parent-lock__choices">
          {challenge.choices.map((value) => (
            <button
              key={value}
              type="button"
              className="parent-lock__choice"
              onClick={() => handleChoice(value)}
            >
              {value}
            </button>
          ))}
        </div>
        {wrong && <p className="parent-lock__error">{t("parentLock.wrong")}</p>}
        <button type="button" className="parent-lock__back" onClick={onBack}>
          ← {t("backToModes")}
        </button>
      </div>
    </div>
  );
}

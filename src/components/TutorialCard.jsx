import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";

// Closed by default, same as BuddyCoach — the actual task prompt lives in
// a separate, always-visible line right below this (CodeChallenge's own
// `instructions` paragraph), so collapsing this box never hides what the
// exercise is asking for, only the background explanation/example. A
// learner who wants the refresher taps it open; one who doesn't isn't
// forced to scroll past it first.
export default function TutorialCard({ tutorial, example }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (!tutorial) return null;

  return (
    <div className="tutorial-card">
      <button
        type="button"
        className="tutorial-card__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="tutorial-card__label">{t("tutorialCard.label")}</span>
        <span className="tutorial-card__chevron">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <>
          <p className="tutorial-card__text">{tutorial}</p>
          {example && (
            <pre className="tutorial-card__example">
              <code>{example}</code>
            </pre>
          )}
        </>
      )}
    </div>
  );
}

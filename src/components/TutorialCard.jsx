import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";

// Starts OPEN by default — unlike BuddyCoach (supplementary encouragement,
// fine to tuck away), this box is the actual teaching material for the
// exercise below it, so hiding it from a first-time learner by default
// would cost real understanding, not just screen space. Still collapsible
// though: once the concept's familiar, there's no reason to keep paying
// for the space it takes.
export default function TutorialCard({ tutorial, example }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
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

import { useI18n } from "../i18n/useI18n";

// Shared "you're not ready for this yet" screen for Side Quests and Ranked
// Mode — both require a little real Learning Mode progress first (see
// data/skillGate.js). Deliberately not a hard wall: it shows exactly how
// close the learner is and sends them straight back to Learning Mode.
export default function SkillGateNotice({ lessonsCompleted, lessonsRequired, onGoToLearning }) {
  const { t } = useI18n();
  const percent = Math.min(100, Math.round((lessonsCompleted / lessonsRequired) * 100));

  return (
    <div className="skill-gate">
      <span className="skill-gate__icon">🔒</span>
      <p className="skill-gate__title">{t("skillGate.title")}</p>
      <p className="skill-gate__body">
        {t("skillGate.body")
          .replaceAll("{done}", lessonsCompleted)
          .replaceAll("{need}", lessonsRequired)}
      </p>
      <div className="skill-gate__track">
        <div className="skill-gate__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="skill-gate__progress-label">
        {lessonsCompleted}/{lessonsRequired} {t("skillGate.lessonsLabel")}
      </p>
      <button className="skill-gate__cta" onClick={onGoToLearning}>
        {t("skillGate.cta")}
      </button>
    </div>
  );
}

import Confetti from "./Confetti";
import { useI18n } from "../i18n/I18nContext";
import { getDifficultyLevel, PROMOTION_SHIELD_MATCHES } from "../data/rank";

const EMOJI = { promoted: "🎉", divisionUp: "⬆️", demoted: "😤", divisionDown: "⬇️", shielded: "🛡️" };

// Shown after a ranked match when the player's rank moved (or a promotion
// shield saved them from dropping).
export default function RankChange({ change, onContinue }) {
  const { t } = useI18n();
  const { kind, from, to, shieldSaved } = change;
  const isUp = kind === "promoted" || kind === "divisionUp";

  return (
    <div
      className={`rank-change rank-change--${isUp ? "up" : kind === "shielded" ? "shield" : "down"}`}
      style={{ "--rank-color": to.color }}
      role="status"
    >
      {kind === "promoted" && <Confetti />}
      <div className="rank-change__emoji">{EMOJI[kind]}</div>
      <h3 className="rank-change__title">{t(`rankChange.${kind}Title`)}</h3>

      <div className="rank-change__badge">
        {kind !== "shielded" && (
          <>
            <span className="rank-change__from">{from.label}</span>
            <span className="rank-change__arrow">→</span>
          </>
        )}
        <span className="rank-change__to">{to.label}</span>
      </div>

      <p className="rank-change__text">{t(`rankChange.${kind}Text`)}</p>

      {kind === "promoted" && (
        <>
          <p className="rank-change__note">
            🧠 {t("rankChange.harderQuestions")} {getDifficultyLevel(to.points)}
          </p>
          <p className="rank-change__note">
            🛡️ {t("rankChange.shieldGranted").replace("{n}", PROMOTION_SHIELD_MATCHES)}
          </p>
        </>
      )}
      {shieldSaved && kind !== "shielded" && (
        <p className="rank-change__note">🛡️ {t("rankChange.shieldHelped")}</p>
      )}

      <button className="rank-change__continue" onClick={onContinue}>
        {t("rankedModes.continue")}
      </button>
    </div>
  );
}

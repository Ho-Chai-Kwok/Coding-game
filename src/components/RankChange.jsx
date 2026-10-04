import Confetti from "./Confetti";
import ByteBornSprite from "./byteborn/ByteBornSprite";
import { useI18n } from "../i18n/I18nContext";
import { getDifficultyLevel, PROMOTION_SHIELD_MATCHES } from "../data/rank";
import { CHARACTERS } from "../data/characters";
import "./byteborn/byteborn.css";

const EMOJI = { promoted: "🎉", divisionUp: "⬆️", demoted: "😤", divisionDown: "⬇️", shielded: "🛡️" };
// Full tier promotions/demotions get the biggest reaction; a division
// nudge within the same tier is still real news but not THE big moment,
// so it gets the ordinary win/lose rather than rankUp/rankDown.
const SPRITE_STATE = {
  promoted: "rankUp",
  divisionUp: "win",
  demoted: "rankDown",
  divisionDown: "lose",
  shielded: "shielded",
};

// Shown after a ranked match when the player's rank moved (or a promotion
// shield saved them from dropping).
export default function RankChange({ change, character = CHARACTERS[0], onContinue }) {
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
      <div className="rank-change__sprite">
        <ByteBornSprite id={character.id} state={SPRITE_STATE[kind]} label={character.name} />
      </div>
      <h3 className="rank-change__title">
        <span className="rank-change__title-emoji">{EMOJI[kind]}</span> {t(`rankChange.${kind}Title`)}
      </h3>

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

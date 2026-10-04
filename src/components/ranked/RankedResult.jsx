import Confetti from "../Confetti";
import ByteBornSprite from "../byteborn/ByteBornSprite";
import { useI18n } from "../../i18n/I18nContext";
import { CHARACTERS } from "../../data/characters";
import "../byteborn/byteborn.css";

// Shared win/loss summary screen every ranked mode ends on. Used two ways:
// each mode's own internal screen (didWin/pointsDelta = its own solo
// performance score — the *real* LP change now depends on the matched
// opponent's result too, so these calls deliberately leave `pointsLabel`
// unset and get the neutral default below instead of implying it's LP),
// and the outer post-match screen (RankedMatchRunner.jsx), which passes
// pointsLabel="LP" because at that point the number really is the final,
// server-settled rank change.
//
// The player's own Byteborn headlines the screen now (in the big "win"/
// "lose" states — see byteborn.css), Duolingo-style: the mode's emoji
// becomes a small accent next to the title instead of the whole visual,
// since the character reacting is the more personal, more legible signal.
export default function RankedResult({
  didWin,
  emoji,
  title,
  statLines = [],
  pointsDelta,
  pointsLabel,
  bonusNote,
  character = CHARACTERS[0],
  onContinue,
}) {
  const { t } = useI18n();

  return (
    <div className={`ranked-result ranked-result--${didWin ? "win" : "loss"}`}>
      {didWin && <Confetti />}
      <div className="ranked-result__sprite">
        <ByteBornSprite id={character.id} state={didWin ? "win" : "lose"} label={character.name} />
      </div>
      <h3 className="ranked-result__title">
        <span className="ranked-result__title-emoji">{emoji}</span> {title}
      </h3>

      {statLines.length > 0 && (
        <div className="ranked-result__stats">
          {statLines.map((line) => (
            <div className="ranked-result__stat-line" key={line.label}>
              <span>{line.label}</span>
              <strong>{line.value}</strong>
            </div>
          ))}
        </div>
      )}

      {bonusNote && <p className="ranked-result__bonus">✨ {bonusNote}</p>}

      <div className={`ranked-result__points ranked-result__points--${pointsDelta >= 0 ? "pos" : "neg"}`}>
        {pointsDelta >= 0 ? "+" : ""}
        {pointsDelta} {pointsLabel ?? t("rankedModes.score")}
      </div>

      <button className="ranked-result__continue" onClick={onContinue}>
        {t("rankedModes.continue")}
      </button>
    </div>
  );
}

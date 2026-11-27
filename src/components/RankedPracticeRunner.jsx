import RankedModeRunner from "./RankedModeRunner";
import { useI18n } from "../i18n/useI18n";

// The honest way to keep Ranked useful when nobody's around to match with:
// play the mode solo against no one, clearly labeled as practice the whole
// time, and it never touches LP or win/loss stats. What this deliberately
// does NOT do is invent a fake opponent — a bot dressed up as a real
// player would misrepresent the ranked ladder this whole PvP system exists
// to keep honest, so a quiet ladder means an honest "nobody's around, here's
// solo practice instead," not a disguised one.
export default function RankedPracticeRunner({ modeId, character, language, rankedPoints, onExit }) {
  const { t } = useI18n();

  return (
    <div className="ranked-practice">
      <p className="ranked-practice__banner">🎯 {t("rankedPractice.banner")}</p>
      <RankedModeRunner
        modeId={modeId}
        character={character}
        language={language}
        rankedPoints={rankedPoints}
        onExit={onExit}
        onFinish={onExit}
      />
    </div>
  );
}

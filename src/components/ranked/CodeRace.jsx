import { useMemo, useState } from "react";
import CodeChallenge from "../CodeChallenge";
import RankedTimerBar from "./RankedTimerBar";
import RankedResult from "./RankedResult";
import { useCountdown } from "../../hooks/useCountdown";
import { useI18n } from "../../i18n/I18nContext";
import {
  getCodePool,
  shuffledSample,
  applyBonusMultiplier,
} from "../../data/rankedModes";

const ROUND_COUNT = 6;
const TOTAL_SECONDS = 240;
const DASH_BONUS_SECONDS = 5;

export default function CodeRace({ character, language, seed, onFinish, onExit }) {
  const { t } = useI18n();
  const puzzles = useMemo(
    () => shuffledSample(getCodePool(), ROUND_COUNT, seed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [finished, setFinished] = useState(null);
  const [dashBonusFired, setDashBonusFired] = useState(false);

  const timer = useCountdown(TOTAL_SECONDS, () => finish(roundIndex, 0));

  function finish(roundsCompleted, secondsLeft) {
    if (finished) return;
    timer.stop();
    const didWin = roundsCompleted >= ROUND_COUNT;
    const rawPoints = didWin
      ? 20 + Math.min(30, Math.round(secondsLeft / 4))
      : Math.max(-20, roundsCompleted * 6 - 18);
    setFinished({
      didWin,
      pointsDelta: applyBonusMultiplier(rawPoints, character),
      roundsCompleted,
      secondsLeft,
    });
  }

  function handleRoundSolved() {
    const nextRound = roundIndex + 1;
    setRoundIndex(nextRound);
    if (character?.id === "dash" && nextRound % 3 === 0) {
      timer.addSeconds(DASH_BONUS_SECONDS);
      setDashBonusFired(true);
    }
    if (nextRound >= ROUND_COUNT) {
      finish(nextRound, timer.secondsLeft);
    }
  }

  if (finished) {
    return (
      <RankedResult
        didWin={finished.didWin}
        emoji={finished.didWin ? "🏁" : "⏱️"}
        title={finished.didWin ? t("rankedModes.codeRace.winTitle") : t("rankedModes.codeRace.loseTitle")}
        statLines={[
          { label: t("rankedModes.roundsCompleted"), value: `${finished.roundsCompleted}/${ROUND_COUNT}` },
          { label: t("rankedModes.timeLeft"), value: `${finished.secondsLeft}s` },
        ]}
        pointsDelta={finished.pointsDelta}
        bonusNote={dashBonusFired ? t("rankedModes.codeRace.dashBonus") : null}
        onContinue={() => onFinish(finished.pointsDelta, finished.didWin)}
      />
    );
  }

  const puzzle = puzzles[roundIndex];

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">🏎️</span>
        <h2>{t("rankedModes.codeRace.name")}</h2>
      </div>
      <RankedTimerBar secondsLeft={timer.secondsLeft} totalSeconds={TOTAL_SECONDS} />
      <p className="ranked-mode-screen__round-label">
        {t("rankedModes.round")} {roundIndex + 1}/{ROUND_COUNT}
      </p>
      {puzzle && (
        <CodeChallenge
          key={puzzle.id}
          content={puzzle.content}
          language={language}
          onSolved={handleRoundSolved}
        />
      )}
    </div>
  );
}

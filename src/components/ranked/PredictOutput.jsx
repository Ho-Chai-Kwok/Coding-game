import { useEffect, useMemo, useState } from "react";
import QuizChallenge from "../QuizChallenge";
import RankedTimerBar from "./RankedTimerBar";
import RankedResult from "./RankedResult";
import { useCountdown } from "../../hooks/useCountdown";
import { useI18n } from "../../i18n/useI18n";
import { shuffledSample, applyBonusMultiplier, predictOutputRevealsWrong } from "../../data/rankedModes";
import { getQuestionPool } from "../../data/rankedQuestionBank";
import { getDifficultyLevel } from "../../data/rank";
import { generateMatchQuestions } from "../../utils/rankedQuestionGenerator";

const ROUND_COUNT = 8;
const TOTAL_SECONDS = 90;
const WIN_THRESHOLD = Math.ceil(ROUND_COUNT * 0.7);

function pickWrongOptionIndex(content) {
  const wrongIndexes = content.options
    .map((_, i) => i)
    .filter((i) => i !== content.correctIndex);
  return wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
}

export default function PredictOutput({ character, rankedPoints, matchId, seed, onFinish, onExit }) {
  const { t } = useI18n();
  const difficulty = getDifficultyLevel(rankedPoints);
  const [questions, setQuestions] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [finished, setFinished] = useState(null);
  const revealsWrong = predictOutputRevealsWrong(character);

  const timer = useCountdown(TOTAL_SECONDS, () => finish(roundIndex, 0));

  // Try a fresh, AI-generated batch for this real match first (both
  // matched players end up with the identical batch — see
  // utils/rankedQuestionGenerator.js); fall back to the static bank on
  // any failure or for solo/practice play (no matchId). The timer stays
  // paused the whole time this is in flight so a slow generation never
  // eats into the player's actual round time.
  useEffect(() => {
    timer.reset(TOTAL_SECONDS, false);
    let cancelled = false;
    (async () => {
      const dynamic = matchId ? await generateMatchQuestions(matchId) : null;
      if (cancelled) return;
      const pool = dynamic ?? getQuestionPool(difficulty);
      setQuestions(shuffledSample(pool, ROUND_COUNT, seed));
      timer.reset(TOTAL_SECONDS, true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(roundsCompleted, secondsLeft) {
    if (finished) return;
    timer.stop();
    const didWin = roundsCompleted >= WIN_THRESHOLD;
    const rawPoints = didWin
      ? 15 + roundsCompleted * 3 + Math.min(15, Math.round(secondsLeft / 4))
      : Math.max(-18, roundsCompleted * 4 - 14);
    setFinished({
      didWin,
      pointsDelta: applyBonusMultiplier(rawPoints, character),
      roundsCompleted,
      secondsLeft,
    });
  }

  function handleRoundSolved() {
    const nextRound = roundIndex + 1;
    if (nextRound >= ROUND_COUNT) {
      finish(nextRound, timer.secondsLeft);
    } else {
      setRoundIndex(nextRound);
    }
  }

  const question = questions?.[roundIndex];
  // Memoized per round so the timer ticking (which re-renders this
  // component every second) doesn't reroll which option gets revealed.
  const disabledOptionIndex = useMemo(
    () => (revealsWrong && question ? pickWrongOptionIndex(question) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundIndex, revealsWrong],
  );

  if (finished) {
    return (
      <RankedResult
        didWin={finished.didWin}
        character={character}
        emoji={finished.didWin ? "🔮" : "💭"}
        title={finished.didWin ? t("rankedModes.predictOutput.winTitle") : t("rankedModes.predictOutput.loseTitle")}
        statLines={[
          { label: t("rankedModes.roundsCompleted"), value: `${finished.roundsCompleted}/${ROUND_COUNT}` },
          { label: t("rankedModes.timeLeft"), value: `${finished.secondsLeft}s` },
        ]}
        pointsDelta={finished.pointsDelta}
        bonusNote={revealsWrong ? t("rankedModes.predictOutput.scopeBonus") : null}
        onContinue={() => onFinish(finished.pointsDelta, finished.didWin)}
      />
    );
  }

  if (!questions) {
    return (
      <div className="ranked-mode-screen">
        <div className="ranked-mode-screen__header">
          <span className="ranked-mode-screen__icon">🔮</span>
          <h2>{t("rankedModes.predictOutput.name")}</h2>
        </div>
        <p className="ranked-mode-screen__loading">{t("rankedModes.preparingQuestions")}</p>
      </div>
    );
  }

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">🔮</span>
        <h2>{t("rankedModes.predictOutput.name")}</h2>
      </div>
      <RankedTimerBar secondsLeft={timer.secondsLeft} totalSeconds={TOTAL_SECONDS} />
      <p className="ranked-mode-screen__round-label">
        {t("rankedModes.round")} {roundIndex + 1}/{ROUND_COUNT}
      </p>
      {question && (
        <QuizChallenge
          key={roundIndex}
          content={question}
          onSolved={handleRoundSolved}
          disabledOptionIndex={disabledOptionIndex}
        />
      )}
    </div>
  );
}

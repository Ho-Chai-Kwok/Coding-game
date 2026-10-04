import { useEffect, useMemo, useState } from "react";
import TutorialCard from "../TutorialCard";
import Confetti from "../Confetti";
import RankedTimerBar from "./RankedTimerBar";
import RankedResult from "./RankedResult";
import { useCountdown } from "../../hooks/useCountdown";
import { useI18n } from "../../i18n/I18nContext";
import { shuffledSample, applyBonusMultiplier, chaosRoundFavorable, seededRandom } from "../../data/rankedModes";
import { getQuestionPool } from "../../data/rankedQuestionBank";
import { getDifficultyLevel } from "../../data/rank";
import { generateMatchQuestions } from "../../utils/rankedQuestionGenerator";

// Same core puzzle type (Predict the Output), twisted by a random
// modifier each match — the "Chaos Round" concept from the design brief.
const MODIFIERS = [
  { id: "doublePoints", multiplier: 2 },
  { id: "halfTime", timeFactor: 0.5 },
  { id: "oneShot", oneShot: true },
  { id: "noHints", hideHints: true },
];

const BASE_SECONDS = 20;

export default function ChaosRound({ character, rankedPoints, matchId, seed, onFinish, onExit }) {
  const { t } = useI18n();
  const difficulty = getDifficultyLevel(rankedPoints);
  const [question, setQuestion] = useState(null);
  // Derived from the same seed as the question (offset so it isn't just a
  // copy of whatever index the question shuffle landed on) — in a PvP
  // match, both players get the identical modifier, not just the same
  // question; solo/practice play still gets a fresh random one each time.
  const modifier = useMemo(() => {
    const rand = seed === undefined ? Math.random : seededRandom(seed + 1);
    return MODIFIERS[Math.floor(rand() * MODIFIERS.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const totalSeconds = Math.round(BASE_SECONDS * (modifier.timeFactor ?? 1));
  const favorable = chaosRoundFavorable(character);

  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);
  const [savedByGlitch, setSavedByGlitch] = useState(false);
  const [finished, setFinished] = useState(null);

  const timer = useCountdown(totalSeconds, () => finish(false));

  // Same dynamic-questions-with-fallback approach as Predict Output/
  // Showdown — see PredictOutput.jsx's comments. Chaos Round only needs
  // one question, so this just samples a single item from whichever pool
  // (dynamic or static) resolves.
  useEffect(() => {
    timer.reset(totalSeconds, false);
    let cancelled = false;
    (async () => {
      const dynamic = matchId ? await generateMatchQuestions(matchId) : null;
      if (cancelled) return;
      const pool = dynamic ?? getQuestionPool(difficulty);
      setQuestion(shuffledSample(pool, 1, seed)[0]);
      timer.reset(totalSeconds, true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(won) {
    if (finished) return;
    timer.stop();
    let rawPoints = won ? 20 * (modifier.multiplier ?? 1) : -12;
    if (!won && favorable && Math.random() < 0.35) {
      rawPoints = 0;
      setSavedByGlitch(true);
    }
    setFinished({ didWin: won, pointsDelta: applyBonusMultiplier(Math.round(rawPoints), character) });
  }

  function handleSelect(i) {
    if (status === "correct" || finished) return;
    setSelected(i);
    const correct = i === question.correctIndex;
    setStatus(correct ? "correct" : "incorrect");
    if (correct) {
      finish(true);
    } else if (modifier.oneShot) {
      finish(false);
    }
  }

  function handleRetry() {
    setSelected(null);
    setStatus(null);
  }

  if (finished) {
    return (
      <RankedResult
        didWin={finished.didWin}
        character={character}
        emoji={finished.didWin ? "🌀" : "💫"}
        title={finished.didWin ? t("rankedModes.chaosRound.winTitle") : t("rankedModes.chaosRound.loseTitle")}
        statLines={[{ label: t("rankedModes.chaosRound.modifier"), value: t(`rankedModes.chaosRound.modifiers.${modifier.id}.name`) }]}
        pointsDelta={finished.pointsDelta}
        bonusNote={savedByGlitch ? t("rankedModes.chaosRound.glitchBonus") : null}
        onContinue={() => onFinish(finished.pointsDelta, finished.didWin)}
      />
    );
  }

  if (!question) {
    return (
      <div className="ranked-mode-screen">
        <div className="ranked-mode-screen__header">
          <span className="ranked-mode-screen__icon">🌀</span>
          <h2>{t("rankedModes.chaosRound.name")}</h2>
        </div>
        <p className="ranked-mode-screen__loading">{t("rankedModes.preparingQuestions")}</p>
      </div>
    );
  }

  const content = question;

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">🌀</span>
        <h2>{t("rankedModes.chaosRound.name")}</h2>
      </div>

      <div className="chaos-round__modifier">
        <span className="chaos-round__modifier-name">
          🌀 {t(`rankedModes.chaosRound.modifiers.${modifier.id}.name`)}
        </span>
        <span className="chaos-round__modifier-desc">
          {t(`rankedModes.chaosRound.modifiers.${modifier.id}.desc`)}
        </span>
      </div>

      <RankedTimerBar secondsLeft={timer.secondsLeft} totalSeconds={totalSeconds} />

      <div className="quiz-challenge">
        {!modifier.hideHints && <TutorialCard tutorial={content.tutorial} example={content.example} />}
        <p className="quiz-challenge__question">{content.question}</p>

        <div className="quiz-challenge__options">
          {content.options.map((option, i) => {
            let variant = "";
            if (selected === i) {
              variant = status === "correct" ? " quiz-challenge__option--correct" : " quiz-challenge__option--incorrect";
            }
            return (
              <button
                key={option}
                className={`quiz-challenge__option${variant}`}
                onClick={() => handleSelect(i)}
                disabled={status === "correct"}
              >
                {option}
              </button>
            );
          })}
        </div>

        {status === "incorrect" && !modifier.oneShot && (
          <div className="quiz-challenge__feedback quiz-challenge__feedback--incorrect">
            <p className="quiz-challenge__feedback-title">{t("quizChallenge.incorrect")}</p>
            {!modifier.hideHints && <p className="quiz-challenge__explanation">{content.explanation}</p>}
            <button className="quiz-challenge__retry" onClick={handleRetry}>
              {t("quizChallenge.tryAgain")}
            </button>
          </div>
        )}

        {status === "correct" && (
          <div className="quiz-challenge__feedback quiz-challenge__feedback--correct">
            <Confetti />
            <p className="quiz-challenge__feedback-title">{t("quizChallenge.correct")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

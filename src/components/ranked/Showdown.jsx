import { useMemo, useState, useEffect } from "react";
import RankedTimerBar from "./RankedTimerBar";
import RankedResult from "./RankedResult";
import { useCountdown } from "../../hooks/useCountdown";
import { useI18n } from "../../i18n/I18nContext";
import {
  getQuizPool,
  shuffledSample,
  applyBonusMultiplier,
  showdownSeesCategoryEarly,
  hasStreakForgiveness,
} from "../../data/rankedModes";

const MAX_ROUNDS = 15;
const ROUND_TIME_START = 14;
const ROUND_TIME_FLOOR = 6;

function roundSeconds(i) {
  return Math.max(ROUND_TIME_FLOOR, ROUND_TIME_START - i);
}

export default function Showdown({ character, onFinish, onExit }) {
  const { t } = useI18n();
  const questions = useMemo(() => shuffledSample(getQuizPool(), MAX_ROUNDS), []);
  const [roundIndex, setRoundIndex] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [forgivenessUsed, setForgivenessUsed] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [finished, setFinished] = useState(null);

  const seesEarly = showdownSeesCategoryEarly(character);
  const canForgive = hasStreakForgiveness(character);

  const timer = useCountdown(roundSeconds(0), () => eliminate(roundIndex, 0));
  const question = questions[roundIndex];

  useEffect(() => {
    if (seesEarly) {
      timer.stop();
      setPreviewing(true);
      const id = setTimeout(() => {
        setPreviewing(false);
        timer.reset(roundSeconds(roundIndex));
      }, 1000);
      return () => clearTimeout(id);
    }
    timer.reset(roundSeconds(roundIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  function finish(roundsSurvived, secondsLeft, fullClear) {
    if (finished) return;
    timer.stop();
    const rawPoints = fullClear
      ? 60
      : Math.max(-15, roundsSurvived * 7 - 10 + Math.round(secondsLeft / 3));
    setFinished({
      didWin: fullClear || roundsSurvived >= 3,
      pointsDelta: applyBonusMultiplier(Math.min(60, rawPoints), character),
      roundsSurvived,
    });
  }

  function eliminate(roundsSurvived, secondsLeft) {
    finish(roundsSurvived, secondsLeft, false);
  }

  function advanceRound() {
    const next = roundIndex + 1;
    if (next >= MAX_ROUNDS || next >= questions.length) {
      finish(next, timer.secondsLeft, true);
    } else {
      setRoundIndex(next);
    }
  }

  function handleAnswer(optionIndex) {
    if (previewing || finished) return;
    const correct = optionIndex === question.content.correctIndex;
    if (correct) {
      advanceRound();
      return;
    }
    if (canForgive && !forgivenessUsed) {
      setForgivenessUsed(true);
      setSavedNote(true);
      advanceRound();
      return;
    }
    eliminate(roundIndex, timer.secondsLeft);
  }

  if (finished) {
    return (
      <RankedResult
        didWin={finished.didWin}
        emoji={finished.didWin ? "🥇" : "💥"}
        title={finished.didWin ? t("rankedModes.showdown.winTitle") : t("rankedModes.showdown.loseTitle")}
        statLines={[{ label: t("rankedModes.showdown.roundsSurvived"), value: finished.roundsSurvived }]}
        pointsDelta={finished.pointsDelta}
        bonusNote={savedNote ? t("rankedModes.showdown.nullPointerSave") : null}
        onContinue={() => onFinish(finished.pointsDelta, finished.didWin)}
      />
    );
  }

  if (!question) return null;

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">🥊</span>
        <h2>{t("rankedModes.showdown.name")}</h2>
      </div>

      {!previewing && <RankedTimerBar secondsLeft={timer.secondsLeft} totalSeconds={roundSeconds(roundIndex)} />}

      <p className="ranked-mode-screen__round-label">
        {t("rankedModes.showdown.roundsSurvived")}: {roundIndex}
      </p>

      <div className="showdown__category">{question.worldName}</div>

      {previewing ? (
        <p className="showdown__preview-hint">{t("rankedModes.showdown.getReady")}</p>
      ) : (
        <div className="quiz-challenge">
          <p className="quiz-challenge__question">{question.content.question}</p>
          <div className="quiz-challenge__options">
            {question.content.options.map((option, i) => (
              <button key={option} className="quiz-challenge__option" onClick={() => handleAnswer(i)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import RankedTimerBar from "./RankedTimerBar";
import RankedResult from "./RankedResult";
import Confetti from "../Confetti";
import { useCountdown } from "../../hooks/useCountdown";
import { useI18n } from "../../i18n/useI18n";
import { getBugHuntPool } from "../../data/bugHuntSnippets";
import {
  shuffledSample,
  applyBonusMultiplier,
  bugHuntMultiplier,
  bugHuntHighlightsFirst,
} from "../../data/rankedModes";
import { getDifficultyLevel } from "../../data/rank";

const ROUND_COUNT = 5;
const TOTAL_SECONDS = 100;

export default function BugHunt({ character, rankedPoints, seed, onFinish, onExit }) {
  const { t } = useI18n();
  const difficulty = getDifficultyLevel(rankedPoints);
  const snippets = useMemo(
    () => shuffledSample(getBugHuntPool(difficulty), ROUND_COUNT, seed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState("find"); // "find" | "fix" | "roundDone"
  const [wrongLines, setWrongLines] = useState([]);
  const [fixResult, setFixResult] = useState(null); // "correct" | "incorrect" | null
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(null);

  const multiplier = bugHuntMultiplier(character);
  const highlightFirstBug = bugHuntHighlightsFirst(character) && roundIndex === 0 && phase === "find";

  const timer = useCountdown(TOTAL_SECONDS, () => finish(roundIndex, score, 0));

  const snippet = snippets[roundIndex];

  function finish(roundsCompleted, finalScore, secondsLeft) {
    if (finished) return;
    timer.stop();
    const rawPoints = Math.round(finalScore * multiplier);
    setFinished({
      didWin: finalScore > 0,
      pointsDelta: applyBonusMultiplier(Math.max(-20, Math.min(45, rawPoints)), character),
      roundsCompleted,
      score: finalScore,
      secondsLeft,
    });
  }

  function handleLineClick(index) {
    if (phase !== "find") return;
    if (index === snippet.buggyLine) {
      setScore((s) => s + (wrongLines.length === 0 ? 10 : 6));
      setPhase("fix");
    } else if (!wrongLines.includes(index)) {
      setWrongLines((w) => [...w, index]);
      setScore((s) => s - 2);
    }
  }

  function handleFixClick(index) {
    if (phase !== "fix") return;
    const correct = index === snippet.correctFixIndex;
    setFixResult(correct ? "correct" : "incorrect");
    setScore((s) => s + (correct ? 8 : -3));
    setPhase("roundDone");
  }

  function nextRound() {
    const nextIndex = roundIndex + 1;
    setWrongLines([]);
    setFixResult(null);
    setPhase("find");
    if (nextIndex >= ROUND_COUNT) {
      finish(nextIndex, score, timer.secondsLeft);
    } else {
      setRoundIndex(nextIndex);
    }
  }

  if (finished) {
    return (
      <RankedResult
        didWin={finished.didWin}
        character={character}
        emoji={finished.didWin ? "🐞" : "🔍"}
        title={finished.didWin ? t("rankedModes.bugHunt.winTitle") : t("rankedModes.bugHunt.loseTitle")}
        statLines={[
          { label: t("rankedModes.roundsCompleted"), value: `${finished.roundsCompleted}/${ROUND_COUNT}` },
          { label: t("rankedModes.score"), value: finished.score },
        ]}
        pointsDelta={finished.pointsDelta}
        bonusNote={multiplier > 1 ? t("rankedModes.bugHunt.debuggerBonus") : null}
        onContinue={() => onFinish(finished.pointsDelta, finished.didWin)}
      />
    );
  }

  if (!snippet) return null;

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">🐞</span>
        <h2>{t("rankedModes.bugHunt.name")}</h2>
      </div>
      <RankedTimerBar secondsLeft={timer.secondsLeft} totalSeconds={TOTAL_SECONDS} />
      <p className="ranked-mode-screen__round-label">
        {t("rankedModes.round")} {roundIndex + 1}/{ROUND_COUNT} · {t("rankedModes.score")}: {score}
      </p>

      <div className="bug-hunt">
        <h3 className="bug-hunt__title">{snippet.title}</h3>
        <p className="bug-hunt__prompt">
          {phase === "find" ? t("rankedModes.bugHunt.findPrompt") : t("rankedModes.bugHunt.fixPrompt")}
        </p>

        <div className="bug-hunt__code">
          {snippet.lines.map((line, i) => {
            const isWrongPick = wrongLines.includes(i);
            const isBuggyRevealed = phase !== "find" && i === snippet.buggyLine;
            const isHinted = highlightFirstBug && i === snippet.buggyLine;
            return (
              <button
                key={i}
                className={`bug-hunt__line${isWrongPick ? " bug-hunt__line--wrong" : ""}${isBuggyRevealed ? " bug-hunt__line--buggy" : ""}${isHinted ? " bug-hunt__line--hint" : ""}`}
                onClick={() => handleLineClick(i)}
                disabled={phase !== "find"}
              >
                <span className="bug-hunt__line-number">{i + 1}</span>
                <span className="bug-hunt__line-code">{line}</span>
              </button>
            );
          })}
        </div>

        {phase === "fix" && (
          <div className="bug-hunt__fixes">
            {snippet.fixOptions.map((fix, i) => (
              <button key={fix} className="bug-hunt__fix" onClick={() => handleFixClick(i)}>
                {fix}
              </button>
            ))}
          </div>
        )}

        {phase === "roundDone" && (
          <div className={`bug-hunt__feedback bug-hunt__feedback--${fixResult}`}>
            {fixResult === "correct" && <Confetti />}
            <p className="bug-hunt__feedback-title">
              {fixResult === "correct" ? t("quizChallenge.correct") : t("quizChallenge.incorrect")}
            </p>
            <p className="bug-hunt__explanation">{snippet.explanation}</p>
            <button className="bug-hunt__next" onClick={nextRound}>
              {roundIndex + 1 >= ROUND_COUNT ? t("rankedModes.finish") : t("rankedModes.nextRound")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

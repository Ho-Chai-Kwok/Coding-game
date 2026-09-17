import { useMemo, useState } from "react";
import RankedTimerBar from "./RankedTimerBar";
import RankedResult from "./RankedResult";
import { useCountdown } from "../../hooks/useCountdown";
import { useI18n } from "../../i18n/I18nContext";
import { getBugHuntPool } from "../../data/bugHuntSnippets";
import {
  shuffledSample,
  applyBonusMultiplier,
  debugDuelHasFreeMiss,
} from "../../data/rankedModes";

// A true 1v1 needs real-time opponent matchmaking, which this app doesn't
// have yet. This is the solo approximation called for in the design brief:
// race a fixed "ghost" target time instead of a live opponent.
const GHOST_SECONDS = 18;
const SAFETY_TIMEOUT = 60;

export default function DebugDuel({ character, onFinish, onExit }) {
  const { t } = useI18n();
  const snippet = useMemo(() => shuffledSample(getBugHuntPool(), 1)[0], []);
  const [phase, setPhase] = useState("find");
  const [wrongLines, setWrongLines] = useState([]);
  const [livesLeft, setLivesLeft] = useState(debugDuelHasFreeMiss(character) ? 2 : 1);
  const [finished, setFinished] = useState(null);

  const timer = useCountdown(SAFETY_TIMEOUT, () => finish(false));

  function finish(won) {
    if (finished) return;
    const elapsed = SAFETY_TIMEOUT - timer.secondsLeft;
    timer.stop();
    const rawPoints = won ? (elapsed <= GHOST_SECONDS ? 30 : 18) : -15;
    setFinished({
      didWin: won,
      pointsDelta: applyBonusMultiplier(rawPoints, character),
      elapsed,
      beatGhost: won && elapsed <= GHOST_SECONDS,
    });
  }

  function loseLife() {
    setLivesLeft((l) => {
      const next = l - 1;
      if (next <= 0) finish(false);
      return next;
    });
  }

  function handleLineClick(index) {
    if (phase !== "find") return;
    if (index === snippet.buggyLine) {
      setPhase("fix");
    } else if (!wrongLines.includes(index)) {
      setWrongLines((w) => [...w, index]);
      loseLife();
    }
  }

  function handleFixClick(index) {
    if (phase !== "fix") return;
    if (index === snippet.correctFixIndex) {
      finish(true);
    } else {
      loseLife();
    }
  }

  if (finished) {
    return (
      <RankedResult
        didWin={finished.didWin}
        emoji={finished.didWin ? "⚔️" : "💀"}
        title={finished.didWin ? t("rankedModes.debugDuel.winTitle") : t("rankedModes.debugDuel.loseTitle")}
        statLines={
          finished.didWin
            ? [
                { label: t("rankedModes.debugDuel.yourTime"), value: `${finished.elapsed}s` },
                { label: t("rankedModes.debugDuel.ghostTime"), value: `${GHOST_SECONDS}s` },
              ]
            : []
        }
        pointsDelta={finished.pointsDelta}
        bonusNote={
          finished.beatGhost
            ? t("rankedModes.debugDuel.beatGhost")
            : debugDuelHasFreeMiss(character)
              ? t("rankedModes.debugDuel.tankBonus")
              : null
        }
        onContinue={() => onFinish(finished.pointsDelta, finished.didWin)}
      />
    );
  }

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">⚔️</span>
        <h2>{t("rankedModes.debugDuel.name")}</h2>
      </div>
      <RankedTimerBar secondsLeft={timer.secondsLeft} totalSeconds={SAFETY_TIMEOUT} />
      <p className="ranked-mode-screen__round-label">
        {t("rankedModes.debugDuel.ghostTime")}: {GHOST_SECONDS}s · {"❤️".repeat(livesLeft)}
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
            return (
              <button
                key={i}
                className={`bug-hunt__line${isWrongPick ? " bug-hunt__line--wrong" : ""}${isBuggyRevealed ? " bug-hunt__line--buggy" : ""}`}
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
      </div>
    </div>
  );
}

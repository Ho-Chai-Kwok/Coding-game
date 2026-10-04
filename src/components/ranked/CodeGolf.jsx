import { useMemo, useState } from "react";
import Confetti from "../Confetti";
import CodeEditor from "../CodeEditor";
import RankedTimerBar from "./RankedTimerBar";
import RankedResult from "./RankedResult";
import { useCountdown } from "../../hooks/useCountdown";
import { runPythonCode } from "../../utils/pyRuntime";
import { runJsCode } from "../../utils/runCode";
import { useI18n } from "../../i18n/I18nContext";
import { getCodeGolfPool, countCodeLines } from "../../data/codeGolfPuzzles";
import {
  shuffledSample,
  applyBonusMultiplier,
  codeGolfBonusPerLineUnderPar,
} from "../../data/rankedModes";
import { getDifficultyLevel } from "../../data/rank";

const TOTAL_SECONDS = 180;

export default function CodeGolf({ character, language, rankedPoints, seed, onFinish, onExit }) {
  const { t } = useI18n();
  const difficulty = getDifficultyLevel(rankedPoints);
  const puzzle = useMemo(
    () => shuffledSample(getCodeGolfPool(difficulty), 1, seed)[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [code, setCode] = useState(puzzle.starterCode[language] ?? puzzle.starterCode.javascript);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(null);

  const par = puzzle.par[language] ?? puzzle.par.javascript;
  const bonusPerLine = codeGolfBonusPerLineUnderPar(character);
  const timer = useCountdown(TOTAL_SECONDS, () => finish(false, null));

  function finish(solved, lineCount) {
    if (finished) return;
    timer.stop();
    let rawPoints;
    if (!solved) {
      rawPoints = -15;
    } else {
      const linesUnderPar = Math.max(0, par - lineCount);
      const linesOverPar = Math.max(0, lineCount - par);
      const base = 15 + linesUnderPar * 6 - linesOverPar * 3;
      const trimMultiplier = 1 + bonusPerLine * linesUnderPar;
      rawPoints = Math.max(5, Math.round(base * trimMultiplier));
    }
    setFinished({
      didWin: solved,
      pointsDelta: applyBonusMultiplier(Math.max(-20, Math.min(50, rawPoints)), character),
      lineCount,
    });
  }

  async function handleRun() {
    setRunning(true);
    const { logs, error } = language === "python" ? await runPythonCode(code) : await runJsCode(code);
    setRunning(false);

    if (error) {
      setResult({ status: "error", logs, error });
      return;
    }

    const output = logs.join("\n").trim();
    if (output === puzzle.expectedOutput) {
      setResult({ status: "success", logs, error: null });
      finish(true, countCodeLines(code, language));
    } else {
      setResult({ status: "mismatch", logs, error: null });
    }
  }

  if (finished) {
    return (
      <RankedResult
        didWin={finished.didWin}
        character={character}
        emoji={finished.didWin ? "⛳" : "⏱️"}
        title={finished.didWin ? t("rankedModes.codeGolf.winTitle") : t("rankedModes.codeGolf.loseTitle")}
        statLines={
          finished.didWin
            ? [
                { label: t("rankedModes.codeGolf.yourLines"), value: finished.lineCount },
                { label: t("rankedModes.codeGolf.par"), value: par },
              ]
            : []
        }
        pointsDelta={finished.pointsDelta}
        bonusNote={bonusPerLine > 0 ? t("rankedModes.codeGolf.trimBonus") : null}
        onContinue={() => onFinish(finished.pointsDelta, finished.didWin)}
      />
    );
  }

  const hint = puzzle.hint[language] ?? puzzle.hint.javascript;

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">⛳</span>
        <h2>{t("rankedModes.codeGolf.name")}</h2>
      </div>
      <RankedTimerBar secondsLeft={timer.secondsLeft} totalSeconds={TOTAL_SECONDS} />
      <p className="ranked-mode-screen__round-label">
        {t("rankedModes.codeGolf.par")}: {par} {t("rankedModes.codeGolf.lines")}
      </p>

      <div className={`code-challenge code-challenge--${language}`}>
        <p className="code-challenge__instructions">{puzzle.instructions}</p>

        <div className="code-challenge__editor-frame">
          <div className="code-challenge__editor-chrome">
            <span className="code-challenge__dot code-challenge__dot--red" />
            <span className="code-challenge__dot code-challenge__dot--yellow" />
            <span className="code-challenge__dot code-challenge__dot--green" />
          </div>
          <CodeEditor
            className="code-challenge__editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            language={language}
            rows={5}
          />
        </div>

        <p className="code-golf__line-count">
          {t("rankedModes.codeGolf.yourLines")}: {countCodeLines(code, language)}
        </p>

        <button className="code-challenge__run" onClick={handleRun} disabled={running}>
          {running ? t("codeChallenge.running") : t("codeChallenge.run")}
        </button>

        {result && (
          <div className={`code-challenge__result code-challenge__result--${result.status}`}>
            {result.status === "success" && (
              <>
                <Confetti />
                <p className="code-challenge__result-title">
                  {t("codeChallenge.success")} {puzzle.expectedOutput}
                </p>
              </>
            )}

            {result.status === "mismatch" && (
              <>
                <p className="code-challenge__result-title">{t("codeChallenge.mismatch")}</p>
                <p className="code-challenge__result-detail">
                  {t("codeChallenge.output")}{" "}
                  {result.logs.length ? result.logs.join("\n") : t("codeChallenge.nothingPrinted")}
                </p>
                <p className="code-challenge__hint">💡 {hint}</p>
              </>
            )}

            {result.status === "error" && (
              <>
                <p className="code-challenge__result-title">{t("codeChallenge.error")}</p>
                <p className="code-challenge__result-detail">{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

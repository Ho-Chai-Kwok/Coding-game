import { useEffect, useId, useState } from "react";
import TutorialCard from "./TutorialCard";
import Confetti from "./Confetti";
import CodeEditor from "./CodeEditor";
import { runPythonCode, preloadPython, isPythonReady } from "../utils/pyRuntime";
import { runJsCode } from "../utils/runCode";
import { runCompiledCode } from "../utils/remoteRun";
import { runSqlCode } from "../utils/sqlRuntime";
import { runReactCode } from "../utils/reactRuntime";
import { runHtmlCode } from "../utils/htmlRuntime";
import { isCompiledLanguage } from "../data/languages";
import { useI18n } from "../i18n/useI18n";
import { friendlyErrorMessage, firstDiffIndex } from "../utils/friendlyError";

// After this many failed runs (wrong output or an error) on the same
// lesson, offer to fill in the solution outright rather than leaving
// someone stuck indefinitely — see QA_REPORT.md CQ-07. Resets whenever a
// fresh lesson mounts (plain useState, no persistence needed).
const SHOW_SOLUTION_AFTER = 3;

function resolveContent(content, language) {
  if (language !== "python" || !content.python) return content;
  return { ...content, ...content.python };
}

// C, C++ and Java lessons live in their own lazy-loaded chunk; wait for it,
// then hand the merged lesson to the challenge below.
export default function CodeChallenge({ content, levelId, language = "javascript", onSolved, onFeedback }) {
  // A lesson can pin its own language (SQL and NumPy/Pandas-style Python
  // side quests), overriding whichever language the learner picked for the
  // main path — that choice isn't relevant to a lesson that's specifically
  // about SQL or a Python library. Computed before the hooks below (not
  // returned early) so hook order stays unconditional.
  const pinnedLanguage = content.language;
  const compiled = !pinnedLanguage && isCompiledLanguage(language);
  const [loaded, setLoaded] = useState(null); // { key, lesson }
  const key = `${levelId}:${language}`;

  useEffect(() => {
    if (!compiled) return;
    let cancelled = false;
    import("../data/codeLessons").then((mod) => {
      if (!cancelled) setLoaded({ key, lesson: mod.getCompiledLesson(levelId, language) });
    });
    return () => {
      cancelled = true;
    };
  }, [compiled, key, levelId, language]);

  if (pinnedLanguage) {
    return <CodeChallengeBody key={levelId} active={content} language={pinnedLanguage} onSolved={onSolved} onFeedback={onFeedback} />;
  }

  if (compiled) {
    if (loaded?.key !== key) return <p className="code-challenge__loading">⏳</p>;
    if (loaded.lesson) {
      return (
        <CodeChallengeBody
          key={key}
          active={{ ...content, ...loaded.lesson }}
          language={language}
          onSolved={onSolved}
          onFeedback={onFeedback}
        />
      );
    }
    // No hand-written lesson for this level in that language: fall back to JavaScript.
    return <CodeChallengeBody key={key} active={content} language="javascript" onSolved={onSolved} onFeedback={onFeedback} />;
  }

  return (
    <CodeChallengeBody
      key={key}
      active={resolveContent(content, language)}
      language={language}
      onSolved={onSolved}
      onFeedback={onFeedback}
    />
  );
}

function CodeChallengeBody({ active, language, onSolved, onFeedback }) {
  const { t } = useI18n();
  const compiled = isCompiledLanguage(language);
  const instructionsId = useId(); // CQ-10b: aria-describedby target
  const [code, setCode] = useState(active.starterCode);
  const [result, setResult] = useState(null); // { status, logs, error }
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  // CQ-16: starts the ~5.4MB Pyodide download the moment a Python lesson
  // opens, instead of waiting for Run — and tracks it here so the "first
  // time only" loading message below only shows while that's actually
  // in flight, never on later lessons once it's cached for the session.
  const [pythonLoading, setPythonLoading] = useState(language === "python" && !isPythonReady());

  useEffect(() => {
    if (language !== "python" || isPythonReady()) return;
    let cancelled = false;
    preloadPython().then(() => {
      if (!cancelled) setPythonLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  async function handleRun() {
    setRunning(true);
    onFeedback?.("running");
    const { logs, error } =
      language === "sql"
        ? await runSqlCode(active.seedSql, code)
        : language === "jsx"
          ? await runReactCode(code)
          : language === "html"
            ? await runHtmlCode(code, active.checks)
            : language === "python"
              ? await runPythonCode(code, active.pyPackages)
              : compiled
                ? await runCompiledCode(language, code)
                : await runJsCode(code);
    setRunning(false);

    if (error) {
      setResult({ status: "error", logs, error });
      setShowErrorDetails(false);
      setFailCount((n) => n + 1);
      onFeedback?.("wrong");
      return;
    }

    // Defensive: every runner's non-error path should always return a
    // real logs array, but a malformed runner result (e2e testing once
    // caught exactly this from a race inside pyRuntime.js) crashing the
    // whole lesson screen is a worse failure mode than just showing a
    // mismatch against expected output.
    const output = (logs ?? []).join("\n").trim();
    const passed = output === active.expectedOutput;
    setResult({ status: passed ? "success" : "mismatch", logs, error: null });
    if (!passed) setFailCount((n) => n + 1);
    onFeedback?.(passed ? "correct" : "wrong");
  }

  function handleShowSolution() {
    // `hint` is a complete, verified-correct snippet meant to be appended
    // after starterCode for the vast majority of lessons (every generated
    // drill, and most hand-authored ones) — but a handful of hand-
    // authored lessons use `hint` as plain-English guidance instead (e.g.
    // "console.log() takes a string in quotes, like ..."), which isn't
    // runnable on its own. Those lessons set an explicit `solution` (the
    // actual complete program) as an override; everything else falls
    // back to the starterCode+hint concatenation, which is the exact
    // combination scripts/verify-drills.mjs already checks for every
    // generated lesson. See QA_REPORT.md CQ-07.
    setCode(active.solution ?? `${active.starterCode}\n${active.hint}`);
    setSolutionShown(true);
    onFeedback?.("thinking");
  }

  return (
    <div className={`code-challenge code-challenge--${language}`}>
      <TutorialCard tutorial={active.tutorial} example={active.example} />

      <p id={instructionsId} className="code-challenge__instructions">{active.instructions}</p>

      <div className="code-challenge__editor-frame">
        <div className="code-challenge__editor-chrome">
          <span className="code-challenge__dot code-challenge__dot--red" />
          <span className="code-challenge__dot code-challenge__dot--yellow" />
          <span className="code-challenge__dot code-challenge__dot--green" />
        </div>
        <CodeEditor
          className="code-challenge__editor"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onFeedback?.("thinking");
          }}
          language={language}
          rows={Math.min(16, Math.max(5, active.starterCode.split("\n").length + 1))}
          ariaLabel={t("codeChallenge.editorLabel")}
          describedBy={instructionsId}
        />
      </div>

      <div className="code-challenge__actions">
        <button className="code-challenge__run" onClick={handleRun} disabled={running}>
          {running ? t("codeChallenge.running") : t("codeChallenge.run")}
        </button>
        {/* Always available, even before a first run — not just after a
            wrong answer. See QA_REPORT.md CQ-07. */}
        <button
          type="button"
          className="code-challenge__hint-toggle"
          onClick={() => setShowHint((v) => !v)}
        >
          💡 {showHint ? t("codeChallenge.hideHintBtn") : t("codeChallenge.hintBtn")}
        </button>
      </div>
      {showHint && <p className="code-challenge__hint">💡 {active.hint}</p>}
      {failCount >= SHOW_SOLUTION_AFTER && !solutionShown && (
        <button type="button" className="code-challenge__show-solution" onClick={handleShowSolution}>
          🔓 {t("codeChallenge.showSolution")}
        </button>
      )}
      {solutionShown && (
        <p className="code-challenge__online-note">✅ {t("codeChallenge.solutionFilled")}</p>
      )}
      {compiled && (
        <p className="code-challenge__online-note">
          ☁️ {running ? t("codeChallenge.compiling") : t("codeChallenge.onlineNote")}
        </p>
      )}
      {/* CQ-16: the first Python run on a fresh session pays for a ~5.4MB
          download with no explanation otherwise — shown instead of the
          pyPackages note below (which is specifically about the extra
          numpy/pandas-style packages some lessons need on top of this). */}
      {language === "python" && pythonLoading && (
        <p className="code-challenge__online-note">🐍 {t("codeChallenge.loadingPython")}</p>
      )}
      {active.pyPackages?.length > 0 && !pythonLoading && (
        <p className="code-challenge__online-note">
          📦 {running ? t("codeChallenge.loadingPackage") : t("codeChallenge.packageNote").replace("{package}", active.pyPackages.join(", "))}
        </p>
      )}
      {language === "html" && (
        <p className="code-challenge__online-note">
          🖥️ {running ? t("codeChallenge.rendering") : t("codeChallenge.htmlNote")}
        </p>
      )}

      {result && (
        <div className={`code-challenge__result code-challenge__result--${result.status}`}>
          {result.status === "success" && (
            <>
              <Confetti />
              <p className="code-challenge__result-title">
                {t("codeChallenge.success")} {active.expectedOutput}
              </p>
              <button className="code-challenge__continue" onClick={onSolved}>
                {t("codeChallenge.continue")}
              </button>
            </>
          )}

          {result.status === "mismatch" && (() => {
            const actual = result.logs.join("\n");
            const expected = active.expectedOutput;
            const diffIdx = firstDiffIndex(actual, expected);
            const caseOnlyDiff = actual !== expected && actual.toLowerCase() === expected.toLowerCase();
            return (
              <>
                <p className="code-challenge__result-title">{t("codeChallenge.mismatch")}</p>
                <div className="code-challenge__diff">
                  <p className="code-challenge__diff-row">
                    <span className="code-challenge__diff-label">{t("codeChallenge.expectedLabel")}</span>
                    <code className="code-challenge__diff-value">{expected}</code>
                  </p>
                  <p className="code-challenge__diff-row">
                    <span className="code-challenge__diff-label">{t("codeChallenge.yourOutputLabel")}</span>
                    <code className="code-challenge__diff-value">
                      {actual.length ? (
                        diffIdx === -1 ? actual : (
                          <>
                            {actual.slice(0, diffIdx)}
                            <mark className="code-challenge__diff-char">{actual.slice(diffIdx, diffIdx + 1) || " "}</mark>
                            {actual.slice(diffIdx + 1)}
                          </>
                        )
                      ) : (
                        t("codeChallenge.nothingPrinted")
                      )}
                    </code>
                  </p>
                </div>
                {caseOnlyDiff && <p className="code-challenge__diff-note">{t("codeChallenge.caseNote")}</p>}
              </>
            );
          })()}

          {result.status === "error" && (() => {
            const friendly = friendlyErrorMessage(result.error);
            return (
              <>
                <p className="code-challenge__result-title">{t("codeChallenge.error")}</p>
                <p className="code-challenge__result-detail">{friendly ?? result.error}</p>
                {friendly && (
                  <>
                    <button
                      type="button"
                      className="code-challenge__details-toggle"
                      onClick={() => setShowErrorDetails((v) => !v)}
                    >
                      {showErrorDetails ? t("codeChallenge.hideDetails") : t("codeChallenge.showDetails")}
                    </button>
                    {showErrorDetails && (
                      <p className="code-challenge__result-detail code-challenge__result-detail--raw">{result.error}</p>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

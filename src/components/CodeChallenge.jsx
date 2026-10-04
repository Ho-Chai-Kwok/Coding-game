import { useEffect, useState } from "react";
import TutorialCard from "./TutorialCard";
import Confetti from "./Confetti";
import CodeEditor from "./CodeEditor";
import { runPythonCode } from "../utils/pyRuntime";
import { runJsCode } from "../utils/runCode";
import { runCompiledCode } from "../utils/remoteRun";
import { runSqlCode } from "../utils/sqlRuntime";
import { runReactCode } from "../utils/reactRuntime";
import { runHtmlCode } from "../utils/htmlRuntime";
import { isCompiledLanguage } from "../data/languages";
import { useI18n } from "../i18n/I18nContext";

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
  const [code, setCode] = useState(active.starterCode);
  const [result, setResult] = useState(null); // { status, logs, error }
  const [running, setRunning] = useState(false);

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
      onFeedback?.("wrong");
      return;
    }

    const output = logs.join("\n").trim();
    const passed = output === active.expectedOutput;
    setResult({ status: passed ? "success" : "mismatch", logs, error: null });
    onFeedback?.(passed ? "correct" : "wrong");
  }

  return (
    <div className={`code-challenge code-challenge--${language}`}>
      <TutorialCard tutorial={active.tutorial} example={active.example} />

      <p className="code-challenge__instructions">{active.instructions}</p>

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
          disablePaste
        />
      </div>
      <p className="code-challenge__no-paste-hint">{t("codeChallenge.noPaste")}</p>

      <button className="code-challenge__run" onClick={handleRun} disabled={running}>
        {running ? t("codeChallenge.running") : t("codeChallenge.run")}
      </button>
      {compiled && (
        <p className="code-challenge__online-note">
          ☁️ {running ? t("codeChallenge.compiling") : t("codeChallenge.onlineNote")}
        </p>
      )}
      {active.pyPackages?.length > 0 && (
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

          {result.status === "mismatch" && (
            <>
              <p className="code-challenge__result-title">{t("codeChallenge.mismatch")}</p>
              <p className="code-challenge__result-detail">
                {t("codeChallenge.output")}{" "}
                {result.logs.length ? result.logs.join("\n") : t("codeChallenge.nothingPrinted")}
              </p>
              <p className="code-challenge__hint">💡 {active.hint}</p>
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
  );
}

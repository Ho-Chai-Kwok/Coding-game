import { useState } from "react";
import TutorialCard from "./TutorialCard";
import Confetti from "./Confetti";
import { runPythonCode } from "../utils/pyRuntime";
import { useI18n } from "../i18n/I18nContext";

function runJsCode(code) {
  const logs = [];
  const fakeConsole = {
    log: (...args) => logs.push(args.map(String).join(" ")),
  };

  try {
    const fn = new Function("console", code);
    fn(fakeConsole);
    return { logs, error: null };
  } catch (err) {
    return { logs, error: err.message };
  }
}

function resolveContent(content, language) {
  if (language !== "python" || !content.python) return content;
  return { ...content, ...content.python };
}

export default function CodeChallenge({ content, language = "javascript", onSolved }) {
  const { t } = useI18n();
  const active = resolveContent(content, language);
  const [code, setCode] = useState(active.starterCode);
  const [result, setResult] = useState(null); // { status, logs, error }
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    const { logs, error } =
      language === "python" ? await runPythonCode(code) : runJsCode(code);
    setRunning(false);

    if (error) {
      setResult({ status: "error", logs, error });
      return;
    }

    const output = logs.join("\n").trim();
    const passed = output === active.expectedOutput;
    setResult({ status: passed ? "success" : "mismatch", logs, error: null });
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
        <textarea
          className="code-challenge__editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={5}
        />
      </div>

      <button className="code-challenge__run" onClick={handleRun} disabled={running}>
        {running ? t("codeChallenge.running") : t("codeChallenge.run")}
      </button>

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

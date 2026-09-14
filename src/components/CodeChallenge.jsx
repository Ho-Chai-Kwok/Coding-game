import { useState } from "react";
import TutorialCard from "./TutorialCard";

function runUserCode(code) {
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

export default function CodeChallenge({ content, onSolved }) {
  const [code, setCode] = useState(content.starterCode);
  const [result, setResult] = useState(null); // { status, logs, error }

  function handleRun() {
    const { logs, error } = runUserCode(code);

    if (error) {
      setResult({ status: "error", logs, error });
      return;
    }

    const output = logs.join("\n").trim();
    const passed = output === content.expectedOutput;
    setResult({ status: passed ? "success" : "mismatch", logs, error: null });
  }

  return (
    <div className="code-challenge">
      <TutorialCard tutorial={content.tutorial} example={content.example} />

      <p className="code-challenge__instructions">{content.instructions}</p>

      <textarea
        className="code-challenge__editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={5}
      />

      <button className="code-challenge__run" onClick={handleRun}>
        ▶ Run Code
      </button>

      {result && (
        <div className={`code-challenge__result code-challenge__result--${result.status}`}>
          {result.status === "success" && (
            <>
              <p className="code-challenge__result-title">
                🎉 Awesome job! Output: {content.expectedOutput}
              </p>
              <button className="code-challenge__continue" onClick={onSolved}>
                Continue →
              </button>
            </>
          )}

          {result.status === "mismatch" && (
            <>
              <p className="code-challenge__result-title">So close! Let's try again 💪</p>
              <p className="code-challenge__result-detail">
                Output: {result.logs.length ? result.logs.join("\n") : "(nothing printed)"}
              </p>
              <p className="code-challenge__hint">💡 {content.hint}</p>
            </>
          )}

          {result.status === "error" && (
            <>
              <p className="code-challenge__result-title">Oops, a little hiccup! 🔧</p>
              <p className="code-challenge__result-detail">{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

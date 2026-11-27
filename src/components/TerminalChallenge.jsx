import { useEffect, useRef, useState } from "react";
import TutorialCard from "./TutorialCard";
import Confetti from "./Confetti";
import { useI18n } from "../i18n/useI18n";
import { runGitCommand, gitInitialState } from "../data/gitSim";
import { runBashCommand, bashInitialState } from "../data/bashSim";
import { runDockerCommand, dockerInitialState } from "../data/dockerSim";
import { runNpmCommand, npmInitialState } from "../data/npmSim";
import { runKubectlCommand, kubectlInitialState } from "../data/kubectlSim";
import { runMongoCommand, mongoInitialState } from "../data/mongoSim";
import { runAwsCommand, awsInitialState } from "../data/awsSim";
import { runFlaskCommand, flaskInitialState } from "../data/flaskSim";

// Each tool owns its own command interpreter and starting-state builder, so
// adding a new simulated tool never touches this component.
const TOOLS = {
  git: { run: runGitCommand, initialState: gitInitialState },
  bash: { run: runBashCommand, initialState: bashInitialState },
  docker: { run: runDockerCommand, initialState: dockerInitialState },
  npm: { run: runNpmCommand, initialState: npmInitialState },
  kubectl: { run: runKubectlCommand, initialState: kubectlInitialState },
  mongo: { run: runMongoCommand, initialState: mongoInitialState },
  aws: { run: runAwsCommand, initialState: awsInitialState },
  flask: { run: runFlaskCommand, initialState: flaskInitialState },
};

// A real, typeable terminal. The learner types actual commands and gets
// realistic output for anything they type — not just the "right answer" —
// via a small command interpreter per tool (see data/*Sim.js), so exploring
// off the happy path still feels like using the real tool. A lesson is a
// sequence of goals; each is satisfied by typing a command matching one of
// its `accept` patterns, at which point the terminal advances. Wrong
// commands still run through the real interpreter, so mistakes get real,
// useful error messages instead of "incorrect."
export default function TerminalChallenge({ content, onSolved, onFeedback }) {
  const { t } = useI18n();
  const { tool = "git", repoName, steps } = content;
  const { run: runner, initialState } = TOOLS[tool];

  const [simState, setSimState] = useState(() => initialState(content));
  const [history, setHistory] = useState([]); // { type: "command"|"output"|"error", text }
  const [input, setInput] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const step = steps[stepIndex];

  function matches(cmd) {
    const normalized = cmd.trim().replace(/\s+/g, " ");
    return step.accept.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(normalized) : pattern === normalized,
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd || done) return;

    // The interpreter's real, live output is always what's shown — never a
    // pre-written string — so it stays accurate to exactly what was typed
    // (e.g. the actual branch name), whether or not it matches this step's
    // goal. Matching only decides whether to advance.
    const { output, state: nextSimState, error } = runner(cmd, simState, repoName);
    const isGoal = matches(cmd);
    const lines = [{ type: "command", text: cmd }];
    if (output) lines.push({ type: error ? "error" : "output", text: output });

    setSimState(nextSimState);
    setHistory((h) => [...h, ...lines]);
    setInput("");

    if (isGoal) {
      setWrongCount(0);
      if (stepIndex + 1 >= steps.length) {
        setDone(true);
        onFeedback?.("correct");
      } else {
        setStepIndex((i) => i + 1);
        onFeedback?.("step");
      }
    } else {
      setWrongCount((c) => c + 1);
      onFeedback?.("wrong");
    }
  }

  return (
    <div className="terminal-challenge">
      <TutorialCard tutorial={content.tutorial} example={content.example} />
      <p className="code-challenge__instructions">{content.instructions}</p>

      <div className="terminal" onClick={() => inputRef.current?.focus()}>
        <div className="terminal__chrome">
          <span className="code-challenge__dot code-challenge__dot--red" />
          <span className="code-challenge__dot code-challenge__dot--yellow" />
          <span className="code-challenge__dot code-challenge__dot--green" />
          <span className="terminal__title">{repoName ?? "terminal"} — zsh</span>
        </div>
        <div className="terminal__body" ref={scrollRef}>
          {history.map((line, i) => (
            <pre
              key={i}
              className={`terminal__line terminal__line--${line.type}`}
            >
              {line.type === "command" ? `$ ${line.text}` : line.text}
            </pre>
          ))}
          {!done && (
            <form className="terminal__input-row" onSubmit={handleSubmit}>
              <span className="terminal__prompt">$</span>
              <input
                ref={inputRef}
                className="terminal__input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  onFeedback?.("thinking");
                }}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label={t("terminalChallenge.inputLabel")}
              />
            </form>
          )}
        </div>
      </div>

      {!done && (
        <p className="terminal-challenge__goal">
          🎯 {step.goal}
          {wrongCount >= 2 && step.hint && (
            <span className="terminal-challenge__hint"> · 💡 {step.hint}</span>
          )}
        </p>
      )}

      {done && (
        <div className="code-challenge__result code-challenge__result--success">
          <Confetti />
          <p className="code-challenge__result-title">{t("quizChallenge.correct")}</p>
          <button className="code-challenge__continue" onClick={onSolved}>
            {t("codeChallenge.continue")}
          </button>
        </div>
      )}
    </div>
  );
}

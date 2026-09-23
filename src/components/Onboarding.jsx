import { useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { SKILL_LEVELS, LEARNING_GOALS, getRecommendedQuestNames, getStartMessageKey } from "../data/onboarding";
import { PRIMER_STEPS } from "../data/primer";
import { LANGUAGES } from "../data/languages";
import { sidequests } from "../data/sidequests";
import Confetti from "./Confetti";

const BASE_STEPS = ["level", "goal", "language"];

// A quick comprehension check within the primer — same interaction and
// visuals as the main curriculum's QuizChallenge (retry on wrong, confetti
// + explanation on right), so it already feels familiar once real lessons
// start. Kept as its own component (rather than inline state in
// Onboarding) so its selected/status state resets for free every time a
// new primer step mounts, instead of needing to be manually cleared.
function PrimerQuizCard({ step, onSolved }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null); // null | "correct" | "incorrect"
  const options = t(`primer.${step.id}Options`);

  function handleSelect(i) {
    if (status === "correct") return;
    setSelected(i);
    setStatus(i === step.correctIndex ? "correct" : "incorrect");
  }

  return (
    <section className="onboarding__step primer-card">
      <span className="primer-card__icon">{step.icon}</span>
      <p className="quiz-challenge__question">{t(`primer.${step.id}Question`)}</p>
      <div className="quiz-challenge__options">
        {options.map((option, i) => {
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

      {status && (
        <div className={`quiz-challenge__feedback quiz-challenge__feedback--${status}`}>
          {status === "correct" && <Confetti />}
          <p className="quiz-challenge__feedback-title">
            {status === "correct" ? t("quizChallenge.correct") : t("quizChallenge.incorrect")}
          </p>
          <p className="quiz-challenge__explanation">{t(`primer.${step.id}Explanation`)}</p>
          {status === "correct" ? (
            <button className="quiz-challenge__continue" onClick={onSolved}>
              {t("primer.gotIt")}
            </button>
          ) : (
            <button className="quiz-challenge__retry" onClick={() => { setSelected(null); setStatus(null); }}>
              {t("quizChallenge.tryAgain")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function PrimerExplainCard({ step, onNext }) {
  const { t } = useI18n();
  const list = step.hasList ? t(`primer.${step.id}List`) : null;

  return (
    <section className="onboarding__step primer-card">
      <span className="primer-card__icon">{step.icon}</span>
      <h1>{t(`primer.${step.id}Title`)}</h1>
      <p className="primer-card__body">{t(`primer.${step.id}Body`)}</p>

      {step.example && <pre className="primer-card__example">{step.example}</pre>}

      {step.keyword && (
        <p className="primer-card__keyword">
          🔑 {t("primer.keyTermLabel")} <strong>{step.keyword}</strong>
        </p>
      )}

      {list && (
        <dl className="primer-card__list">
          {list.map((entry) => (
            <div className="primer-card__list-row" key={entry.term}>
              <dt>{entry.term}</dt>
              <dd>{entry.desc}</dd>
            </div>
          ))}
        </dl>
      )}

      <button className="onboarding__start primer-card__continue" onClick={onNext}>
        {t("primer.gotIt")}
      </button>
    </section>
  );
}

// One-time wizard shown right after login/guest, before the normal
// dashboard: level -> goal -> language -> (a short "what do these words
// mean" primer, ONLY for a total beginner — see PRIMER_STEPS in
// data/primer.js) -> a personalized starting point. Picks a starting
// language, points at a few relevant Side Quests (matched by name
// against the real quest list so a stale recommendation can never point
// at something that doesn't exist), and — for anyone who isn't a total
// beginner — fast-forwards the 100-world path to a starting world
// matching their level (applyHeadStart, called by App on finish). The
// path still unlocks strictly in order from wherever it starts.
export default function Onboarding({ onComplete }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(null);
  const [goal, setGoal] = useState(null);
  const [language, setLanguage] = useState(null);

  // The primer only ever gets inserted for a total beginner — someone
  // with "some experience" or who's "confident" already knows this, and
  // showing it to them would just be condescending friction before they
  // get to real code. Computed with useMemo (not plain STEPS = [...]) so
  // the array identity — and therefore each step's index — stays stable
  // across re-renders once `level` is set, which matters since `step` is
  // a plain index into this array.
  const STEPS = useMemo(() => {
    const primerIds = level === "beginner" ? PRIMER_STEPS.map((s) => s.id) : [];
    return [...BASE_STEPS, ...primerIds, "summary"];
  }, [level]);

  const stepName = STEPS[step];
  const primerStep = PRIMER_STEPS.find((s) => s.id === stepName);
  const recommendedQuests = sidequests.filter((q) => getRecommendedQuestNames(goal).includes(q.name)).slice(0, 3);

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function choose(setter, value) {
    setter(value);
    next();
  }

  function finish() {
    onComplete({ level, goal, language });
  }

  return (
    <div className="onboarding">
      <div className="onboarding__dots">
        {STEPS.map((s, i) => (
          <span key={s} className={`onboarding__dot${i === step ? " onboarding__dot--active" : ""}${i < step ? " onboarding__dot--done" : ""}`} />
        ))}
      </div>

      {stepName === "level" && (
        <section className="onboarding__step">
          <header className="onboarding__header">
            <h1>{t("onboarding.levelTitle")}</h1>
            <p>{t("onboarding.levelSubtitle")}</p>
          </header>
          <div className="onboarding__grid">
            {SKILL_LEVELS.map((l) => (
              <button key={l.id} className="onboarding__card" onClick={() => choose(setLevel, l.id)}>
                <span className="onboarding__card-icon">{l.icon}</span>
                <span className="onboarding__card-title">{t(`onboarding.${l.titleKey}`)}</span>
                <span className="onboarding__card-desc">{t(`onboarding.${l.descKey}`)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {stepName === "goal" && (
        <section className="onboarding__step">
          <header className="onboarding__header">
            <h1>{t("onboarding.goalTitle")}</h1>
            <p>{t("onboarding.goalSubtitle")}</p>
          </header>
          <div className="onboarding__grid">
            {LEARNING_GOALS.map((g) => (
              <button key={g.id} className="onboarding__card" onClick={() => choose(setGoal, g.id)}>
                <span className="onboarding__card-icon">{g.icon}</span>
                <span className="onboarding__card-title">{t(`onboarding.${g.titleKey}`)}</span>
                <span className="onboarding__card-desc">{t(`onboarding.${g.descKey}`)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {stepName === "language" && (
        <section className="onboarding__step">
          <header className="onboarding__header">
            <h1>{t("onboarding.languageTitle")}</h1>
            <p>{t("onboarding.languageSubtitle")}</p>
          </header>
          <div className="onboarding__grid">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                className={`onboarding__card onboarding__card--${lang.id}`}
                onClick={() => choose(setLanguage, lang.id)}
              >
                <span className="onboarding__card-icon">{lang.icon}</span>
                <span className="onboarding__card-title">{lang.name}</span>
                <span className="onboarding__card-desc">{t(`languageSelect.${lang.descKey}`)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {primerStep && primerStep.type === "explain" && (
        <PrimerExplainCard step={primerStep} onNext={next} />
      )}

      {primerStep && primerStep.type === "quiz" && (
        <PrimerQuizCard key={stepName} step={primerStep} onSolved={next} />
      )}

      {stepName === "summary" && (
        <section className="onboarding__step onboarding__summary">
          <span className="onboarding__summary-icon">🎯</span>
          <h1>{t("onboarding.summaryTitle")}</h1>
          <p className="onboarding__summary-message">{t(`onboarding.startMessage_${getStartMessageKey(level)}`)}</p>

          {recommendedQuests.length > 0 && (
            <div className="onboarding__recommend">
              <p className="onboarding__recommend-label">{t("onboarding.recommendedQuests")}</p>
              <div className="onboarding__recommend-list">
                {recommendedQuests.map((q) => (
                  <span key={q.id} className="onboarding__recommend-chip">
                    {q.icon} {q.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button className="onboarding__start" onClick={finish}>
            {t("onboarding.letsGo")}
          </button>
        </section>
      )}
    </div>
  );
}

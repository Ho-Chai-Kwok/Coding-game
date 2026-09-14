import { useState } from "react";
import TutorialCard from "./TutorialCard";

export default function QuizChallenge({ content, onSolved }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null); // null | "correct" | "incorrect"

  function handleSelect(index) {
    if (status === "correct") return;
    setSelected(index);
    setStatus(index === content.correctIndex ? "correct" : "incorrect");
  }

  function handleRetry() {
    setSelected(null);
    setStatus(null);
  }

  return (
    <div className="quiz-challenge">
      <TutorialCard tutorial={content.tutorial} example={content.example} />

      <p className="quiz-challenge__instructions">{content.instructions}</p>
      <p className="quiz-challenge__question">{content.question}</p>

      <div className="quiz-challenge__options">
        {content.options.map((option, i) => {
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
          <p className="quiz-challenge__feedback-title">
            {status === "correct" ? "🎉 You got it!" : "🤔 Not quite — try again!"}
          </p>
          <p className="quiz-challenge__explanation">{content.explanation}</p>

          {status === "correct" ? (
            <button className="quiz-challenge__continue" onClick={onSolved}>
              Continue →
            </button>
          ) : (
            <button className="quiz-challenge__retry" onClick={handleRetry}>
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

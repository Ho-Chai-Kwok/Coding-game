export default function RankedTimerBar({ secondsLeft, totalSeconds }) {
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;
  const urgent = pct <= 25;

  return (
    <div className="ranked-timer">
      <div className="ranked-timer__track">
        <div
          className={`ranked-timer__fill${urgent ? " ranked-timer__fill--urgent" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="ranked-timer__label">⏱️ {Math.max(0, secondsLeft)}s</span>
    </div>
  );
}

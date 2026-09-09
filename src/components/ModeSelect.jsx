export default function ModeSelect({ onSelect }) {
  return (
    <div className="mode-select">
      <header className="mode-select__header">
        <h1>Code Quest 🎮</h1>
        <p>How do you want to play today?</p>
      </header>

      <div className="mode-select__grid">
        <button
          className="mode-card mode-card--learning"
          onClick={() => onSelect("learning")}
        >
          <span className="mode-card__icon">🗺️</span>
          <span className="mode-card__title">Learning Mode</span>
          <span className="mode-card__desc">
            Explore 10 worlds and 200 stages at your own pace.
          </span>
        </button>

        <button
          className="mode-card mode-card--ranked"
          onClick={() => onSelect("ranked")}
        >
          <span className="mode-card__icon">🏆</span>
          <span className="mode-card__title">Ranked Mode</span>
          <span className="mode-card__desc">
            Battle timed challenges and climb the rank ladder.
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ModeSelect({ onSelect }) {
  return (
    <div className="mode-select">
      <header className="mode-select__header">
        <h1>Code Quest 🎮</h1>
        <p>Hi there! What kind of adventure sounds fun today?</p>
      </header>

      <div className="mode-select__grid">
        <button
          className="mode-card mode-card--learning"
          onClick={() => onSelect("learning")}
        >
          <span className="mode-card__icon">🗺️</span>
          <span className="mode-card__title">Learning Mode</span>
          <span className="mode-card__desc">
            100 worlds, one topic at a time — go slow, go steady!
          </span>
        </button>

        <button
          className="mode-card mode-card--sidequest"
          onClick={() => onSelect("sidequest")}
        >
          <span className="mode-card__icon">🧭</span>
          <span className="mode-card__title">Side Quests</span>
          <span className="mode-card__desc">
            Peek at real tools like PyTorch, AWS, and NumPy!
          </span>
        </button>

        <button
          className="mode-card mode-card--ranked"
          onClick={() => onSelect("ranked")}
        >
          <span className="mode-card__icon">🏆</span>
          <span className="mode-card__title">Ranked Mode</span>
          <span className="mode-card__desc">
            Take on quick challenges and climb the rank ladder!
          </span>
        </button>
      </div>
    </div>
  );
}

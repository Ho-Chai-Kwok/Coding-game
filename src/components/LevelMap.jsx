import { levels } from "../data/levels";
import LevelNode from "./LevelNode";

export default function LevelMap({ onSelectLevel }) {
  return (
    <div className="level-map">
      <header className="level-map__header">
        <h1>Code Quest 🎮</h1>
        <p>Pick a level to begin your adventure!</p>
      </header>

      <div className="level-map__path">
        {levels.map((level) => (
          <LevelNode key={level.id} level={level} onSelect={onSelectLevel} />
        ))}
      </div>
    </div>
  );
}

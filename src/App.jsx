import { useState } from "react";
import LevelMap from "./components/LevelMap";
import LevelScreen from "./components/LevelScreen";
import "./App.css";

export default function App() {
  const [activeLevel, setActiveLevel] = useState(null);

  return (
    <div className="app">
      {activeLevel ? (
        <LevelScreen level={activeLevel} onBack={() => setActiveLevel(null)} />
      ) : (
        <LevelMap onSelectLevel={setActiveLevel} />
      )}
    </div>
  );
}

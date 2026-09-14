import { useState } from "react";
import ModeSelect from "./components/ModeSelect";
import WorldMap from "./components/WorldMap";
import LevelMap from "./components/LevelMap";
import LevelScreen from "./components/LevelScreen";
import RankedHome from "./components/RankedHome";
import SideQuestMap from "./components/SideQuestMap";
import { worlds } from "./data/levels";
import { sidequests } from "./data/sidequests";
import "./App.css";

const RANKED_CHALLENGES = [
  { id: "ranked-1", stageNumber: 1, title: "Speed Syntax Duel", character: "⚔️" },
  { id: "ranked-2", stageNumber: 2, title: "Bug Hunt Showdown", character: "🐞" },
  { id: "ranked-3", stageNumber: 3, title: "Logic Lightning Round", character: "⚡" },
];

export default function App() {
  const [mode, setMode] = useState(null); // null | "learning" | "ranked" | "sidequest"

  // Learning mode state
  const [worldsState, setWorldsState] = useState(() => structuredClone(worlds));
  const [activeWorldId, setActiveWorldId] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);

  // Side quest state
  const [sideQuestsState, setSideQuestsState] = useState(() =>
    structuredClone(sidequests),
  );
  const [activeSideQuestId, setActiveSideQuestId] = useState(null);

  // Ranked mode state
  const [rankedChallenge, setRankedChallenge] = useState(null);
  const [rankedPoints, setRankedPoints] = useState(1240);
  const [rankedWins, setRankedWins] = useState(7);
  const [rankedLosses, setRankedLosses] = useState(4);

  function backToModes() {
    setMode(null);
    setActiveWorldId(null);
    setActiveLevel(null);
    setActiveSideQuestId(null);
    setRankedChallenge(null);
  }

  function completeLevel(level) {
    setWorldsState((prev) => {
      const next = structuredClone(prev);
      const world = next.find((w) => w.id === level.worldId);
      const lvl = world.levels.find((l) => l.id === level.id);
      lvl.status = "completed";

      const nextLevel = world.levels.find(
        (l) => l.stageNumber === level.stageNumber + 1,
      );
      if (nextLevel && nextLevel.status === "locked") {
        nextLevel.status = "unlocked";
      } else if (!nextLevel) {
        const nextWorld = next.find((w) => w.id === world.id + 1);
        if (nextWorld && nextWorld.status === "locked") {
          nextWorld.status = "unlocked";
          // A world being unlocked must also unlock its own first level,
          // otherwise entering it shows every stage locked with no way in.
          if (nextWorld.levels[0]) {
            nextWorld.levels[0].status = "unlocked";
          }
        }
      }

      return next;
    });
    setActiveLevel(null);
  }

  function completeSideQuest(quest) {
    setSideQuestsState((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, completed: true } : q)),
    );
    setActiveSideQuestId(null);
  }

  function startRankedMatch() {
    const challenge =
      RANKED_CHALLENGES[Math.floor(Math.random() * RANKED_CHALLENGES.length)];
    setRankedChallenge(challenge);
  }

  function handleFinishRanked(didWin) {
    setRankedPoints((p) => Math.max(0, p + (didWin ? 25 : -18)));
    if (didWin) setRankedWins((w) => w + 1);
    else setRankedLosses((l) => l + 1);
    setRankedChallenge(null);
  }

  let screen;

  if (!mode) {
    screen = <ModeSelect onSelect={setMode} />;
  } else if (mode === "learning") {
    const activeWorld = worldsState.find((w) => w.id === activeWorldId);

    if (activeLevel) {
      screen = (
        <LevelScreen
          level={activeLevel}
          onBack={() => setActiveLevel(null)}
          onCompleteLevel={completeLevel}
        />
      );
    } else if (activeWorld) {
      screen = (
        <LevelMap
          world={activeWorld}
          onSelectLevel={setActiveLevel}
          onBack={() => setActiveWorldId(null)}
        />
      );
    } else {
      screen = (
        <WorldMap
          worlds={worldsState}
          onSelectWorld={setActiveWorldId}
          onBack={backToModes}
        />
      );
    }
  } else if (mode === "sidequest") {
    const activeQuest = sideQuestsState.find((q) => q.id === activeSideQuestId);

    if (activeQuest) {
      screen = (
        <LevelScreen
          level={activeQuest.level}
          mode="sidequest"
          onBack={() => setActiveSideQuestId(null)}
          onCompleteLevel={() => completeSideQuest(activeQuest)}
        />
      );
    } else {
      screen = (
        <SideQuestMap
          sidequests={sideQuestsState}
          onSelectQuest={(q) => setActiveSideQuestId(q.id)}
          onBack={backToModes}
        />
      );
    }
  } else {
    if (rankedChallenge) {
      screen = (
        <LevelScreen
          level={rankedChallenge}
          mode="ranked"
          onBack={() => setRankedChallenge(null)}
          onFinishRanked={handleFinishRanked}
        />
      );
    } else {
      screen = (
        <RankedHome
          points={rankedPoints}
          wins={rankedWins}
          losses={rankedLosses}
          onPlay={startRankedMatch}
          onBack={backToModes}
        />
      );
    }
  }

  return <div className="app">{screen}</div>;
}

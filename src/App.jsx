import { useState, useMemo, useCallback } from "react";
import ModeSelect from "./components/ModeSelect";
import WorldMap from "./components/WorldMap";
import LevelMap from "./components/LevelMap";
import LevelScreen from "./components/LevelScreen";
import RankedHome from "./components/RankedHome";
import SideQuestMap from "./components/SideQuestMap";
import SideQuestPath from "./components/SideQuestPath";
import LanguageSelect from "./components/LanguageSelect";
import Settings from "./components/Settings";
import AuthGate from "./components/AuthGate";
import { useAuth } from "./auth/AuthContext";
import { useProgressSync } from "./hooks/useProgressSync";
import { worlds } from "./data/levels";
import { sidequests } from "./data/sidequests";
import "./App.css";

const RANKED_CHALLENGES = [
  { id: "ranked-1", stageNumber: 1, title: "Speed Syntax Duel", character: "⚔️" },
  { id: "ranked-2", stageNumber: 2, title: "Bug Hunt Showdown", character: "🐞" },
  { id: "ranked-3", stageNumber: 3, title: "Logic Lightning Round", character: "⚡" },
];

function freshWorlds() {
  return structuredClone(worlds);
}

function freshSideQuests() {
  return structuredClone(sidequests);
}

function AppShell() {
  const { user } = useAuth();

  const [mode, setMode] = useState(null); // null | "learning" | "ranked" | "sidequest" | "settings"

  // Learning mode state
  const [worldsState, setWorldsState] = useState(freshWorlds);
  const [activeWorldId, setActiveWorldId] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [language, setLanguage] = useState(null); // null | "javascript" | "python"

  // Side quest state
  const [sideQuestsState, setSideQuestsState] = useState(freshSideQuests);
  const [activeSideQuestId, setActiveSideQuestId] = useState(null);
  const [activeSideQuestLesson, setActiveSideQuestLesson] = useState(null);

  // Ranked mode state
  const [rankedChallenge, setRankedChallenge] = useState(null);
  const [rankedPoints, setRankedPoints] = useState(1240);
  const [rankedWins, setRankedWins] = useState(7);
  const [rankedLosses, setRankedLosses] = useState(4);

  // Persist progress: Supabase when logged in, localStorage as a guest.
  const progressSnapshot = useMemo(
    () => ({ worldsState, sideQuestsState, rankedPoints, rankedWins, rankedLosses }),
    [worldsState, sideQuestsState, rankedPoints, rankedWins, rankedLosses],
  );

  const onHydrate = useCallback((saved) => {
    if (!saved) return;
    if (saved.worldsState) setWorldsState(saved.worldsState);
    if (saved.sideQuestsState) setSideQuestsState(saved.sideQuestsState);
    if (typeof saved.rankedPoints === "number") setRankedPoints(saved.rankedPoints);
    if (typeof saved.rankedWins === "number") setRankedWins(saved.rankedWins);
    if (typeof saved.rankedLosses === "number") setRankedLosses(saved.rankedLosses);
  }, []);

  useProgressSync({ userId: user?.id ?? null, state: progressSnapshot, onHydrate });

  function resetProgress() {
    setWorldsState(freshWorlds());
    setSideQuestsState(freshSideQuests());
    setRankedPoints(1240);
    setRankedWins(7);
    setRankedLosses(4);
  }

  function backToModes() {
    setMode(null);
    setActiveWorldId(null);
    setActiveLevel(null);
    setActiveSideQuestId(null);
    setActiveSideQuestLesson(null);
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

  function completeSideQuestLesson(lesson) {
    setSideQuestsState((prev) => {
      const next = structuredClone(prev);
      const quest = next.find((q) => q.id === lesson.questId);
      const l = quest.lessons.find((x) => x.id === lesson.id);
      l.status = "completed";

      const nextLesson = quest.lessons.find(
        (x) => x.lessonNumber === lesson.lessonNumber + 1,
      );
      if (nextLesson && nextLesson.status === "locked") {
        nextLesson.status = "unlocked";
      }

      return next;
    });
    setActiveSideQuestLesson(null);
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
    screen = <ModeSelect onSelect={setMode} onOpenSettings={() => setMode("settings")} />;
  } else if (mode === "settings") {
    screen = <Settings onBack={backToModes} onResetProgress={resetProgress} />;
  } else if (mode === "learning") {
    const activeWorld = worldsState.find((w) => w.id === activeWorldId);

    if (!language) {
      screen = (
        <LanguageSelect onSelect={setLanguage} onBack={backToModes} />
      );
    } else if (activeLevel) {
      screen = (
        <LevelScreen
          level={activeLevel}
          language={language}
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
          language={language}
          onChangeLanguage={() => setLanguage(null)}
          onSelectWorld={setActiveWorldId}
          onBack={backToModes}
        />
      );
    }
  } else if (mode === "sidequest") {
    const activeQuest = sideQuestsState.find((q) => q.id === activeSideQuestId);

    if (activeSideQuestLesson) {
      screen = (
        <LevelScreen
          level={activeSideQuestLesson}
          mode="sidequest"
          onBack={() => setActiveSideQuestLesson(null)}
          onCompleteLevel={completeSideQuestLesson}
        />
      );
    } else if (activeQuest) {
      screen = (
        <SideQuestPath
          quest={activeQuest}
          onSelectLesson={setActiveSideQuestLesson}
          onBack={() => setActiveSideQuestId(null)}
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

export default function App() {
  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  );
}

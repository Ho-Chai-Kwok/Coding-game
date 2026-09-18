import { useState, useMemo, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import ModeSelect from "./components/ModeSelect";
import WorldMap from "./components/WorldMap";
import LevelMap from "./components/LevelMap";
import LevelScreen from "./components/LevelScreen";
import LanguageSelect from "./components/LanguageSelect";
import AuthGate from "./components/AuthGate";
import { useAuth } from "./auth/AuthContext";
import { useProgressSync } from "./hooks/useProgressSync";
import { computeStreak } from "./utils/streak";
import { STREAK_MILESTONES, BASE_AVATARS } from "./data/rewards";
import { worlds } from "./data/levels";
import { sidequests } from "./data/sidequests";
import { CHARACTERS, buildUnlockContext } from "./data/characters";
import "./App.css";

// Lazy-loaded: these aren't needed for the first paint (mode select ->
// learning path is the happy path most sessions take), so splitting them
// out keeps the initial bundle smaller instead of shipping all of Ranked
// Mode's 8 game components, the question bank, Settings, etc. up front.
const RankedHome = lazy(() => import("./components/RankedHome"));
const RankedShuffle = lazy(() => import("./components/RankedShuffle"));
const RankedModeRunner = lazy(() => import("./components/RankedModeRunner"));
const SideQuestMap = lazy(() => import("./components/SideQuestMap"));
const SideQuestPath = lazy(() => import("./components/SideQuestPath"));
const Settings = lazy(() => import("./components/Settings"));
const LoginCalendar = lazy(() => import("./components/LoginCalendar"));
const CharacterRoster = lazy(() => import("./components/CharacterRoster"));

const DEFAULT_PROFILE = { displayName: "Coder", avatar: "🦊" };

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

  // Ranked mode state. rankedMode is null (home) | "shuffle" (spin-the-
  // wheel screen) | a MODE_IDS value while a match is being played.
  const [rankedMode, setRankedMode] = useState(null);
  const [rankedPoints, setRankedPoints] = useState(1240);
  const [rankedWins, setRankedWins] = useState(7);
  const [rankedLosses, setRankedLosses] = useState(4);

  // Profile, appearance, and "real app" dashboard bits
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [theme, setTheme] = useState("system"); // "system" | "light" | "dark"
  const [streak, setStreak] = useState(1);
  const [lastPlayedDate, setLastPlayedDate] = useState(null);
  const [continueWorldId, setContinueWorldId] = useState(null);
  const [loginDates, setLoginDates] = useState([]);
  const [claimedMilestones, setClaimedMilestones] = useState([]);
  const [unlockedAvatars, setUnlockedAvatars] = useState(BASE_AVATARS);
  const [newlyEarnedRewards, setNewlyEarnedRewards] = useState([]);

  // Characters: unlocked through real progress (see src/data/characters.js),
  // selectable to represent the player in Ranked Mode.
  const [selectedCharacterId, setSelectedCharacterId] = useState(CHARACTERS[0].id);

  useEffect(() => {
    if (theme === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  // Persist progress: Supabase when logged in, localStorage as a guest.
  const progressSnapshot = useMemo(
    () => ({
      worldsState,
      sideQuestsState,
      rankedPoints,
      rankedWins,
      rankedLosses,
      profile,
      theme,
      streak,
      lastPlayedDate,
      continueWorldId,
      loginDates,
      claimedMilestones,
      unlockedAvatars,
      selectedCharacterId,
    }),
    [
      worldsState,
      sideQuestsState,
      rankedPoints,
      rankedWins,
      rankedLosses,
      profile,
      theme,
      streak,
      lastPlayedDate,
      continueWorldId,
      loginDates,
      claimedMilestones,
      unlockedAvatars,
      selectedCharacterId,
    ],
  );

  const hasHydratedRef = useRef(false);

  const onHydrate = useCallback((saved) => {
    // Guard against granting daily rewards twice: React's StrictMode
    // intentionally double-invokes effects in development, and this
    // callback should only ever apply its one-time hydration/reward
    // logic once per real app load regardless.
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    if (saved) {
      if (saved.worldsState) setWorldsState(saved.worldsState);
      if (saved.sideQuestsState) setSideQuestsState(saved.sideQuestsState);
      if (typeof saved.rankedPoints === "number") setRankedPoints(saved.rankedPoints);
      if (typeof saved.rankedWins === "number") setRankedWins(saved.rankedWins);
      if (typeof saved.rankedLosses === "number") setRankedLosses(saved.rankedLosses);
      if (saved.profile) setProfile(saved.profile);
      if (saved.theme) setTheme(saved.theme);
      if (saved.continueWorldId) setContinueWorldId(saved.continueWorldId);
      if (saved.selectedCharacterId) setSelectedCharacterId(saved.selectedCharacterId);
    }

    const { streak: nextStreak, lastPlayedDate: today } = computeStreak(
      saved?.streak,
      saved?.lastPlayedDate,
    );
    setStreak(nextStreak);
    setLastPlayedDate(today);

    const prevLoginDates = saved?.loginDates ?? [];
    const prevClaimed = saved?.claimedMilestones ?? [];
    const prevAvatars = saved?.unlockedAvatars ?? BASE_AVATARS;
    const isNewLoginDay = !prevLoginDates.includes(today);

    setLoginDates(isNewLoginDay ? [...prevLoginDates, today] : prevLoginDates);

    if (isNewLoginDay) {
      const newlyEarned = STREAK_MILESTONES.filter(
        (m) => m.day <= nextStreak && !prevClaimed.includes(m.day),
      );
      if (newlyEarned.length > 0) {
        const bonusLp = newlyEarned.reduce((sum, m) => sum + (m.lp || 0), 0);
        const newAvatars = newlyEarned.filter((m) => m.avatar).map((m) => m.avatar);
        setClaimedMilestones([...prevClaimed, ...newlyEarned.map((m) => m.day)]);
        setUnlockedAvatars([...new Set([...prevAvatars, ...newAvatars])]);
        if (bonusLp > 0) setRankedPoints((p) => p + bonusLp);
        setNewlyEarnedRewards(newlyEarned);
        return;
      }
    }
    setClaimedMilestones(prevClaimed);
    setUnlockedAvatars(prevAvatars);
  }, []);

  useProgressSync({ userId: user?.id ?? null, state: progressSnapshot, onHydrate });

  function resetProgress() {
    setWorldsState(freshWorlds());
    setSideQuestsState(freshSideQuests());
    setRankedPoints(1240);
    setRankedWins(7);
    setRankedLosses(4);
    setContinueWorldId(null);
    setLoginDates([]);
    setClaimedMilestones([]);
    setUnlockedAvatars(BASE_AVATARS);
    setNewlyEarnedRewards([]);
    setSelectedCharacterId(CHARACTERS[0].id);
  }

  function enterWorld(worldId) {
    setActiveWorldId(worldId);
    setContinueWorldId(worldId);
  }

  function backToModes() {
    setMode(null);
    setActiveWorldId(null);
    setActiveLevel(null);
    setActiveSideQuestId(null);
    setActiveSideQuestLesson(null);
    setRankedMode(null);
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

  function handleFinishRankedMode(pointsDelta, didWin) {
    setRankedPoints((p) => Math.max(0, p + pointsDelta));
    if (didWin) setRankedWins((w) => w + 1);
    else setRankedLosses((l) => l + 1);
    setRankedMode(null);
  }

  const overallProgress = useMemo(() => {
    const worldLevels = worldsState.flatMap((w) => w.levels);
    const questLevels = sideQuestsState.flatMap((q) => q.lessons);
    const all = [...worldLevels, ...questLevels];
    return {
      completed: all.filter((l) => l.status === "completed").length,
      total: all.length,
    };
  }, [worldsState, sideQuestsState]);

  const unlockCtx = useMemo(
    () =>
      buildUnlockContext({
        overallProgress,
        rankedWins,
        rankedLosses,
        rankedPoints,
        streak,
      }),
    [overallProgress, rankedWins, rankedLosses, rankedPoints, streak],
  );

  const selectedCharacter = useMemo(
    () => CHARACTERS.find((c) => c.id === selectedCharacterId) ?? CHARACTERS[0],
    [selectedCharacterId],
  );

  const continueWorld = useMemo(() => {
    const world = worldsState.find((w) => w.id === continueWorldId);
    if (!world) return null;
    const completedCount = world.levels.filter((l) => l.status === "completed").length;
    if (completedCount >= world.levels.length) return null;
    return { ...world, completedCount };
  }, [worldsState, continueWorldId]);

  function handleContinueLearning() {
    if (!continueWorld) return;
    setMode("learning");
    enterWorld(continueWorld.id);
  }

  let screen;

  if (!mode) {
    screen = (
      <ModeSelect
        profile={profile}
        streak={streak}
        overallProgress={overallProgress}
        continueWorld={continueWorld}
        onContinueLearning={handleContinueLearning}
        onSelect={setMode}
        onOpenSettings={() => setMode("settings")}
        onOpenCalendar={() => setMode("calendar")}
        onOpenCharacters={() => setMode("characters")}
      />
    );
  } else if (mode === "characters") {
    screen = (
      <CharacterRoster
        unlockCtx={unlockCtx}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={setSelectedCharacterId}
        onBack={backToModes}
      />
    );
  } else if (mode === "calendar") {
    screen = (
      <LoginCalendar
        loginDates={loginDates}
        streak={streak}
        claimedMilestones={claimedMilestones}
        newlyEarnedRewards={newlyEarnedRewards}
        onDismissRewards={() => setNewlyEarnedRewards([])}
        onBack={backToModes}
      />
    );
  } else if (mode === "settings") {
    screen = (
      <Settings
        profile={profile}
        onChangeProfile={setProfile}
        theme={theme}
        onChangeTheme={setTheme}
        codingLanguage={language}
        onChangeCodingLanguage={setLanguage}
        unlockedAvatars={unlockedAvatars}
        onBack={backToModes}
        onResetProgress={resetProgress}
      />
    );
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
          onSelectWorld={enterWorld}
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
    if (rankedMode === "shuffle") {
      screen = (
        <RankedShuffle
          onPlayMode={setRankedMode}
          onExit={() => setRankedMode(null)}
        />
      );
    } else if (rankedMode) {
      screen = (
        <RankedModeRunner
          modeId={rankedMode}
          character={selectedCharacter}
          language={language ?? "javascript"}
          rankedPoints={rankedPoints}
          onExit={() => setRankedMode(null)}
          onFinish={handleFinishRankedMode}
        />
      );
    } else {
      screen = (
        <RankedHome
          points={rankedPoints}
          wins={rankedWins}
          losses={rankedLosses}
          selectedCharacter={selectedCharacter}
          onPlay={() => setRankedMode("shuffle")}
          onOpenCharacters={() => setMode("characters")}
          onBack={backToModes}
        />
      );
    }
  }

  return (
    <div className="app">
      <Suspense fallback={<div className="app-loading" aria-label="Loading">🎮</div>}>{screen}</Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  );
}

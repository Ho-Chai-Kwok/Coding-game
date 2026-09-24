import { useState, useMemo, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import ModeSelect from "./components/ModeSelect";
import BottomNav from "./components/BottomNav";
import WorldMap from "./components/WorldMap";
import LevelMap from "./components/LevelMap";
import LevelScreen from "./components/LevelScreen";
import LanguageSelect from "./components/LanguageSelect";
import AuthGate from "./components/AuthGate";
import { useAuth } from "./auth/AuthContext";
import { useProgressSync } from "./hooks/useProgressSync";
import { computeStreak } from "./utils/streak";
import { packWorlds, unpackWorlds, packSideQuests, unpackSideQuests } from "./utils/progressSerialize";
import { bootstrapRankedStats, fetchRankedStats } from "./utils/rankedStats";
import { STREAK_MILESTONES, BASE_AVATARS } from "./data/rewards";
import { worlds } from "./data/levels";
import { sidequests } from "./data/sidequests";
import { CHARACTERS, buildUnlockContext } from "./data/characters";
import { describeRankChange } from "./data/rank";
import { SKILL_GATE_LESSONS } from "./data/skillGate";
import { toInstantLanguage, isCompiledLanguage } from "./data/languages";
import { applyHeadStart, getHeadStartWorldId } from "./data/onboarding";
import "./App.css";

// Lazy-loaded: these aren't needed for the first paint (mode select ->
// learning path is the happy path most sessions take), so splitting them
// out keeps the initial bundle smaller instead of shipping all of Ranked
// Mode's 8 game components, the question bank, Settings, etc. up front.
const RankedHome = lazy(() => import("./components/RankedHome"));
const RankedShuffle = lazy(() => import("./components/RankedShuffle"));
const RankedQueue = lazy(() => import("./components/RankedQueue"));
const RankedMatchRunner = lazy(() => import("./components/RankedMatchRunner"));
const RankedPracticeRunner = lazy(() => import("./components/RankedPracticeRunner"));
const SideQuestMap = lazy(() => import("./components/SideQuestMap"));
const SideQuestPath = lazy(() => import("./components/SideQuestPath"));
const Settings = lazy(() => import("./components/Settings"));
const CodeHelper = lazy(() => import("./components/CodeHelper"));
const PracticeProblems = lazy(() => import("./components/PracticeProblems"));
const LoginCalendar = lazy(() => import("./components/LoginCalendar"));
const CharacterRoster = lazy(() => import("./components/CharacterRoster"));
const RankChange = lazy(() => import("./components/RankChange"));
const LegalPage = lazy(() => import("./components/LegalPage"));
const Onboarding = lazy(() => import("./components/Onboarding"));

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
  // wheel screen) | a MODE_IDS value once a mode's been picked. Ranked is
  // real player-vs-player: picking a mode enters real matchmaking
  // (rankedMatchId stays null while searching), and only once a real
  // opponent is found does actual gameplay start. rankedPracticing is the
  // explicit, clearly-labeled opt-out offered after a while in queue —
  // solo play against no one, never affecting rankedPoints below.
  const [rankedMode, setRankedMode] = useState(null);
  const [rankedMatchId, setRankedMatchId] = useState(null);
  const [rankedPracticing, setRankedPracticing] = useState(false);
  const [rankedPoints, setRankedPoints] = useState(0);
  const [rankedWins, setRankedWins] = useState(0);
  const [rankedLosses, setRankedLosses] = useState(0);
  const [rankedShield, setRankedShield] = useState(0); // matches left of promotion shield
  const [peakPoints, setPeakPoints] = useState(0);
  const [rankChange, setRankChange] = useState(null); // set after a match that moved rank

  // Profile, appearance, and "real app" dashboard bits
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [theme, setTheme] = useState("system"); // "system" | "light" | "dark"
  const [reducedMotion, setReducedMotion] = useState("system"); // "system" | "on" | "off"
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

  // One-time "getting to know you" wizard (level/goal/language), shown
  // once per account/guest device right after login. Starts as null
  // ("unknown yet") rather than false, so a returning user whose answer is
  // already saved never sees it flash before hydration confirms that.
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [onboardingAnswers, setOnboardingAnswers] = useState(null);

  useEffect(() => {
    if (theme === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  // "system" respects the OS-level prefers-reduced-motion setting (checked
  // live, not just at mount, so it still reacts if someone flips it while
  // the app is open); "on"/"off" override it explicitly. The actual
  // animation-killing lives in CSS (see index.css), gated on this one data
  // attribute — same pattern as theme above.
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    function apply() {
      const effective = reducedMotion === "system" ? Boolean(query?.matches) : reducedMotion === "on";
      document.documentElement.dataset.reducedMotion = effective ? "true" : "false";
    }
    apply();
    if (reducedMotion !== "system" || !query) return undefined;
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [reducedMotion]);

  // Persist progress: Supabase when logged in, localStorage as a guest.
  const progressSnapshot = useMemo(
    () => ({
      worldsState: packWorlds(worldsState),
      sideQuestsState: packSideQuests(sideQuestsState),
      language,
      rankedPoints,
      rankedWins,
      rankedLosses,
      rankedShield,
      peakPoints,
      profile,
      theme,
      reducedMotion,
      streak,
      lastPlayedDate,
      continueWorldId,
      loginDates,
      claimedMilestones,
      unlockedAvatars,
      selectedCharacterId,
      onboardingComplete,
      onboardingAnswers,
    }),
    [
      worldsState,
      sideQuestsState,
      language,
      rankedPoints,
      rankedWins,
      rankedLosses,
      rankedShield,
      peakPoints,
      profile,
      theme,
      reducedMotion,
      streak,
      lastPlayedDate,
      continueWorldId,
      loginDates,
      claimedMilestones,
      unlockedAvatars,
      selectedCharacterId,
      onboardingComplete,
      onboardingAnswers,
    ],
  );

  const hasHydratedRef = useRef(false);

  const onHydrate = useCallback((saved, userId) => {
    // Guard against granting daily rewards twice: React's StrictMode
    // intentionally double-invokes effects in development, and this
    // callback should only ever apply its one-time hydration/reward
    // logic once per real app load regardless.
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    // Resolved unconditionally (saved may be null for a brand-new guest),
    // so this always turns the null "unknown" state into a real boolean.
    setOnboardingComplete(Boolean(saved?.onboardingComplete));
    setOnboardingAnswers(saved?.onboardingAnswers ?? null);

    if (saved) {
      if (saved.worldsState) setWorldsState(unpackWorlds(saved.worldsState));
      if (saved.sideQuestsState) setSideQuestsState(unpackSideQuests(saved.sideQuestsState));
      if (saved.language) setLanguage(saved.language);
      if (!userId) {
        // Guest: no account, so no server-side ranked_stats row to read —
        // these numbers still live entirely in the local blob, unchanged
        // from before.
        if (typeof saved.rankedPoints === "number") setRankedPoints(saved.rankedPoints);
        if (typeof saved.rankedWins === "number") setRankedWins(saved.rankedWins);
        if (typeof saved.rankedLosses === "number") setRankedLosses(saved.rankedLosses);
        if (typeof saved.rankedShield === "number") setRankedShield(saved.rankedShield);
        setPeakPoints(Math.max(saved.peakPoints ?? 0, saved.rankedPoints ?? 0));
      }
      if (saved.profile) setProfile(saved.profile);
      if (saved.theme) setTheme(saved.theme);
      if (saved.reducedMotion) setReducedMotion(saved.reducedMotion);
      if (saved.continueWorldId) setContinueWorldId(saved.continueWorldId);
      if (saved.selectedCharacterId) setSelectedCharacterId(saved.selectedCharacterId);
    }

    if (userId) {
      // Signed in: LP/wins/losses/shield are server-authoritative (see
      // ranked_stats in supabase/schema.sql) — the client-synced blob is
      // never trusted for these once there's a real account. Bootstrap
      // carries over whatever this account's LP already was the first
      // time this runs for it (a no-op every time after that — see
      // claim_initial_ranked_stats()), then the real stored values
      // always win over anything guessed from the old blob.
      bootstrapRankedStats({
        points: saved?.rankedPoints ?? 0,
        peakPoints: Math.max(saved?.peakPoints ?? 0, saved?.rankedPoints ?? 0),
        wins: saved?.rankedWins ?? 0,
        losses: saved?.rankedLosses ?? 0,
        shield: saved?.rankedShield ?? 0,
      }).then((stats) => {
        if (!stats) return;
        setRankedPoints(stats.points);
        setRankedWins(stats.wins);
        setRankedLosses(stats.losses);
        setRankedShield(stats.shield);
        setPeakPoints(stats.peak_points);
      });
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
        // For a signed-in account this is a local-only, single-session
        // bump: ranked_stats (the real, server-side LP) is never written
        // from here, so it self-corrects back to the true value on the
        // next load. Streaks/claimed milestones aren't server-validated
        // at all yet (a separate, pre-existing gap from ranked LP
        // storage — matchmaking/settlement never read this number, so it
        // can't be used to cheat a match), so this stays real for guests
        // and cosmetic-only for accounts until that's addressed too.
        if (bonusLp > 0) setRankedPoints((p) => p + bonusLp);
        setNewlyEarnedRewards(newlyEarned);
        return;
      }
    }
    setClaimedMilestones(prevClaimed);
    setUnlockedAvatars(prevAvatars);
  }, []);

  const { syncStatus } = useProgressSync({
    userId: user?.id ?? null,
    state: progressSnapshot,
    onHydrate,
  });

  function resetProgress() {
    setWorldsState(freshWorlds());
    setSideQuestsState(freshSideQuests());
    setRankedPoints(0);
    setRankedWins(0);
    setRankedLosses(0);
    setRankedShield(0);
    setPeakPoints(0);
    setContinueWorldId(null);
    setLoginDates([]);
    setClaimedMilestones([]);
    setUnlockedAvatars(BASE_AVATARS);
    setNewlyEarnedRewards([]);
    setSelectedCharacterId(CHARACTERS[0].id);
    setOnboardingComplete(false);
    setOnboardingAnswers(null);
  }

  function enterWorld(worldId) {
    setActiveWorldId(worldId);
    setContinueWorldId(worldId);
  }

  // A plain, human-readable snapshot for Settings' "Export My Data" button
  // (data portability) — deliberately NOT the compact packed format used
  // for actual cloud sync (packWorlds/packSideQuests), since this is meant
  // to be opened and read by the person who downloaded it, not re-imported.
  function exportData() {
    return {
      exportedAt: new Date().toISOString(),
      account: user ? { email: user.email } : { guest: true },
      profile,
      streak,
      ranked: { points: rankedPoints, peakPoints, wins: rankedWins, losses: rankedLosses },
      learningProgress: worldsState.map((w) => ({
        world: w.name,
        completedLevels: w.levels.filter((l) => l.status === "completed").length,
        totalLevels: w.levels.length,
      })),
      sideQuestProgress: sideQuestsState.map((q) => ({
        quest: q.name,
        completedLessons: q.lessons.filter((l) => l.status === "completed").length,
        totalLessons: q.lessons.length,
      })),
    };
  }

  // Switching to a different mode/tab (whether via the bottom nav or an
  // in-screen "back" link) always resets whichever nested screen was open
  // within the mode being left — which world/lesson/match was active — the
  // same way its own back button already did. Real progress is saved
  // separately (worldsState/sideQuestsState) and is never touched here.
  function switchMode(nextMode) {
    setActiveWorldId(null);
    setActiveLevel(null);
    setActiveSideQuestId(null);
    setActiveSideQuestLesson(null);
    setRankedMode(null);
    setRankedMatchId(null);
    setRankedPracticing(false);
    setMode(nextMode);
  }

  function backToModes() {
    switchMode(null);
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

  // Ranked PvP always requires a signed-in account (see RankedHome's
  // guest gate), so `user` is always real here. The real new LP/shield/
  // wins/losses already exist server-side by the time this fires (the
  // match settled before RankedMatchRunner ever calls onSettled) — this
  // just fetches them and, for the celebration screen, compares the old
  // total (still held in state) against the new one via describeRankChange,
  // which only describes a movement already decided server-side rather
  // than computing one.
  async function handleFinishRankedMode(pointsDelta) {
    const before = rankedPoints;
    const hadShield = rankedShield > 0;
    const stats = await fetchRankedStats(user?.id);
    if (stats) {
      setRankedPoints(stats.points);
      setRankedWins(stats.wins);
      setRankedLosses(stats.losses);
      setRankedShield(stats.shield);
      setPeakPoints(stats.peak_points);
      setRankChange(describeRankChange(before, stats.points, pointsDelta, hadShield));
    }
    setRankedMode(null);
    setRankedMatchId(null);
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

  // Side Quests and Ranked Mode's skill gate (see data/skillGate.js) is
  // deliberately measured only against Learning Mode — never side-quest
  // lessons themselves — so it can't be circularly unlocked by the very
  // thing it's gating.
  const mainLessonsCompleted = useMemo(
    () => worldsState.flatMap((w) => w.levels).filter((l) => l.status === "completed").length,
    [worldsState],
  );

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

  // From Practice Problems' "review this skill" button — jumps straight
  // into that World's level map, same pattern as handleContinueLearning.
  // Only ever called for an already-unlocked world (PracticeProblems only
  // renders the button in that case), so this never bypasses the normal
  // strictly-in-order world progression.
  function reviewWorld(worldId) {
    setMode("learning");
    enterWorld(worldId);
  }

  let screen;
  // The bottom nav is the app's persistent, primary way to switch modes,
  // so it stays visible everywhere except a focused activity someone has
  // actually committed to (playing a lesson, mid-shuffle, or mid-match) —
  // same idea as a mobile app hiding its tab bar during full-screen
  // gameplay. Defaults hidden; each branch below opts back in.
  let hideBottomNav = true;

  if (onboardingComplete === null) {
    // Hydration hasn't resolved yet — stay quiet rather than flash the
    // wizard at a returning user whose answer is already saved.
    screen = <div className="app-loading" aria-label="Loading">🎮</div>;
  } else if (!onboardingComplete) {
    screen = (
      <Onboarding
        onComplete={(answers) => {
          if (answers.language) setLanguage(answers.language);
          setOnboardingAnswers(answers);
          setOnboardingComplete(true);
          // Someone who says they're not a total beginner starts further
          // into the 100-world path instead of at World 1 — see
          // data/onboarding.js for exactly which world per level.
          setWorldsState((prev) => applyHeadStart(prev, answers.level));
          setContinueWorldId(getHeadStartWorldId(answers.level));
        }}
      />
    );
  } else if (!mode) {
    hideBottomNav = false;
    screen = (
      <ModeSelect
        profile={profile}
        streak={streak}
        overallProgress={overallProgress}
        continueWorld={continueWorld}
        onContinueLearning={handleContinueLearning}
        onOpenSettings={() => switchMode("settings")}
        onOpenCalendar={() => switchMode("calendar")}
        onOpenHelper={() => switchMode("helper")}
      />
    );
  } else if (mode === "helper") {
    screen = (
      <CodeHelper defaultLanguage={language ?? "javascript"} onBack={backToModes} />
    );
  } else if (mode === "characters") {
    hideBottomNav = false;
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
        reducedMotion={reducedMotion}
        onChangeReducedMotion={setReducedMotion}
        codingLanguage={language}
        onChangeCodingLanguage={setLanguage}
        unlockedAvatars={unlockedAvatars}
        mainLessonsCompleted={mainLessonsCompleted}
        streak={streak}
        sideQuestsState={sideQuestsState}
        rankedWins={rankedWins}
        rankedLosses={rankedLosses}
        rankedShield={rankedShield}
        onBack={backToModes}
        onResetProgress={resetProgress}
        onExportData={exportData}
        syncStatus={syncStatus}
      />
    );
  } else if (mode === "learning") {
    const activeWorld = worldsState.find((w) => w.id === activeWorldId);

    if (!language) {
      hideBottomNav = false;
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
      hideBottomNav = false;
      screen = (
        <LevelMap
          world={activeWorld}
          onSelectLevel={setActiveLevel}
          onBack={() => setActiveWorldId(null)}
        />
      );
    } else {
      hideBottomNav = false;
      screen = (
        <WorldMap
          worlds={worldsState}
          language={language}
          onChangeLanguage={() => setLanguage(null)}
          onSelectWorld={enterWorld}
          onOpenPractice={() => switchMode("practice")}
          onBack={backToModes}
        />
      );
    }
  } else if (mode === "practice") {
    screen = (
      <PracticeProblems
        worldsState={worldsState}
        mainLessonsCompleted={mainLessonsCompleted}
        onReviewWorld={reviewWorld}
        onGoToLearning={() => switchMode("learning")}
        onBack={backToModes}
      />
    );
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
      hideBottomNav = false;
      screen = (
        <SideQuestPath
          quest={activeQuest}
          onSelectLesson={setActiveSideQuestLesson}
          onBack={() => setActiveSideQuestId(null)}
        />
      );
    } else {
      hideBottomNav = false;
      screen = (
        <SideQuestMap
          sidequests={sideQuestsState}
          mainLessonsCompleted={mainLessonsCompleted}
          onGoToLearning={() => switchMode("learning")}
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
    } else if (rankedMode && rankedPracticing) {
      // Explicit opt-out offered after a while in queue: solo play, no
      // rank change — see RankedPracticeRunner.jsx.
      screen = (
        <RankedPracticeRunner
          modeId={rankedMode}
          character={selectedCharacter}
          language={toInstantLanguage(language ?? "javascript")}
          rankedPoints={rankedPoints}
          onExit={() => {
            setRankedMode(null);
            setRankedPracticing(false);
          }}
        />
      );
    } else if (rankedMode && !rankedMatchId) {
      // Real matchmaking: a mode's been picked, but no opponent yet.
      screen = (
        <RankedQueue
          modeId={rankedMode}
          displayName={profile.displayName}
          onMatched={setRankedMatchId}
          onPractice={() => setRankedPracticing(true)}
          onExit={() => setRankedMode(null)}
        />
      );
    } else if (rankedMode && rankedMatchId) {
      screen = (
        <RankedMatchRunner
          matchId={rankedMatchId}
          modeId={rankedMode}
          myUserId={user?.id}
          character={selectedCharacter}
          language={toInstantLanguage(language ?? "javascript")}
          onExit={() => {
            setRankedMode(null);
            setRankedMatchId(null);
          }}
          onSettled={handleFinishRankedMode}
        />
      );
    } else if (rankChange) {
      hideBottomNav = false;
      screen = <RankChange change={rankChange} onContinue={() => setRankChange(null)} />;
    } else {
      hideBottomNav = false;
      screen = (
        <RankedHome
          points={rankedPoints}
          shield={rankedShield}
          usesJsFallback={isCompiledLanguage(language)}
          peakPoints={peakPoints}
          wins={rankedWins}
          losses={rankedLosses}
          selectedCharacter={selectedCharacter}
          mainLessonsCompleted={mainLessonsCompleted}
          onPlay={() => setRankedMode("shuffle")}
          onOpenCharacters={() => switchMode("characters")}
          onGoToLearning={() => switchMode("learning")}
          onBack={backToModes}
        />
      );
    }
  }

  return (
    <>
      <div className={`app${hideBottomNav ? "" : " app--with-nav"}`}>
        <Suspense fallback={<div className="app-loading" aria-label="Loading">🎮</div>}>{screen}</Suspense>
      </div>
      {!hideBottomNav && (
        <BottomNav
          active={mode}
          onSelect={switchMode}
          lockedTabs={mainLessonsCompleted >= SKILL_GATE_LESSONS ? [] : ["sidequest", "ranked"]}
        />
      )}
    </>
  );
}

// Privacy/Terms live at #/privacy and #/terms so they can be linked to from
// anywhere (including the log-in screen) without a router.
function readLegalRoute() {
  const match = window.location.hash.match(/^#\/(privacy|terms)$/);
  return match ? match[1] : null;
}

export default function App() {
  const [legalPage, setLegalPage] = useState(readLegalRoute);

  useEffect(() => {
    const onHashChange = () => setLegalPage(readLegalRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (legalPage) {
    return (
      <div className="app">
        <Suspense fallback={<div className="app-loading" aria-label="Loading">🎮</div>}>
          <LegalPage page={legalPage} />
        </Suspense>
      </div>
    );
  }

  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  );
}

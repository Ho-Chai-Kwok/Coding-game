import { useState, useMemo, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import ModeSelect from "./components/ModeSelect";
import BottomNav from "./components/BottomNav";
import WorldMap from "./components/WorldMap";
import LevelMap from "./components/LevelMap";
import LevelScreen from "./components/LevelScreen";
import LanguageSelect from "./components/LanguageSelect";
import AuthGate from "./components/AuthGate";
import ParentLock from "./components/ParentLock";
import { useAuth } from "./auth/useAuth";
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
import { TOPIC_INTROS, hasSeenIntro, markIntroSeen } from "./data/topicIntros";
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
const KernelDash = lazy(() => import("./components/kernelDash/KernelDash"));
const TopicIntro = lazy(() => import("./components/topicIntro/TopicIntro"));
const LegalPage = lazy(() => import("./components/LegalPage"));
const Onboarding = lazy(() => import("./components/Onboarding"));

const DEFAULT_PROFILE = { displayName: "Coder", avatar: "🦊" };

function freshWorlds() {
  return structuredClone(worlds);
}

function freshSideQuests() {
  return structuredClone(sidequests);
}

// URL-synced navigation (see QA_REPORT.md CQ-04): the browser/Android Back
// button used to just leave the site entirely, because screen changes
// never touched history (mode was plain useState, nothing ever called
// pushState). These two pure functions are the translation layer between
// "the bit of state that decides what's on screen" and a hash string —
// hashForScreen going one way for every navigation, parseHash going the
// other way when a popstate (Back/Forward) fires. Ranked PvP collapses to
// a single opaque "#/ranked" entry rather than encoding shuffle/queue/
// match sub-states individually: a live match holds real realtime
// subscriptions that restoring from a bare URL on Back can't safely
// reconstruct, so CQ-04's fix (see below) intercepts Back during an
// active match with an in-app confirmation instead of ever trying to
// restore "the middle of a match" from a URL.
function hashForScreen({
  mode, activeWorldId, activeLevel, activeSideQuestId, activeSideQuestLesson, rankedMode,
}) {
  if (!mode) return "#/";
  if (mode === "learning") {
    if (activeWorldId && activeLevel) return `#/learn/w/${activeWorldId}/l/${activeLevel.id}`;
    if (activeWorldId) return `#/learn/w/${activeWorldId}`;
    return "#/learn";
  }
  if (mode === "sidequest") {
    if (activeSideQuestId && activeSideQuestLesson) return `#/quests/q/${activeSideQuestId}/l/${activeSideQuestLesson.id}`;
    if (activeSideQuestId) return `#/quests/q/${activeSideQuestId}`;
    return "#/quests";
  }
  if (["practice", "settings", "calendar", "characters", "helper", "kernelDash"].includes(mode)) {
    return `#/${mode === "kernelDash" ? "kernel-dash" : mode}`;
  }
  // Anything else is the ranked-PvP catch-all branch (rankedMode drives
  // which ranked screen shows, mode itself is just "not one of the above").
  void rankedMode;
  return "#/ranked";
}

// Parses a hash back into the subset of navigation state needed to
// restore that screen — used both for the initial deep-link-on-reload
// (CQ-04's "reloading on #/learn/w/1 reopens World 1") and for popstate.
// Needs the live worlds/sidequests lists to turn an id in the URL into
// the actual level/lesson object the screens expect, exactly like
// onSelectWorld/onSelectLevel already do from a click.
function parseHash(hash, worldsState, sideQuestsState) {
  if (hash === "#/" || hash === "" || hash === "#") return { mode: null };
  if (hash === "#/learn") return { mode: "learning" };
  if (hash === "#/quests") return { mode: "sidequest" };
  if (["#/practice", "#/settings", "#/calendar", "#/characters", "#/helper"].includes(hash)) {
    return { mode: hash.slice(2) };
  }
  if (hash === "#/kernel-dash") return { mode: "kernelDash" };
  if (hash === "#/ranked") return { mode: "ranked" };

  let m = hash.match(/^#\/learn\/w\/([^/]+)\/l\/([^/]+)$/);
  if (m) {
    const world = worldsState.find((w) => String(w.id) === m[1]);
    const level = world?.levels.find((l) => l.id === m[2]);
    if (world && level) return { mode: "learning", activeWorldId: world.id, activeLevel: level };
    return world ? { mode: "learning", activeWorldId: world.id } : { mode: "learning" };
  }
  m = hash.match(/^#\/learn\/w\/([^/]+)$/);
  if (m) {
    const world = worldsState.find((w) => String(w.id) === m[1]);
    return world ? { mode: "learning", activeWorldId: world.id } : { mode: "learning" };
  }
  m = hash.match(/^#\/quests\/q\/([^/]+)\/l\/([^/]+)$/);
  if (m) {
    const quest = sideQuestsState.find((q) => q.id === m[1]);
    const lesson = quest?.lessons.find((l) => l.id === m[2]);
    if (quest && lesson) return { mode: "sidequest", activeSideQuestId: quest.id, activeSideQuestLesson: lesson };
    return quest ? { mode: "sidequest", activeSideQuestId: quest.id } : { mode: "sidequest" };
  }
  m = hash.match(/^#\/quests\/q\/([^/]+)$/);
  if (m) {
    const quest = sideQuestsState.find((q) => q.id === m[1]);
    return quest ? { mode: "sidequest", activeSideQuestId: quest.id } : { mode: "sidequest" };
  }
  return null; // unrecognized hash (e.g. a Supabase #access_token=... fragment) - leave navigation state alone
}

function AppShell() {
  const { user } = useAuth();

  const [mode, setMode] = useState(null); // null | "learning" | "ranked" | "sidequest" | "settings"

  // Learning mode state
  const [worldsState, setWorldsState] = useState(freshWorlds);
  const [activeWorldId, setActiveWorldId] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [activeTopicIntro, setActiveTopicIntro] = useState(null); // null | { worldName, intro }
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
  const [textSize, setTextSize] = useState("default"); // "default" | "large" | "xl" — see QA_REPORT.md CQ-09
  const [parentLockEnabled, setParentLockEnabled] = useState(false); // CQ-21, off by default
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

  // CQ-09: scales every rem-based font size in the app from one root
  // setting — same data-attribute pattern as theme/reducedMotion above,
  // gated purely in CSS (see index.css) so this component doesn't need to
  // know which rule reads it.
  useEffect(() => {
    if (textSize === "default") {
      delete document.documentElement.dataset.textSize;
    } else {
      document.documentElement.dataset.textSize = textSize;
    }
  }, [textSize]);

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
      textSize,
      parentLockEnabled,
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
      textSize,
      parentLockEnabled,
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
      if (saved.textSize) setTextSize(saved.textSize);
      if (typeof saved.parentLockEnabled === "boolean") setParentLockEnabled(saved.parentLockEnabled);
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
    const world = worldsState.find((w) => w.id === worldId);
    const intro = world && TOPIC_INTROS[world.name];
    if (intro && !hasSeenIntro(world.name)) {
      setActiveTopicIntro({ worldName: world.name, intro });
    }
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

  // --- URL-synced navigation (CQ-04) ------------------------------------
  // Shown instead of silently losing a live ranked match when Back fires
  // mid-match — see the popstate handler below.
  const [showLeaveMatchConfirm, setShowLeaveMatchConfirm] = useState(false);
  // Guards against the hash-sync effect re-pushing a history entry for a
  // state change that *came from* a popstate (Back/Forward) in the first
  // place — without this, pressing Back would immediately push a
  // duplicate entry right back on, breaking Forward and effectively
  // undoing the Back press.
  const suppressNextPushRef = useRef(false);
  // Whether the very first hash (the URL this tab was actually opened or
  // reloaded with) has been applied yet — runs once, after onboarding
  // resolves, so a reload on e.g. #/learn/w/3 reopens World 3 instead of
  // bouncing to the home screen and silently dropping the URL.
  const appliedInitialHashRef = useRef(false);
  // The hash Back was actually trying to reach when it got intercepted by
  // the leave-match confirmation — applied directly (via replaceState, so
  // it can never itself trigger another popstate) if the player confirms.
  const pendingLeaveHashRef = useRef("#/");

  const currentHash = hashForScreen({ mode, activeWorldId, activeLevel, activeSideQuestId, activeSideQuestLesson, rankedMode });

  useEffect(() => {
    if (onboardingComplete !== true) return;
    if (!appliedInitialHashRef.current) {
      // First run after onboarding resolves: adopt whatever's already in
      // the address bar instead of overwriting it with "#/".
      appliedInitialHashRef.current = true;
      const initial = parseHash(window.location.hash, worldsState, sideQuestsState);
      if (initial && initial.mode) {
        suppressNextPushRef.current = true;
        if (initial.mode === "learning") {
          setMode("learning");
          if (initial.activeWorldId) setActiveWorldId(initial.activeWorldId);
          if (initial.activeLevel) setActiveLevel(initial.activeLevel);
        } else if (initial.mode === "sidequest") {
          setMode("sidequest");
          if (initial.activeSideQuestId) setActiveSideQuestId(initial.activeSideQuestId);
          if (initial.activeSideQuestLesson) setActiveSideQuestLesson(initial.activeSideQuestLesson);
        } else if (initial.mode === "ranked") {
          setMode("ranked");
        } else {
          setMode(initial.mode);
        }
        history.replaceState(null, "", hashForScreen({ mode: initial.mode, ...initial }));
        return;
      }
      // No usable hash (fresh visit) — establish "#/" as the first entry
      // so the very first Back press has somewhere real to land, instead
      // of leaving the site immediately.
      history.replaceState(null, "", "#/");
      return;
    }
    if (suppressNextPushRef.current) {
      suppressNextPushRef.current = false;
      return;
    }
    if (window.location.hash !== currentHash) {
      history.pushState(null, "", currentHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingComplete, mode, activeWorldId, activeLevel, activeSideQuestId, activeSideQuestLesson, rankedMode]);

  useEffect(() => {
    function onPopState() {
      // A live ranked match holds real matchmaking/realtime state that
      // can't be safely reconstructed from a URL — rather than silently
      // dropping the player out of it (or trying, riskily, to resume it),
      // ask first. Cancels the native back navigation by immediately
      // re-pushing the current hash; actually leaving happens only if
      // they confirm, via the overlay's own "Leave match" button below.
      if (rankedMatchId) {
        pendingLeaveHashRef.current = window.location.hash || "#/";
        history.pushState(null, "", currentHash);
        setShowLeaveMatchConfirm(true);
        return;
      }
      const next = parseHash(window.location.hash, worldsState, sideQuestsState);
      if (!next) return; // unrecognized fragment (e.g. a Supabase auth token) - don't touch navigation state
      suppressNextPushRef.current = true;
      setActiveWorldId(next.activeWorldId ?? null);
      setActiveLevel(next.activeLevel ?? null);
      setActiveSideQuestId(next.activeSideQuestId ?? null);
      setActiveSideQuestLesson(next.activeSideQuestLesson ?? null);
      if (next.mode !== "ranked") {
        setRankedMode(null);
        setRankedMatchId(null);
        setRankedPracticing(false);
      }
      setMode(next.mode);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [rankedMatchId, currentHash, worldsState, sideQuestsState]);

  function completeLevel(level) {
    // Found from the current (pre-update) world rather than reached-into
    // from inside the setWorldsState updater below: a level's identity at
    // a given stageNumber doesn't change just because this completion is
    // about to unlock it, so there's no need to depend on setState's
    // updater-timing to know what "next" is.
    const world = worldsState.find((w) => w.id === level.worldId);
    const nextLevel = world?.levels.find((l) => l.stageNumber === level.stageNumber + 1) ?? null;

    setWorldsState((prev) => {
      const next = structuredClone(prev);
      const w = next.find((w2) => w2.id === level.worldId);
      const lvl = w.levels.find((l) => l.id === level.id);
      lvl.status = "completed";

      if (nextLevel) {
        const nl = w.levels.find((l) => l.id === nextLevel.id);
        if (nl.status === "locked") nl.status = "unlocked";
      } else {
        const nextWorld = next.find((w2) => w2.id === w.id + 1);
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

    // Duolingo-style: go straight into the next lesson instead of
    // dropping back to the map after every single level. Only when a
    // level finishes the whole world (no next stage within it) does this
    // fall back to the map — jumping straight into a brand-new world's
    // first level with no "world complete" moment of its own would be a
    // jarring surprise, not a convenience, so that's still a deliberate
    // stop, not an oversight.
    setActiveLevel(nextLevel ? { ...nextLevel, status: "unlocked" } : null);
  }

  function completeSideQuestLesson(lesson) {
    const quest = sideQuestsState.find((q) => q.id === lesson.questId);
    const nextLesson = quest?.lessons.find((x) => x.lessonNumber === lesson.lessonNumber + 1) ?? null;

    setSideQuestsState((prev) => {
      const next = structuredClone(prev);
      const q = next.find((q2) => q2.id === lesson.questId);
      const l = q.lessons.find((x) => x.id === lesson.id);
      l.status = "completed";

      if (nextLesson) {
        const nl = q.lessons.find((x) => x.id === nextLesson.id);
        if (nl.status === "locked") nl.status = "unlocked";
      }

      return next;
    });

    // Same "continue straight into the next lesson" behavior as
    // completeLevel above — see its comment.
    setActiveSideQuestLesson(nextLesson ? { ...nextLesson, status: "unlocked" } : null);
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
        selectedCharacter={selectedCharacter}
        onContinueLearning={handleContinueLearning}
        onOpenSettings={() => switchMode("settings")}
        onOpenCalendar={() => switchMode("calendar")}
        onOpenHelper={() => switchMode("helper")}
        onOpenKernelDash={() => switchMode("kernelDash")}
      />
    );
  } else if (mode === "helper") {
    screen = (
      <CodeHelper defaultLanguage={language ?? "javascript"} onBack={backToModes} />
    );
  } else if (mode === "kernelDash") {
    screen = (
      <KernelDash character={selectedCharacter} onBack={backToModes} />
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
    // CQ-21: Settings (and Account, a section within it) sit behind the
    // optional parent lock when the parent has turned it on — see
    // ParentLock.jsx.
    screen = (
      <ParentLock enabled={parentLockEnabled} onBack={backToModes}>
        <Settings
          profile={profile}
          onChangeProfile={setProfile}
          theme={theme}
          onChangeTheme={setTheme}
          reducedMotion={reducedMotion}
          onChangeReducedMotion={setReducedMotion}
          textSize={textSize}
          onChangeTextSize={setTextSize}
          parentLockEnabled={parentLockEnabled}
          onChangeParentLockEnabled={setParentLockEnabled}
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
      </ParentLock>
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
          key={activeLevel.id}
          level={activeLevel}
          language={language}
          onBack={() => setActiveLevel(null)}
          onCompleteLevel={completeLevel}
          character={selectedCharacter}
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
          selectedCharacter={selectedCharacter}
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
          key={activeSideQuestLesson.id}
          level={activeSideQuestLesson}
          onBack={() => setActiveSideQuestLesson(null)}
          onCompleteLevel={completeSideQuestLesson}
          character={selectedCharacter}
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
          selectedCharacter={selectedCharacter}
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
      screen = (
        <RankChange
          change={rankChange}
          character={selectedCharacter}
          onContinue={() => setRankChange(null)}
        />
      );
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
      {/* CQ-10e: no <main> landmark existed anywhere — a screen-reader
          user had no "skip to main content" target at all. */}
      <main className={`app${hideBottomNav ? "" : " app--with-nav"}`}>
        <Suspense fallback={<div className="app-loading" aria-label="Loading">🎮</div>}>{screen}</Suspense>
      </main>
      {!hideBottomNav && (
        <BottomNav
          active={mode}
          onSelect={switchMode}
          lockedTabs={mainLessonsCompleted >= SKILL_GATE_LESSONS ? [] : ["sidequest", "ranked"]}
        />
      )}
      {activeTopicIntro && (
        <Suspense fallback={null}>
          <TopicIntro
            character={selectedCharacter}
            intro={activeTopicIntro.intro}
            onDone={() => {
              markIntroSeen(activeTopicIntro.worldName);
              setActiveTopicIntro(null);
            }}
          />
        </Suspense>
      )}
      {showLeaveMatchConfirm && (
        <div className="leave-match-confirm" role="alertdialog" aria-modal="true" aria-labelledby="leave-match-title">
          <div className="leave-match-confirm__card">
            <p id="leave-match-title" className="leave-match-confirm__title">Leave this match?</p>
            <p className="leave-match-confirm__body">
              You're still in a ranked match. Going back now will leave it.
            </p>
            <div className="leave-match-confirm__actions">
              <button
                type="button"
                className="leave-match-confirm__stay"
                onClick={() => setShowLeaveMatchConfirm(false)}
              >
                Stay in match
              </button>
              <button
                type="button"
                className="leave-match-confirm__leave"
                onClick={() => {
                  setShowLeaveMatchConfirm(false);
                  setRankedMode(null);
                  setRankedMatchId(null);
                  setRankedPracticing(false);
                  // Apply the destination directly instead of calling
                  // history.back() — that would fire a second popstate,
                  // racing this same click handler's (still in-flight)
                  // state updates and risking the confirmation re-firing
                  // on a stale closure. replaceState never triggers
                  // popstate, so there's nothing to race.
                  const dest = parseHash(pendingLeaveHashRef.current, worldsState, sideQuestsState) ?? { mode: null };
                  suppressNextPushRef.current = true;
                  setActiveWorldId(dest.activeWorldId ?? null);
                  setActiveLevel(dest.activeLevel ?? null);
                  setActiveSideQuestId(dest.activeSideQuestId ?? null);
                  setActiveSideQuestLesson(dest.activeSideQuestLesson ?? null);
                  setMode(dest.mode);
                  history.replaceState(null, "", hashForScreen({ mode: dest.mode, ...dest }));
                }}
              >
                Leave match
              </button>
            </div>
          </div>
        </div>
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

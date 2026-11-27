import { useCallback, useEffect, useRef, useState } from "react";
import ByteBornSprite from "../byteborn/ByteBornSprite";
import { useI18n } from "../../i18n/useI18n";
import {
  LANE_COUNT,
  TRACK_LENGTH,
  JUMP_MS,
  DUCK_MS,
  HIT_WINDOW,
  SCORE_PER_PX,
  COLLECTIBLE_SCORE,
  HAZARD_TYPES,
  COLLECTIBLE_TYPES,
  FIRST_FLASH_QUESTION_MS,
  FLASH_QUESTION_INTERVAL_MS,
  FLASH_QUESTION_TIME_MS,
  FLASH_QUESTION_BONUS,
  speedAt,
  spawnIntervalAt,
  spawnObstacle,
  clearsHazard,
  flashQuestionLevelAt,
  buildFlashQuestion,
} from "../../data/kernelDashEngine";
import { getQuestionPool } from "../../data/rankedQuestionBank";
import "./kernelDash.css";

const BEST_KEY = "codequest-kernel-dash-best";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Private browsing or storage full — the run still happened, it just
    // won't be remembered as a new best next time.
  }
}

const ICON = { bug: "🐛", error: "⚠️", wall: "🧱", semicolon: ";", brace: "{ }" };

// Kernel Dash — a leisure mode, not a lesson: your Byteborn dashes through
// the Kernel, dodging code-themed hazards in 3 lanes. Jump bugs, duck
// error banners, switch lanes around walls, grab syntax bits for bonus
// points. Speed and spawn rate both climb the longer you survive (see
// data/kernelDashEngine.js for every tunable number). Entirely original —
// genre only, not any specific game's characters or art.
export default function KernelDash({ character, onBack }) {
  const { t } = useI18n();
  const [status, setStatus] = useState("ready"); // "ready" | "playing" | "over"
  // CQ-17: a slower, more reaction-time-friendly speed for younger or
  // older players — chosen on the ready screen, kept for "Play again" too
  // (not reset per run) since someone who picked it once almost always
  // wants it again.
  const [easyMode, setEasyMode] = useState(false);
  const [lane, setLane] = useState(1);
  const [action, setAction] = useState(null); // null | "jump" | "duck"
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [isNewBest, setIsNewBest] = useState(false);
  // null while no flash question is up; otherwise { topic, text,
  // explanation, lanes: [{lane, text, isCorrect}] } from buildFlashQuestion.
  const [flashQuestion, setFlashQuestion] = useState(null);
  const [flashTimeLeft, setFlashTimeLeft] = useState(0);
  const [flashFeedback, setFlashFeedback] = useState(null); // null | "correct" | "wrong"

  const laneRef = useRef(lane);
  const actionRef = useRef(action);
  const statusRef = useRef(status);
  const easyModeRef = useRef(easyMode);
  const rafRef = useRef(null);
  const actionTimerRef = useRef(null);
  const lastFrameRef = useRef(0);
  const elapsedRef = useRef(0);
  const nextSpawnInRef = useRef(0);
  const scoreRef = useRef(0);
  const flashQuestionRef = useRef(null);
  const nextFlashInRef = useRef(0);
  const flashTimeLeftRef = useRef(0);
  // The game loop's real source of truth — `obstacles` state exists only
  // to get this list onto the screen, never read back inside the loop
  // itself (reading from a just-called setState updater to decide whether
  // to end the run is the kind of thing that's easy to get subtly wrong;
  // a plain ref read is not).
  const obstaclesRef = useRef([]);

  laneRef.current = lane;
  actionRef.current = action;
  statusRef.current = status;
  easyModeRef.current = easyMode;

  const endRun = useCallback(() => {
    if (statusRef.current !== "playing") return;
    statusRef.current = "over";
    cancelAnimationFrame(rafRef.current);
    // Clear the track immediately — whatever was still in flight (the
    // thing you hit, anything else mid-fall) has no reason to keep
    // sitting there behind the result overlay.
    obstaclesRef.current = [];
    setObstacles([]);
    const finalScore = Math.round(scoreRef.current);
    const newBest = finalScore > readBest();
    if (newBest) writeBest(finalScore);
    setBest(newBest ? finalScore : readBest());
    setIsNewBest(newBest);
    setScore(finalScore);
    setStatus("over");
  }, []);

  // Resolves the current flash question against whatever lane the player
  // is standing in right now — called either when the countdown hits zero
  // or (for a snappier feel) the instant the player's own action makes
  // the answer obviously locked in. Right: a score bonus and the run
  // continues. Wrong: same stakes as hitting a hazard — the run ends.
  const resolveFlashQuestion = useCallback(() => {
    const q = flashQuestionRef.current;
    if (!q) return;
    const picked = q.lanes.find((l) => l.lane === laneRef.current);
    const correct = Boolean(picked?.isCorrect);
    flashQuestionRef.current = null;
    setFlashQuestion(null);
    if (correct) {
      scoreRef.current += FLASH_QUESTION_BONUS;
      setFlashFeedback("correct");
      setTimeout(() => setFlashFeedback(null), 700);
      nextFlashInRef.current = FLASH_QUESTION_INTERVAL_MS;
    } else {
      setFlashFeedback("wrong");
      endRun();
    }
  }, [endRun]);

  const tick = useCallback(
    (now) => {
      if (statusRef.current !== "playing") return;
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000); // clamp so a tab-switch stall can't skip a mile of track
      lastFrameRef.current = now;
      elapsedRef.current += dt;
      const speed = speedAt(elapsedRef.current, easyModeRef.current);
      const travel = speed * dt;

      scoreRef.current += travel * SCORE_PER_PX;

      // Flash question: either count down an active one, or check whether
      // it's time to trigger the next one.
      if (flashQuestionRef.current) {
        flashTimeLeftRef.current -= dt * 1000;
        setFlashTimeLeft(Math.max(0, flashTimeLeftRef.current));
        if (flashTimeLeftRef.current <= 0) {
          resolveFlashQuestion();
          if (statusRef.current !== "playing") return; // a wrong answer just ended the run
        }
      } else {
        nextFlashInRef.current -= dt * 1000;
        if (nextFlashInRef.current <= 0) {
          const level = flashQuestionLevelAt(elapsedRef.current);
          const pool = getQuestionPool(level);
          const raw = pool[Math.floor(Math.random() * pool.length)];
          const built = buildFlashQuestion(raw);
          flashQuestionRef.current = built;
          flashTimeLeftRef.current = FLASH_QUESTION_TIME_MS;
          setFlashQuestion(built);
          setFlashTimeLeft(FLASH_QUESTION_TIME_MS);
        }
      }

      nextSpawnInRef.current -= dt * 1000;

      let list = obstaclesRef.current;
      if (nextSpawnInRef.current <= 0) {
        nextSpawnInRef.current = spawnIntervalAt(elapsedRef.current, easyModeRef.current);
        list = [...list, spawnObstacle(Boolean(flashQuestionRef.current))];
      }

      let collided = false;
      const kept = [];
      for (const o of list) {
        const distance = o.distance + travel;
        const inHitWindow = distance >= TRACK_LENGTH - HIT_WINDOW && distance <= TRACK_LENGTH + HIT_WINDOW;
        const sameLane = o.lane === laneRef.current;

        // Only the first frame an obstacle spends in the hit window (per
        // lane match) actually scores/collides — `resolved` stops every
        // later frame in that same window from re-triggering it.
        if (!o.resolved && inHitWindow && sameLane) {
          if (HAZARD_TYPES.has(o.type)) {
            if (!clearsHazard(o.type, actionRef.current)) collided = true;
          } else if (COLLECTIBLE_TYPES.has(o.type)) {
            scoreRef.current += COLLECTIBLE_SCORE[o.type] ?? 0;
          }
        }

        if (distance < TRACK_LENGTH + HIT_WINDOW + 40) {
          kept.push({ ...o, distance, resolved: o.resolved || (inHitWindow && sameLane) });
        }
        // else: fully past the player and off the bottom — drop it.
      }

      obstaclesRef.current = kept;
      setObstacles(kept);
      setScore(Math.round(scoreRef.current));

      if (collided) {
        endRun();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [endRun, resolveFlashQuestion],
  );

  function startRun() {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(actionTimerRef.current);
    obstaclesRef.current = [];
    setObstacles([]);
    setLane(1);
    setAction(null);
    setScore(0);
    setIsNewBest(false);
    elapsedRef.current = 0;
    scoreRef.current = 0;
    nextSpawnInRef.current = spawnIntervalAt(0, easyModeRef.current);
    flashQuestionRef.current = null;
    nextFlashInRef.current = FIRST_FLASH_QUESTION_MS;
    flashTimeLeftRef.current = 0;
    setFlashQuestion(null);
    setFlashTimeLeft(0);
    setFlashFeedback(null);
    laneRef.current = 1;
    actionRef.current = null;
    statusRef.current = "playing";
    setStatus("playing");
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }

  function doJump() {
    if (statusRef.current !== "playing" || actionRef.current) return;
    actionRef.current = "jump";
    setAction("jump");
    clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      actionRef.current = null;
      setAction(null);
    }, JUMP_MS);
  }

  function doDuck() {
    if (statusRef.current !== "playing" || actionRef.current) return;
    actionRef.current = "duck";
    setAction("duck");
    clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      actionRef.current = null;
      setAction(null);
    }, DUCK_MS);
  }

  function changeLane(delta) {
    if (statusRef.current !== "playing") return;
    const next = Math.max(0, Math.min(LANE_COUNT - 1, laneRef.current + delta));
    laneRef.current = next;
    setLane(next);
  }

  // Keyboard controls.
  useEffect(() => {
    function handleKey(e) {
      if (statusRef.current === "ready" && (e.key === " " || e.key === "Enter")) {
        startRun();
        return;
      }
      if (["ArrowUp", "w", "W"].includes(e.key)) doJump();
      else if (["ArrowDown", "s", "S"].includes(e.key)) doDuck();
      else if (["ArrowLeft", "a", "A"].includes(e.key)) changeLane(-1);
      else if (["ArrowRight", "d", "D"].includes(e.key)) changeLane(1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swipe controls (touch).
  const touchStart = useRef(null);
  function handleTouchStart(e) {
    const t0 = e.changedTouches[0];
    touchStart.current = { x: t0.clientX, y: t0.clientY };
    if (statusRef.current === "ready") startRun();
  }
  function handleTouchEnd(e) {
    if (!touchStart.current) return;
    const t0 = e.changedTouches[0];
    const dx = t0.clientX - touchStart.current.x;
    const dy = t0.clientY - touchStart.current.y;
    touchStart.current = null;
    const SWIPE_MIN = 24;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      changeLane(dx > 0 ? 1 : -1);
    } else if (dy < 0) {
      doJump();
    } else {
      doDuck();
    }
  }

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(actionTimerRef.current);
  }, []);

  const runState = status === "over" ? (isNewBest ? "win" : "lose") : action === "jump" ? "hype" : "idle";

  return (
    <div className="kernel-dash">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>

      <div className="kernel-dash__hud">
        <span className="kernel-dash__score">{t("kernelDash.score")}: {score}</span>
        <span className="kernel-dash__best">{t("kernelDash.best")}: {best}</span>
      </div>

      <div
        className="kernel-dash__track"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="kernel-dash__lane kernel-dash__lane--0" />
        <div className="kernel-dash__lane kernel-dash__lane--1" />
        <div className="kernel-dash__lane kernel-dash__lane--2" />

        {obstacles.map((o) => (
          <div
            key={o.id}
            className={`kernel-dash__obstacle kernel-dash__obstacle--${o.type}`}
            // A plain `top: N%` makes a freshly-spawned obstacle (distance 0)
            // appear already straddling the track's own top edge — half of
            // it clipped off by `overflow: hidden` the instant it exists,
            // which reads as a glitch, not an entrance. Subtracting a fixed
            // pixel offset shifts the whole path up by a constant amount
            // instead of a percentage of it, so distance 0 sits comfortably
            // above the visible area (a clean off-screen spawn) and full
            // distance lands just above the player's own row — bottom:14px
            // in CSS — rather than exactly on the track's bottom edge.
            style={{ "--lane": o.lane, top: `calc(${Math.min(100, (o.distance / TRACK_LENGTH) * 100)}% - 40px)` }}
          >
            {ICON[o.type]}
          </div>
        ))}

        <div
          className={`kernel-dash__player${action ? ` kernel-dash__player--${action}` : ""}${flashFeedback ? ` kernel-dash__player--${flashFeedback}` : ""}`}
          style={{ "--lane": lane }}
        >
          <ByteBornSprite id={character.id} state={runState} label={character.name} />
        </div>

        {flashQuestion && (
          <div className="kernel-dash__flash" role="alert">
            <div className="kernel-dash__flash-bar">
              <div
                className="kernel-dash__flash-bar-fill"
                style={{ width: `${(flashTimeLeft / FLASH_QUESTION_TIME_MS) * 100}%` }}
              />
            </div>
            <p className="kernel-dash__flash-question">{flashQuestion.text}</p>
            <div className="kernel-dash__flash-lanes">
              {flashQuestion.lanes
                .slice()
                .sort((a, b) => a.lane - b.lane)
                .map((l) => (
                  <span
                    key={l.lane}
                    className={`kernel-dash__flash-lane${l.lane === lane ? " kernel-dash__flash-lane--active" : ""}`}
                    style={{ "--lane": l.lane }}
                  >
                    {l.text}
                  </span>
                ))}
            </div>
          </div>
        )}

        {status === "ready" && (
          <div className="kernel-dash__overlay">
            <h2>{t("kernelDash.title")}</h2>
            <p>{t("kernelDash.subtitle")}</p>
            <p className="kernel-dash__controls-hint">{t("kernelDash.controlsHint")}</p>
            {/* CQ-17: a slower speed for younger/older players, or anyone
                who just wants an easier run. */}
            <label className="kernel-dash__easy-toggle">
              <input
                type="checkbox"
                checked={easyMode}
                onChange={(e) => setEasyMode(e.target.checked)}
              />
              {t("kernelDash.easyMode")}
            </label>
            <button className="kernel-dash__start" onClick={startRun}>
              {t("kernelDash.start")}
            </button>
          </div>
        )}

        {status === "over" && (
          <div className="kernel-dash__overlay">
            <h2>{isNewBest ? t("kernelDash.newBest") : t("kernelDash.gameOver")}</h2>
            <p className="kernel-dash__final-score">{score}</p>
            <p className="kernel-dash__best-line">{t("kernelDash.best")}: {best}</p>
            <div className="kernel-dash__overlay-actions">
              <button className="kernel-dash__start" onClick={startRun}>
                {t("kernelDash.playAgain")}
              </button>
              <button className="kernel-dash__secondary" onClick={onBack}>
                {t("backToModes")}
              </button>
            </div>
          </div>
        )}
      </div>

      {status === "playing" && (
        <div className="kernel-dash__touch-controls">
          <button onClick={() => changeLane(-1)} aria-label={t("kernelDash.left")}>◀</button>
          <button onClick={doJump} aria-label={t("kernelDash.jump")}>▲</button>
          <button onClick={doDuck} aria-label={t("kernelDash.duck")}>▼</button>
          <button onClick={() => changeLane(1)} aria-label={t("kernelDash.right")}>▶</button>
        </div>
      )}
    </div>
  );
}

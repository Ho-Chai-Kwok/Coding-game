import { useCallback, useEffect, useRef, useState } from "react";

// Turns challenge events into the buddy's mood (see BuddyCoach.jsx).
const SETTLE_MS = { thinking: 2200, wrong: 2600, step: 1500 };
const SETTLE_TO = { thinking: "idle", wrong: "retry", step: "idle" };

export function useBuddy() {
  const [mood, setMood] = useState({ kind: "greet", beat: 0 });
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const feedback = useCallback((kind) => {
    clearTimeout(timer.current);
    setMood((m) => {
      // Typing again keeps the same line instead of re-rolling on every key.
      if (kind === "thinking" && (m.kind === "thinking" || m.kind === "running")) return m;
      // After a solve, a stray keystroke shouldn't cancel the celebration.
      if (kind === "thinking" && m.kind === "correct") return m;
      return { kind, beat: m.beat + 1 };
    });
    if (SETTLE_MS[kind]) {
      timer.current = setTimeout(() => {
        setMood((m) => (m.kind === kind ? { kind: SETTLE_TO[kind], beat: m.beat + 1 } : m));
      }, SETTLE_MS[kind]);
    }
  }, []);

  return [mood, feedback];
}

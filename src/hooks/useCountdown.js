import { useState, useEffect, useRef, useCallback } from "react";

// A simple 1-second-tick countdown used by every timed ranked mode.
// onExpire fires once, the moment the clock hits zero.
export function useCountdown(initialSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(true);
  const onExpireRef = useRef(onExpire);

  // Ref writes belong in an effect, not during render (CQ-20) — render
  // should stay a pure read. `onExpire` can be a fresh closure every
  // render (most callers won't bother memoizing it); this still only
  // ever calls whichever one was current when the clock actually hits 0.
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // "expired" is fully determined by secondsLeft — deriving it during
  // render instead of mirroring it into its own state via an effect
  // (CQ-20) means there's no separate update to schedule, and no risk of
  // the two ever disagreeing.
  const expired = secondsLeft <= 0;
  const isRunning = running && !expired;

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [isRunning]);

  // Fires exactly once per expiry: this effect only re-runs when
  // `expired` itself flips, not on every render.
  useEffect(() => {
    if (expired) onExpireRef.current?.();
  }, [expired]);

  const reset = useCallback((seconds, start = true) => {
    setSecondsLeft(seconds);
    setRunning(start);
  }, []);

  const stop = useCallback(() => setRunning(false), []);
  const addSeconds = useCallback((n) => setSecondsLeft((s) => Math.max(0, s + n)), []);

  return { secondsLeft, running: isRunning, reset, stop, addSeconds };
}

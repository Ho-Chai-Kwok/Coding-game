import { useState, useEffect, useRef, useCallback } from "react";

// A simple 1-second-tick countdown used by every timed ranked mode.
// onExpire fires once, the moment the clock hits zero.
export function useCountdown(initialSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(true);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      onExpireRef.current?.();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, secondsLeft]);

  const reset = useCallback((seconds, start = true) => {
    setSecondsLeft(seconds);
    setRunning(start);
  }, []);

  const stop = useCallback(() => setRunning(false), []);
  const addSeconds = useCallback((n) => setSecondsLeft((s) => Math.max(0, s + n)), []);

  return { secondsLeft, running, reset, stop, addSeconds };
}

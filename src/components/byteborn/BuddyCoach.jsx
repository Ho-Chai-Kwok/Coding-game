import { useEffect, useRef, useState } from "react";
import ByteBornSprite from "./ByteBornSprite";

// The player's selected Byteborn, sitting in on the lesson — no text, no
// speech bubble, no open/close panel. It does two things:
//
//   1. Reacts on its own to real events (typing, running, right/wrong —
//      see useBuddy.js), the same as before, just without ever saying
//      anything out loud.
//   2. Reacts to being tapped, any time, with one extra reaction picked
//      from a pool flavored to that character's own personality (see
//      CUTE_TAPS/COOL_TAPS below and `personality` in data/characters.js)
//      — a little toy, independent of how the lesson is actually going.
//
// Tap reactions deliberately never draw from win/lose/perfect/streak/
// rankUp/rankDown/shielded (those mean something real elsewhere — an
// actual match result or rank change) or correct/wrong (already means
// "you got this one right/wrong" via the real mood below) — so an
// idle tap can never be mistaken for real feedback about anything.
const SPRITE_STATE = {
  idle: "idle",
  greet: "idle",
  retry: "idle",
  thinking: "thinking",
  running: "thinking",
  correct: "correct",
  step: "correct",
  wrong: "wrong",
};

const CUTE_TAPS = ["greet", "laughing", "surprised", "sleepy", "cheer", "hype"];
const COOL_TAPS = ["determined", "confused", "waiting", "thinking", "idle"];
const TAP_HOLD_MS = 1600;

export default function BuddyCoach({ character, mood }) {
  const [tapState, setTapState] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handlePress() {
    const pool = character.personality === "cool" ? COOL_TAPS : CUTE_TAPS;
    const next = pool[Math.floor(Math.random() * pool.length)];
    clearTimeout(timer.current);
    setTapState(next);
    timer.current = setTimeout(() => setTapState(null), TAP_HOLD_MS);
  }

  const state = tapState ?? SPRITE_STATE[mood.kind] ?? "idle";

  return (
    <button
      type="button"
      className="buddy"
      style={{ "--buddy-color": character.color }}
      onClick={handlePress}
      aria-label={character.name}
    >
      <span className="buddy__sprite">
        <ByteBornSprite id={character.id} state={state} label={character.name} />
      </span>
    </button>
  );
}

import { useState } from "react";
import ByteBornSprite from "./ByteBornSprite";
import { useI18n } from "../../i18n/I18nContext";

// Duolingo-style lesson buddy: the player's selected Byteborn stands beside
// the lesson and reacts to what they do. Challenges report events through
// `onFeedback` and this hook turns them into a sprite state + speech line:
//
//   "thinking" (typing)  -> thinking pose, falls back to idle after a pause
//   "running"            -> thinking pose until the result comes in
//   "correct"            -> cheer, stays until the player moves on
//   "wrong"              -> wince, then back to idle with a "try again" line
//   "step"               -> quick cheer for a finished terminal step
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

// Closed (a small tap-to-open bubble) by default, rather than a sticky bar
// sitting over the lesson the whole time — opening it is a deliberate
// choice, not something forced on every player. It's a fresh choice each
// lesson, too: LevelScreen mounts a new BuddyCoach per level (keyed by
// level id), so this `open` state naturally resets to closed on its own
// every time a new lesson starts, with no extra reset code needed here.
export default function BuddyCoach({ character, mood }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // While closed, remember whether the mood has moved on since the player
  // last saw it, so the closed bubble can gently flag "something changed"
  // (e.g. you got one wrong) without forcing the panel open for them.
  // Updated from the click that opens the panel (the event that causes
  // it), not from an effect reacting to `open` — nothing to synchronize
  // with an external system here, just state driven by a click.
  const [seenBeat, setSeenBeat] = useState(mood.beat);
  const hasUnseen = !open && mood.beat !== seenBeat;

  function handleOpen() {
    setOpen(true);
    setSeenBeat(mood.beat);
  }

  const raw = t(`buddy.${mood.kind}`);
  const lines = Array.isArray(raw) ? raw : [raw];
  const line = String(lines[mood.beat % lines.length] ?? "").replace("{name}", character.name);
  const state = SPRITE_STATE[mood.kind] ?? "idle";

  if (!open) {
    return (
      <button
        type="button"
        className={`buddy-toggle${hasUnseen ? " buddy-toggle--unseen" : ""}`}
        style={{ "--buddy-color": character.color }}
        onClick={handleOpen}
      >
        <span className="buddy-toggle__sprite">
          <ByteBornSprite id={character.id} state={state} showFx={false} label={character.name} />
        </span>
        <span className="buddy-toggle__label">{character.name}</span>
      </button>
    );
  }

  return (
    <div className={`buddy buddy--${state}`} style={{ "--buddy-color": character.color }}>
      <button type="button" className="buddy__close" onClick={() => setOpen(false)} aria-label={t("buddy.close")}>
        ✕
      </button>
      <div className="buddy__sprite">
        <ByteBornSprite id={character.id} state={state} label={character.name} />
      </div>
      <div className="buddy__bubble" key={mood.beat} role="status" aria-live="polite">
        <span className="buddy__name">{character.name}</span>
        <p className="buddy__line">{line}</p>
      </div>
    </div>
  );
}

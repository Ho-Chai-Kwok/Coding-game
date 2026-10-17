import { useState, useRef, useCallback } from "react";
import CharacterRig from "./CharacterRig";
import { ALL_STATES } from "./byteborn/ByteBornSprite";
import { CHARACTERS, isCharacterUnlocked, unlockProgress, unlockHint } from "../data/characters";
import { useI18n } from "../i18n/useI18n";

// One emoji per state (see ALL_STATES / ByteBornSprite.jsx's own top
// comment for what each one actually looks like) — a little collectible
// strip under each unlocked character so the roster shows off the full
// range of reactions, not just the 3 it used to cycle through at random.
const STATE_EMOJI = {
  idle: "🙂",
  thinking: "🤔",
  correct: "✅",
  wrong: "❌",
  win: "🏆",
  lose: "💥",
  perfect: "👑",
  streak: "🔥",
  rankUp: "⬆️",
  rankDown: "⬇️",
  shielded: "🛡️",
  greet: "👋",
  hype: "🤩",
  waiting: "⏳",
  surprised: "😮",
  sleepy: "😴",
  laughing: "😂",
  confused: "❓",
  determined: "😤",
  cheer: "👏",
};

export default function CharacterRoster({
  unlockCtx,
  selectedCharacterId,
  onSelectCharacter,
  onBack,
}) {
  const { t } = useI18n();
  const [previewState, setPreviewState] = useState({});
  const timers = useRef({});

  // Hover/focus (desktop, keyboard) switches the preview instantly and
  // reverts the moment it's no longer hovered/focused — no timer needed,
  // the pointer leaving IS the signal. Touch devices have no hover, so a
  // tap uses the same `preview` fallback as before: show it, then settle
  // back to idle on its own after a moment.
  const setState = useCallback((id, state) => {
    clearTimeout(timers.current[id]);
    setPreviewState((prev) => ({ ...prev, [id]: state }));
  }, []);

  const preview = useCallback((id, state) => {
    setState(id, state);
    timers.current[id] = setTimeout(() => {
      setPreviewState((prev) => ({ ...prev, [id]: "idle" }));
    }, 1500);
  }, [setState]);

  const unlockedCount = CHARACTERS.filter((c) => isCharacterUnlocked(c, unlockCtx)).length;

  return (
    <div className="character-roster">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>

      <header className="character-roster__header">
        <h1>{t("characters.title")} 🎭</h1>
        <p className="character-roster__subtitle">{t("characters.subtitle")}</p>
        <p className="character-roster__count">
          {unlockedCount}/{CHARACTERS.length} {t("characters.unlockedCount")}
        </p>
      </header>

      <div className="character-roster__grid">
        {CHARACTERS.map((c) => {
          const unlocked = isCharacterUnlocked(c, unlockCtx);
          const selected = c.id === selectedCharacterId;
          const state = unlocked ? previewState[c.id] || "idle" : "idle";
          const progress = unlocked ? 1 : unlockProgress(c, unlockCtx);
          const hint = unlockHint(c);

          return (
            <div
              key={c.id}
              className={`character-card character-card--${c.tier.toLowerCase()}${
                unlocked ? "" : " character-card--locked"
              }${selected ? " character-card--selected" : ""}`}
            >
              <span className="character-card__tier">{c.tier}</span>

              <button
                type="button"
                className="character-card__stage"
                onClick={() => unlocked && preview(c.id, ALL_STATES[Math.floor(Math.random() * ALL_STATES.length)])}
                disabled={!unlocked}
                aria-label={unlocked ? `Preview ${c.name}` : `${c.name}, locked`}
              >
                <CharacterRig character={c} state={state} showSparkles={unlocked} />
                {!unlocked && <span className="character-card__lock">🔒</span>}
              </button>

              {unlocked && (
                // CQ-10g: a purely visual preview — a screen-reader user
                // can't see the pose change, so this is 20 tab stops of
                // real cost for no real benefit. aria-hidden on the row
                // plus tabIndex={-1} on each button (needed together: a
                // focusable element left inside an aria-hidden container
                // is its own, separate axe violation) removes the whole
                // row from the accessibility tree and the tab order,
                // while a mouse/touch user previews poses exactly as
                // before.
                <div
                  className="character-card__emoji-row"
                  onMouseLeave={() => setState(c.id, "idle")}
                  aria-hidden="true"
                >
                  {ALL_STATES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      tabIndex={-1}
                      className={`character-card__emoji${state === s ? " character-card__emoji--active" : ""}`}
                      onMouseEnter={() => setState(c.id, s)}
                      onClick={() => preview(c.id, s)}
                    >
                      {STATE_EMOJI[s]}
                    </button>
                  ))}
                </div>
              )}

              <h2 className="character-card__name">{c.name}</h2>
              <span className="character-card__archetype">{c.archetype}</span>
              <span className="character-card__concept">{"</>"} {c.concept}</span>

              {unlocked ? (
                <>
                  <p className="character-card__ability">{c.ability}</p>
                  <p className="character-card__move-line">“{c.catchphrase}”</p>
                  <button
                    type="button"
                    className={`character-card__select${
                      selected ? " character-card__select--active" : ""
                    }`}
                    onClick={() => onSelectCharacter(c.id)}
                  >
                    {selected ? `✓ ${t("characters.selected")}` : t("characters.select")}
                  </button>
                </>
              ) : (
                <>
                  <p className="character-card__unlock-hint">
                    {t(hint.key).replace("{n}", hint.values.n ?? "")}
                  </p>
                  <div className="character-card__progress-track">
                    <div
                      className="character-card__progress-fill"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

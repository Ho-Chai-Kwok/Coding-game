import { useState, useRef, useCallback } from "react";
import CharacterRig from "./CharacterRig";
import { CHARACTERS, isCharacterUnlocked, unlockProgress, unlockHint } from "../data/characters";
import { useI18n } from "../i18n/I18nContext";

const PREVIEW_STATES = ["correct", "wrong", "thinking"];

export default function CharacterRoster({
  unlockCtx,
  selectedCharacterId,
  onSelectCharacter,
  onBack,
}) {
  const { t } = useI18n();
  const [previewState, setPreviewState] = useState({});
  const timers = useRef({});

  const preview = useCallback((id) => {
    const next = PREVIEW_STATES[Math.floor(Math.random() * PREVIEW_STATES.length)];
    setPreviewState((prev) => ({ ...prev, [id]: next }));
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      setPreviewState((prev) => ({ ...prev, [id]: "idle" }));
    }, 1500);
  }, []);

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
                onClick={() => unlocked && preview(c.id)}
                disabled={!unlocked}
                aria-label={unlocked ? `Preview ${c.name}` : `${c.name}, locked`}
              >
                <CharacterRig character={c} state={state} showSparkles={unlocked} />
                {!unlocked && <span className="character-card__lock">🔒</span>}
              </button>

              <h2 className="character-card__name">{c.name}</h2>
              <span className="character-card__archetype">{c.archetype}</span>

              {unlocked ? (
                <>
                  <p className="character-card__ability">{c.ability}</p>
                  <p className="character-card__move-line">{c.moveLine}</p>
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

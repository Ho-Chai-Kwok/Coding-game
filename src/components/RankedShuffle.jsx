import { useEffect, useMemo, useRef, useState } from "react";
import { getDailyRotation, MODE_I18N_KEY } from "../data/rankedModes";
import { useI18n } from "../i18n/useI18n";

// A slot-machine style spin: cycles rapidly through today's playable modes,
// decelerating to a stop on a randomly chosen one. Replaces the old
// tap-a-card mode-select grid with a proper "shuffle" mechanic.
const SPIN_DELAYS = [70, 70, 80, 80, 90, 100, 110, 130, 150, 180, 220, 270, 330, 400, 480];

export default function RankedShuffle({ onPlayMode, onExit }) {
  const { t } = useI18n();
  const rotation = useMemo(() => getDailyRotation(), []);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState("spinning"); // "spinning" | "landed"
  const [landedIndex, setLandedIndex] = useState(null);
  const timeoutRef = useRef(null);

  function startSpin() {
    clearTimeout(timeoutRef.current);
    setPhase("spinning");
    setLandedIndex(null);
    const target = Math.floor(Math.random() * rotation.length);
    let pos = displayIndex;
    let step = 0;

    function tick() {
      if (step >= SPIN_DELAYS.length) {
        setDisplayIndex(target);
        setLandedIndex(target);
        setPhase("landed");
        return;
      }
      pos = (pos + 1) % rotation.length;
      setDisplayIndex(pos);
      step++;
      timeoutRef.current = setTimeout(tick, SPIN_DELAYS[step - 1]);
    }
    tick();
  }

  useEffect(() => {
    startSpin();
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentMode = rotation[displayIndex];
  const landedMode = landedIndex !== null ? rotation[landedIndex] : null;

  if (!currentMode) return null;

  return (
    <div className="ranked-mode-screen ranked-shuffle">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">🔀</span>
        <h2>{t("rankedModes.shuffle.title")}</h2>
      </div>

      <div
        className={`ranked-shuffle__reel${phase === "spinning" ? " ranked-shuffle__reel--spinning" : " ranked-shuffle__reel--landed"}`}
        style={{ background: currentMode.color }}
      >
        <span className="ranked-shuffle__reel-icon">{currentMode.icon}</span>
        <span className="ranked-shuffle__reel-name">{t(`rankedModes.${MODE_I18N_KEY[currentMode.id]}.name`)}</span>
      </div>

      {phase === "spinning" && <p className="ranked-shuffle__hint">{t("rankedModes.shuffle.spinning")}</p>}

      {phase === "landed" && landedMode && (
        <div className="ranked-shuffle__result">
          <p className="ranked-shuffle__result-label">{t("rankedModes.shuffle.landed")}</p>
          <p className="ranked-shuffle__result-desc">
            {t(`rankedModes.${MODE_I18N_KEY[landedMode.id]}.desc`)}
          </p>
          <div className="ranked-shuffle__actions">
            <button className="ranked-shuffle__reshuffle" onClick={startSpin}>
              🔀 {t("rankedModes.shuffle.reshuffle")}
            </button>
            <button className="ranked-shuffle__go" onClick={() => onPlayMode(landedMode.id)}>
              {t("rankedModes.shuffle.go")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

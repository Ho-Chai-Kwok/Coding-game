import { useI18n } from "../../i18n/I18nContext";

// Relay needs real 2-4 player team matchmaking, which this app doesn't
// have yet — flagged in the design brief as later-phase, out of scope for
// this pass. This screen keeps the mode visible (so it reads as "coming
// soon", not missing) without pretending it's playable.
export default function RelayComingSoon({ onExit }) {
  const { t } = useI18n();

  return (
    <div className="ranked-mode-screen">
      <button className="back-link" onClick={onExit}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">🤝</span>
        <h2>{t("rankedModes.relay.name")}</h2>
      </div>

      <div className="relay-coming-soon">
        <p className="relay-coming-soon__emoji">🚧</p>
        <p className="relay-coming-soon__text">{t("rankedModes.relay.comingSoon")}</p>
        <button className="ranked-result__continue" onClick={onExit}>
          {t("rankedModes.backToLobby")}
        </button>
      </div>
    </div>
  );
}

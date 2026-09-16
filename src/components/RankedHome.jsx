import { getRankInfo } from "../data/rank";
import { useI18n } from "../i18n/I18nContext";
import CharacterRig from "./CharacterRig";

export default function RankedHome({
  points,
  wins,
  losses,
  selectedCharacter,
  onPlay,
  onOpenCharacters,
  onBack,
}) {
  const { t } = useI18n();
  const rank = getRankInfo(points);

  return (
    <div className="ranked-home">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>

      <div
        className="ranked-home__badge"
        style={{ "--rank-color": rank.color }}
      >
        <span className="ranked-home__badge-icon">🏆</span>
        <span className="ranked-home__tier">{rank.label}</span>
        <span className="ranked-home__points">{rank.points} LP</span>
      </div>

      {selectedCharacter && (
        <button className="ranked-home__character" onClick={onOpenCharacters}>
          <span className="ranked-home__character-rig">
            <CharacterRig character={selectedCharacter} state="idle" showSparkles={false} />
          </span>
          <span className="ranked-home__character-text">
            <span className="ranked-home__character-label">{t("rankedHome.playingAs")}</span>
            <span className="ranked-home__character-name">{selectedCharacter.name}</span>
          </span>
          <span className="ranked-home__character-change">{t("rankedHome.changeCharacter")}</span>
        </button>
      )}

      <div className="ranked-home__progress">
        <div className="ranked-home__progress-track">
          <div
            className="ranked-home__progress-fill"
            style={{
              width: `${rank.progressPercent}%`,
              background: rank.color,
            }}
          />
        </div>
        <p className="ranked-home__progress-label">
          {rank.isMaxTier
            ? t("rankedHome.maxTier")
            : `${rank.pointsToNext} ${t("rankedHome.pointsToNext")}`}
        </p>
      </div>

      <div className="ranked-home__stats">
        <div className="ranked-home__stat">
          <span className="ranked-home__stat-value">{wins}</span>
          <span className="ranked-home__stat-label">{t("rankedHome.wins")}</span>
        </div>
        <div className="ranked-home__stat">
          <span className="ranked-home__stat-value">{losses}</span>
          <span className="ranked-home__stat-label">{t("rankedHome.losses")}</span>
        </div>
        <div className="ranked-home__stat">
          <span className="ranked-home__stat-value">
            {wins + losses > 0
              ? Math.round((wins / (wins + losses)) * 100)
              : 0}
            %
          </span>
          <span className="ranked-home__stat-label">{t("rankedHome.winRate")}</span>
        </div>
      </div>

      <button className="ranked-home__play" onClick={onPlay}>
        {t("rankedHome.play")}
      </button>
    </div>
  );
}

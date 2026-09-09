import { getRankInfo } from "../data/rank";

export default function RankedHome({ points, wins, losses, onPlay, onBack }) {
  const rank = getRankInfo(points);

  return (
    <div className="ranked-home">
      <button className="back-link" onClick={onBack}>
        ← Modes
      </button>

      <div
        className="ranked-home__badge"
        style={{ "--rank-color": rank.color }}
      >
        <span className="ranked-home__badge-icon">🏆</span>
        <span className="ranked-home__tier">{rank.label}</span>
        <span className="ranked-home__points">{rank.points} LP</span>
      </div>

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
            ? "You've reached the top rank!"
            : `${rank.pointsToNext} LP to next division`}
        </p>
      </div>

      <div className="ranked-home__stats">
        <div className="ranked-home__stat">
          <span className="ranked-home__stat-value">{wins}</span>
          <span className="ranked-home__stat-label">Wins</span>
        </div>
        <div className="ranked-home__stat">
          <span className="ranked-home__stat-value">{losses}</span>
          <span className="ranked-home__stat-label">Losses</span>
        </div>
        <div className="ranked-home__stat">
          <span className="ranked-home__stat-value">
            {wins + losses > 0
              ? Math.round((wins / (wins + losses)) * 100)
              : 0}
            %
          </span>
          <span className="ranked-home__stat-label">Win rate</span>
        </div>
      </div>

      <button className="ranked-home__play" onClick={onPlay}>
        ⚔️ Play Ranked Match
      </button>
    </div>
  );
}

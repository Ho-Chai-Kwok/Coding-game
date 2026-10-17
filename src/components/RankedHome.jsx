import { getRankInfo, TIERS } from "../data/rank";
import { SKILL_GATE_LESSONS, meetsSkillGate } from "../data/skillGate";
import { useI18n } from "../i18n/useI18n";
import { useAuth } from "../auth/useAuth";
import CharacterRig from "./CharacterRig";
import SkillGateNotice from "./SkillGateNotice";

// Was always "idle" regardless of how things actually stood — now reacts
// to the same numbers already on this screen: an active shield gets the
// protective guard pose, being close to the next rank gets an eager
// hype, and an unbeaten record (at least one match played) gets the
// confident streak pump. Falls back to idle otherwise, same as before.
function rankedHomeCharacterState({ shield, rank, wins, losses }) {
  if (shield > 0) return "shielded";
  if (!rank.isMaxTier && rank.progressPercent >= 85) return "hype";
  if (wins > 0 && losses === 0) return "streak";
  return "idle";
}

export default function RankedHome({
  points,
  shield = 0,
  usesJsFallback = false,
  peakPoints = 0,
  wins,
  losses,
  selectedCharacter,
  mainLessonsCompleted = 0,
  onPlay,
  onOpenCharacters,
  onGoToLearning,
  onBack,
}) {
  const { t } = useI18n();
  const { isLoggedIn, signOut } = useAuth();
  const rank = getRankInfo(points);
  const peak = getRankInfo(peakPoints);
  const floorLabel = getRankInfo(TIERS[rank.tierIndex].min).label;
  const unlocked = meetsSkillGate(mainLessonsCompleted);

  if (!unlocked) {
    return (
      <div className="ranked-home">
        <button className="back-link" onClick={onBack}>
          ← {t("backToModes")}
        </button>
        <SkillGateNotice
          lessonsCompleted={mainLessonsCompleted}
          lessonsRequired={SKILL_GATE_LESSONS}
          onGoToLearning={onGoToLearning}
        />
      </div>
    );
  }

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
        {/* CQ-14: "LP" was never explained anywhere in the UI. */}
        <span className="ranked-home__points" title={t("rankedHome.lpTooltip")}>
          {rank.points} LP
        </span>
      </div>

      {peak.label !== rank.label && (
        <p className="ranked-home__peak">
          📈 {t("rankedHome.peak")}: <strong>{peak.label}</strong>
        </p>
      )}

      {shield > 0 && (
        <p className="ranked-home__shield">
          {t("rankedHome.shield").replace("{n}", shield).replace("{rank}", floorLabel)}
        </p>
      )}

      {selectedCharacter && (
        <button className="ranked-home__character" onClick={onOpenCharacters}>
          <span className="ranked-home__character-rig">
            <CharacterRig
              character={selectedCharacter}
              state={rankedHomeCharacterState({ shield, rank, wins, losses })}
              showSparkles={false}
            />
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

      {usesJsFallback && <p className="ranked-home__note">ℹ️ {t("rankedHome.jsFallback")}</p>}

      {isLoggedIn ? (
        <button className="ranked-home__play" onClick={onPlay}>
          {t("rankedHome.play")}
        </button>
      ) : (
        <div className="ranked-home__guest-gate">
          <p className="ranked-home__guest-gate-text">{t("rankedHome.guestGate")}</p>
          <button className="ranked-home__play" onClick={signOut}>
            {t("auth.logIn")} / {t("auth.signUp")}
          </button>
        </div>
      )}
    </div>
  );
}

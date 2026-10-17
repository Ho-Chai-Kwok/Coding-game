import { useEffect, useRef } from "react";
import { useRankedQueue } from "../hooks/useRankedQueue";
import { getMode, MODE_I18N_KEY } from "../data/rankedModes";
import { useI18n } from "../i18n/useI18n";

// Real matchmaking: polls for the closest-ranked waiting opponent (see
// useRankedQueue.js / try_ranked_match() in supabase/schema.sql), widening
// the acceptable rank gap the longer nobody close enough is found. Calls
// onMatched(matchId) the instant a real opponent is paired — never fakes
// one, so on a quiet ladder this can take a while or not find anyone; the
// player can always cancel back out.
// After this many seconds with nobody found, offer practice instead of
// leaving someone staring at a spinner indefinitely on a quiet ladder.
const PRACTICE_OFFER_SECONDS = 20;

export default function RankedQueue({ modeId, displayName, onMatched, onPractice, onExit }) {
  const { t } = useI18n();
  const mode = getMode(modeId);
  const { status, matchId, waitedSeconds, cancel } = useRankedQueue({
    active: true,
    modeId,
    displayName,
  });
  const onMatchedRef = useRef(onMatched);
  const statusRef = useRef(status);
  const cancelRef = useRef(cancel);
  useEffect(() => {
    onMatchedRef.current = onMatched;
    statusRef.current = status;
    cancelRef.current = cancel;
  });

  useEffect(() => {
    if (status === "matched" && matchId) onMatchedRef.current(matchId);
  }, [status, matchId]);

  // Leaving this screen for any reason (Cancel, the bottom nav, browser
  // back) always releases the queue spot — never left for someone else
  // to time out waiting on. An empty dep array means this cleanup only
  // ever runs on true unmount, not on every status change in between —
  // it reads the latest status/cancel via refs rather than closing over
  // the values from whichever render first set the effect up.
  useEffect(() => {
    return () => {
      if (statusRef.current === "searching") cancelRef.current();
    };
  }, []);

  function handleCancel() {
    cancel();
    onExit();
  }

  function handlePractice() {
    cancel();
    onPractice();
  }

  const widening = waitedSeconds >= 10;
  const canPractice = waitedSeconds >= PRACTICE_OFFER_SECONDS;

  return (
    <div className="ranked-mode-screen ranked-queue">
      <button className="back-link" onClick={handleCancel}>
        ← {t("backToModes")}
      </button>
      <div className="ranked-mode-screen__header">
        <span className="ranked-mode-screen__icon">{mode?.icon ?? "🏆"}</span>
        <h2>{mode ? t(`rankedModes.${MODE_I18N_KEY[mode.id]}.name`) : ""}</h2>
      </div>

      {status === "error" ? (
        <>
          <p className="ranked-queue__error">⚠️ {t("rankedQueue.error")}</p>
          <button className="ranked-shuffle__go" onClick={handleCancel}>
            {t("rankedModes.backToLobby")}
          </button>
        </>
      ) : (
        <>
          <div className="ranked-queue__spinner" aria-hidden="true">
            🔍
          </div>
          <p className="ranked-queue__status">
            {widening ? t("rankedQueue.widening") : t("rankedQueue.searching")}
          </p>
          <p className="ranked-queue__waited">
            {t("rankedQueue.waitedFor")} {waitedSeconds}s
          </p>
          {canPractice && (
            <p className="ranked-queue__practice-hint">{t("rankedQueue.practiceHint")}</p>
          )}
          <div className="ranked-shuffle__actions">
            <button className="ranked-shuffle__reshuffle" onClick={handleCancel}>
              {t("rankedQueue.cancel")}
            </button>
            {canPractice && (
              <button className="ranked-shuffle__go" onClick={handlePractice}>
                {t("rankedQueue.practice")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

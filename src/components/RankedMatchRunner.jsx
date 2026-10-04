import { useEffect, useRef, useState } from "react";
import RankedModeRunner from "./RankedModeRunner";
import RankedResult from "./ranked/RankedResult";
import { useRankedMatch } from "../hooks/useRankedMatch";
import { getRankInfo } from "../data/rank";
import { useI18n } from "../i18n/I18nContext";

const FORFEIT_WAIT_SECONDS = 45;
// Every mode's own internal countdown (100s-240s, see each mode file)
// already forces that mode to submit a result well before this — the real
// risk of a match running long isn't active play, it's one player
// finishing and then waiting indefinitely for a slow/AFK/disconnected
// opponent, since claiming a forfeit win is otherwise a manual, optional
// click. This is the hard backstop: measured from `match.created_at`
// (set server-side the instant the two players are actually paired, not
// from whenever either of them happened to open the app), once a match
// has been live this long, the waiting side's forfeit gets claimed
// automatically instead of sitting there indefinitely.
const MATCH_TIME_LIMIT_SECONDS = 12 * 60;

// Orchestrates one real PvP match end to end: both matched players play
// the same mode with the same seeded content (see RankedModeRunner.jsx),
// each mode's own scoring becomes that player's score for the match, and
// once BOTH sides have reported, the server (submit_ranked_result() in
// supabase/schema.sql) decides the real winner and each player's LP
// change — never computed or trusted client-side.
export default function RankedMatchRunner({ matchId, modeId, myUserId, character, language, onExit, onSettled }) {
  const { t } = useI18n();
  const { match, submitResult, claimForfeitWin } = useRankedMatch(matchId);
  const [mySubmittedScore, setMySubmittedScore] = useState(null);
  const [waitedSeconds, setWaitedSeconds] = useState(0);
  const [matchElapsedSeconds, setMatchElapsedSeconds] = useState(0);
  const submittedAtRef = useRef(null);

  useEffect(() => {
    if (mySubmittedScore === null || match?.status === "settled") return undefined;
    submittedAtRef.current = Date.now();
    const id = setInterval(() => {
      setWaitedSeconds(Math.floor((Date.now() - submittedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [mySubmittedScore, match?.status]);

  // The overall match clock — ticks the whole time the match is live,
  // independent of which phase (playing vs. waiting) either player is in.
  useEffect(() => {
    if (!match?.created_at || match.status === "settled") return undefined;
    const startedAt = new Date(match.created_at).getTime();
    const tick = () => setMatchElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [match?.created_at, match?.status]);

  // The actual backstop: once the 12-minute mark passes while I'm the one
  // still waiting on my opponent, claim the forfeit automatically. Keeps
  // retrying every few seconds (rather than firing once) because the
  // server itself also requires 45s to have passed since *my own*
  // submission (claim_forfeit_win() in supabase/schema.sql) — if I
  // happened to submit within the last 45s of the 12-minute mark, a
  // single early attempt would be rejected and, without a retry, the
  // match could hang past the deadline instead of resolving the moment
  // it's genuinely eligible.
  const pastMatchTimeLimit = matchElapsedSeconds >= MATCH_TIME_LIMIT_SECONDS;
  useEffect(() => {
    if (mySubmittedScore === null || match?.status === "settled") return undefined;
    if (!pastMatchTimeLimit) return undefined;
    claimForfeitWin();
    const id = setInterval(claimForfeitWin, 5000);
    return () => clearInterval(id);
  }, [mySubmittedScore, match?.status, pastMatchTimeLimit, claimForfeitWin]);

  if (!match) {
    return <p className="app-loading" aria-label="Loading">🏆</p>;
  }

  const isPlayer1 = match.player1_id === myUserId;
  const opponentName = isPlayer1 ? match.player2_name : match.player1_name;
  const opponentPoints = isPlayer1 ? match.player2_points : match.player1_points;
  const avgPoints = Math.round((match.player1_points + match.player2_points) / 2);

  if (match.status === "settled") {
    const didWin = match.winner_id === myUserId;
    const isDraw = !match.winner_id;
    const myDelta = isPlayer1 ? match.player1_delta : match.player2_delta;
    const myScore = (isPlayer1 ? match.player1_result : match.player2_result)?.score;
    const opponentScore = (isPlayer1 ? match.player2_result : match.player1_result)?.score;

    return (
      <RankedResult
        didWin={isDraw ? false : didWin}
        character={character}
        emoji={isDraw ? "🤝" : didWin ? "🏆" : "😤"}
        title={
          isDraw
            ? t("rankedMatch.draw")
            : didWin
              ? t("rankedMatch.youWon").replace("{name}", opponentName)
              : t("rankedMatch.youLost").replace("{name}", opponentName)
        }
        statLines={[
          { label: t("rankedMatch.yourScore"), value: myScore },
          { label: t("rankedMatch.opponentScore"), value: opponentScore },
          { label: t("rankedMatch.opponentRank"), value: getRankInfo(opponentPoints).label },
        ]}
        pointsDelta={myDelta}
        pointsLabel="LP"
        onContinue={() => onSettled(myDelta)}
      />
    );
  }

  if (mySubmittedScore !== null) {
    const canForfeit = waitedSeconds >= FORFEIT_WAIT_SECONDS;
    const secondsLeft = Math.max(0, MATCH_TIME_LIMIT_SECONDS - matchElapsedSeconds);
    const minutesLeft = Math.ceil(secondsLeft / 60);
    return (
      <div className="ranked-mode-screen ranked-queue">
        <div className="ranked-mode-screen__header">
          <span className="ranked-mode-screen__icon">⏳</span>
          <h2>{t("rankedMatch.waitingTitle")}</h2>
        </div>
        <p className="ranked-queue__status">
          {t("rankedMatch.waitingFor").replace("{name}", opponentName)}
        </p>
        <p className="ranked-queue__waited">{waitedSeconds}s</p>
        {canForfeit && (
          <button className="ranked-shuffle__go" onClick={claimForfeitWin}>
            {t("rankedMatch.claimForfeit")}
          </button>
        )}
        <p className="ranked-match-runner__match-limit">
          {t("rankedMatch.autoResolveIn").replace("{n}", minutesLeft)}
        </p>
      </div>
    );
  }

  // Live opponent status while you're still playing: the match row (kept
  // live by useRankedMatch's Realtime subscription — active the whole
  // time, not just once you've finished) flips the opponent's result to
  // non-null the instant they submit, so this needs no extra plumbing
  // through any of the 7 mode components to know "they're done, waiting
  // on you now." Deliberately just this simple finished/not-finished
  // signal rather than a live round-by-round score: the 7 modes track
  // progress in genuinely different shapes (rounds, a single puzzle,
  // lives, elapsed time...), and forcing them into one shared shape just
  // for a mid-match HUD wasn't worth the added surface across every mode.
  const opponentResult = isPlayer1 ? match.player2_result : match.player1_result;

  return (
    <div className="ranked-match-runner">
      {opponentResult && (
        <p className="ranked-match-runner__opponent-status">
          ✅ {t("rankedMatch.opponentFinished").replace("{name}", opponentName)}
        </p>
      )}
      <RankedModeRunner
        modeId={modeId}
        character={character}
        language={language}
        rankedPoints={avgPoints}
        matchId={matchId}
        seed={match.seed}
        onExit={onExit}
        onFinish={(pointsDelta) => {
          setMySubmittedScore(pointsDelta);
          submitResult(pointsDelta);
        }}
      />
    </div>
  );
}

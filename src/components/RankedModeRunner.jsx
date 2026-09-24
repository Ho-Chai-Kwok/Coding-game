import CodeRace from "./ranked/CodeRace";
import BugHunt from "./ranked/BugHunt";
import PredictOutput from "./ranked/PredictOutput";
import CodeGolf from "./ranked/CodeGolf";
import Showdown from "./ranked/Showdown";
import DebugDuel from "./ranked/DebugDuel";
import ChaosRound from "./ranked/ChaosRound";
import RelayComingSoon from "./ranked/RelayComingSoon";
import { MODE_IDS } from "../data/rankedModes";

// `seed`, when given, makes every mode's question/puzzle draw deterministic
// (see shuffledSample() in data/rankedModes.js) instead of Math.random-based
// — used by RankedMatchRunner.jsx so two matched players see the exact same
// content, never one getting an easier draw than the other. Solo/practice
// callers simply omit it and get the old per-play-random behavior.
//
// `matchId`, when given, lets the three quiz-based modes (Predict Output,
// Showdown, Chaos Round) try dynamically-generated questions for this real
// match (see utils/rankedQuestionGenerator.js) before falling back to the
// static bank — solo/practice callers omit it and always get the static
// bank, since there's no "other player" to keep in sync with anyway.
export default function RankedModeRunner({ modeId, character, language, rankedPoints, matchId, seed, onExit, onFinish }) {
  switch (modeId) {
    case MODE_IDS.CODE_RACE:
      return (
        <CodeRace
          character={character}
          language={language}
          rankedPoints={rankedPoints}
          seed={seed}
          onExit={onExit}
          onFinish={onFinish}
        />
      );
    case MODE_IDS.BUG_HUNT:
      return (
        <BugHunt character={character} rankedPoints={rankedPoints} seed={seed} onExit={onExit} onFinish={onFinish} />
      );
    case MODE_IDS.PREDICT_OUTPUT:
      return (
        <PredictOutput
          character={character}
          rankedPoints={rankedPoints}
          matchId={matchId}
          seed={seed}
          onExit={onExit}
          onFinish={onFinish}
        />
      );
    case MODE_IDS.CODE_GOLF:
      return (
        <CodeGolf
          character={character}
          language={language}
          rankedPoints={rankedPoints}
          seed={seed}
          onExit={onExit}
          onFinish={onFinish}
        />
      );
    case MODE_IDS.SHOWDOWN:
      return (
        <Showdown
          character={character}
          rankedPoints={rankedPoints}
          matchId={matchId}
          seed={seed}
          onExit={onExit}
          onFinish={onFinish}
        />
      );
    case MODE_IDS.DEBUG_DUEL:
      return (
        <DebugDuel character={character} rankedPoints={rankedPoints} seed={seed} onExit={onExit} onFinish={onFinish} />
      );
    case MODE_IDS.CHAOS_ROUND:
      return (
        <ChaosRound
          character={character}
          rankedPoints={rankedPoints}
          matchId={matchId}
          seed={seed}
          onExit={onExit}
          onFinish={onFinish}
        />
      );
    case MODE_IDS.RELAY:
      return <RelayComingSoon onExit={onExit} />;
    default:
      return null;
  }
}

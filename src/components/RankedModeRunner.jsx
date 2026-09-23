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
export default function RankedModeRunner({ modeId, character, language, rankedPoints, seed, onExit, onFinish }) {
  switch (modeId) {
    case MODE_IDS.CODE_RACE:
      return <CodeRace character={character} language={language} seed={seed} onExit={onExit} onFinish={onFinish} />;
    case MODE_IDS.BUG_HUNT:
      return <BugHunt character={character} seed={seed} onExit={onExit} onFinish={onFinish} />;
    case MODE_IDS.PREDICT_OUTPUT:
      return (
        <PredictOutput
          character={character}
          rankedPoints={rankedPoints}
          seed={seed}
          onExit={onExit}
          onFinish={onFinish}
        />
      );
    case MODE_IDS.CODE_GOLF:
      return <CodeGolf character={character} language={language} seed={seed} onExit={onExit} onFinish={onFinish} />;
    case MODE_IDS.SHOWDOWN:
      return (
        <Showdown
          character={character}
          rankedPoints={rankedPoints}
          seed={seed}
          onExit={onExit}
          onFinish={onFinish}
        />
      );
    case MODE_IDS.DEBUG_DUEL:
      return <DebugDuel character={character} seed={seed} onExit={onExit} onFinish={onFinish} />;
    case MODE_IDS.CHAOS_ROUND:
      return (
        <ChaosRound
          character={character}
          rankedPoints={rankedPoints}
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

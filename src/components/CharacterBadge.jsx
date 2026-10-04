import CharacterRig from "./CharacterRig";

// A small, consistent "your character is here, reacting to what's going
// on" presence for menu/dashboard screens — World Map, Side Quest Map,
// Home. Each screen picks its own `state` from its own real signals
// (streak, progress, rank); this component only renders whatever it's
// told, the same contract CharacterRig itself already has.
export default function CharacterBadge({ character, state = "idle", label, className = "" }) {
  if (!character) return null;
  return (
    <div className={`character-badge ${className}`.trim()}>
      <span className="character-badge__rig">
        <CharacterRig character={character} state={state} showSparkles={false} />
      </span>
      {label && <span className="character-badge__label">{label}</span>}
    </div>
  );
}

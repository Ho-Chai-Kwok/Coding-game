import ByteBornSprite from "./byteborn/ByteBornSprite";
import "./byteborn/byteborn.css";

// Thin wrapper kept so existing screens (Character Roster, Ranked Home)
// keep their import: every character is now a Byteborn sprite with its own
// hand-drawn art and idle / thinking / correct / wrong animations.
export default function CharacterRig({ character, state = "idle", showSparkles = true }) {
  return (
    <div className="char-rig" data-state={state}>
      <ByteBornSprite id={character.id} state={state} showFx={showSparkles} label={character.name} />
    </div>
  );
}

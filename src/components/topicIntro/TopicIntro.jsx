import { useEffect, useRef, useState } from "react";
import ByteBornSprite from "../byteborn/ByteBornSprite";
import { BEAT_MS } from "../../data/topicIntros";
import "./topicIntro.css";

// Plays a short choreographed sequence introducing a new topic, using the
// player's own character — see data/topicIntros.js for the full design
// rationale (this is the substitute for the "30s 3D animation" ask).
// Auto-advances through each beat; tap/click anywhere (or the Skip
// button) jumps straight to the end and calls onDone.
export default function TopicIntro({ character, intro, onDone }) {
  const [beatIndex, setBeatIndex] = useState(0);
  const timerRef = useRef(null);

  const beat = intro.beats[beatIndex];
  const isLast = beatIndex === intro.beats.length - 1;

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isLast) onDone();
      else setBeatIndex((i) => i + 1);
    }, BEAT_MS);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatIndex]);

  function handleSkip() {
    clearTimeout(timerRef.current);
    onDone();
  }

  return (
    <div className="topic-intro" onClick={handleSkip} role="presentation">
      <button type="button" className="topic-intro__skip" onClick={handleSkip}>
        Skip →
      </button>
      <p className="topic-intro__topic-label">New Topic: {intro.topic}</p>
      <div className="topic-intro__stage">
        <div className="topic-intro__sprite">
          <ByteBornSprite id={character.id} state={beat.state} label={character.name} />
        </div>
        <div className="topic-intro__caption-row">
          <p className="topic-intro__caption" key={beatIndex}>
            {beat.caption}
          </p>
        </div>
      </div>
      <div className="topic-intro__dots">
        {intro.beats.map((_, i) => (
          <span key={i} className={`topic-intro__dot${i === beatIndex ? " topic-intro__dot--active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

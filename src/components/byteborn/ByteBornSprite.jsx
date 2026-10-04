import { useId } from "react";
import { SPRITES } from "./sprites";
import "./byteborn.css";

// Animated Byteborn character — 20 named states per character, Duolingo
// mascot-style, covering single-question feedback up through whole-session
// and whole-app moments:
//
//   idle       - breathing, blinking, small signature motion
//   thinking   - head tilt, sway, thought dots
//   correct    - jump, arms up, happy eyes, sparkles (one quiz question)
//   wrong      - shake then slump, worried eyes, sweat drop (one question)
//   win        - BIG celebration: multi-bounce + fuller sparkle burst —
//                session/match results, not single questions
//   lose       - BIG letdown: deeper slump, head-shake "no", falling tear
//   perfect    - flawless run: biggest celebration, gold crown, confetti
//   streak     - on a hot streak: confident fist-pump, warm glow
//   rankUp     - promoted a tier: the single largest celebration
//   rankDown   - demoted a tier: a quiet, stoic slump — no panic, no
//                shake, just disappointment that sits for a moment
//   shielded   - a promotion shield absorbed a loss: protective stance,
//                relieved nod, a shimmering guard ring
//   greet      - hello / welcome back: a friendly wave
//   hype       - queued and waiting for an opponent: eager little bounce
//   waiting    - finished and waiting on someone else: patient, calm
//   surprised  - something unexpected just happened: a real new
//                expression (wide eyes, small "o" mouth, raised brows),
//                not a reuse of an existing face
//   sleepy     - idle too long: slow heavy sway, eyes held near-shut
//   laughing   - a fun/chaos moment: bouncy shoulder-shake, big grin
//   confused   - stuck / asked for a hint: tilts head both ways, puzzled
//   determined - racing the clock: minimal motion, locked-in focus
//   cheer      - encouraging the player: a gentle supportive clap
//
// All motion is CSS (byteborn.css); this component only swaps the face
// shapes and tags the parts so the keyframes know what to move. Every
// state above "wrong" reuses one of the five base expressions (idle,
// thinking, correct, wrong, surprised) via FACE_STATE_ALIAS below —
// only the body-level animation and effects differ per state, which
// keeps every character's face-drawing code from having to be
// duplicated 20 times over instead of just 5.

const INK = "#1B1530";
const MOUTH_FILL = "#6E1F2B";

function Gradient({ id, spec }) {
  if (spec.smooth) {
    const [a, b, c] = spec.smooth;
    return (
      <linearGradient id={id} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="0.45" stopColor={b} />
        <stop offset="1" stopColor={c} />
      </linearGradient>
    );
  }
  const [light, mid, dark] = spec;
  return (
    <linearGradient id={id} x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stopColor={light} />
      <stop offset="0.4" stopColor={mid} />
      <stop offset="0.64" stopColor={mid} />
      <stop offset="0.64" stopColor={dark} />
      <stop offset="1" stopColor={dark} />
    </linearGradient>
  );
}

// Which way is "toward the middle of the face" for a given eye.
function inward(x, eyes) {
  if (eyes.length < 2) return 1;
  const cx = eyes.reduce((s, e) => s + e[0], 0) / eyes.length;
  return x < cx ? 1 : -1;
}

function Brows({ f, state }) {
  if (!f.brows) return null;
  if (state !== "wrong" && state !== "thinking" && state !== "surprised") return null;
  return f.eyes.map(([x, y], i) => {
    const s = inward(x, f.eyes);
    const top = y - f.ry - (f.big ? 7 : 5);
    let d;
    if (state === "wrong") {
      // Worried: inner end raised.
      d = `M ${x - s * f.rx} ${top + 3} L ${x + s * (f.rx - 2)} ${top - 3}`;
    } else if (state === "surprised") {
      // Both brows shoot straight up, flat and high.
      d = `M ${x - f.rx} ${top - 6} L ${x + f.rx} ${top - 6}`;
    } else {
      // Thinking: one brow arched up.
      const lift = i === f.eyes.length - 1 ? 5 : 0;
      d = `M ${x - f.rx} ${top - lift + 1} Q ${x} ${top - lift - 4} ${x + f.rx} ${top - lift + 1}`;
    }
    return <path key={i} className="bb-l" d={d} style={{ stroke: f.brows, strokeWidth: 3 }} />;
  });
}

function EyesFace({ f, state }) {
  const { rx, ry, iris, irisR } = f;
  if (state === "correct") {
    return f.eyes.map(([x, y], i) => (
      <path key={i} className="bb-l" d={`M ${x - rx + 1} ${y + 2} Q ${x} ${y - ry - 3} ${x + rx - 1} ${y + 2}`} style={{ strokeWidth: f.big ? 4.5 : 3.5 }} />
    ));
  }
  const blow = state === "surprised" ? 1.3 : 1;
  const shift =
    state === "wrong" ? [0, ry * 0.35] :
    state === "thinking" ? [rx * 0.3, -ry * 0.38] : [1, 1];
  const squash = state === "wrong" ? 0.85 : 1;
  return (
    <g className={state === "idle" ? "bb-blink" : undefined}>
      {f.eyes.map(([x, y], i) => {
        const ix = x + shift[0];
        const iy = y + shift[1];
        return (
          <g key={i}>
            <ellipse className="bb-k" cx={x} cy={y + (1 - squash) * ry} rx={rx * blow} ry={ry * squash * blow} fill="#FFFFFF" style={{ strokeWidth: 2.5 }} />
            <circle cx={ix} cy={iy} r={irisR * blow} fill={iris} />
            {f.ring && <circle cx={ix} cy={iy} r={irisR * 0.6} fill="none" stroke={f.ring} strokeWidth="1.3" />}
            {f.slit ? (
              <ellipse cx={ix} cy={iy} rx={irisR * 0.28} ry={irisR * 0.85} fill={INK} />
            ) : (
              <circle cx={ix} cy={iy} r={irisR * (f.big ? 0.5 : 0.42)} fill={INK} />
            )}
            <circle cx={ix + irisR * 0.4} cy={iy - irisR * 0.45} r={irisR * (f.big ? 0.38 : 0.34)} fill="#FFFFFF" />
            {f.big && <circle cx={ix - irisR * 0.4} cy={iy + irisR * 0.5} r={irisR * 0.18} fill="#FFFFFF" />}
            {f.lid && (
              <path
                className="bb-l"
                d={`M ${x - rx - 1} ${y - ry * 0.2} Q ${x} ${y - ry - (f.lid === "heavy" ? 0 : 2)} ${x + rx + 1} ${y - ry * 0.2}`}
                style={{ strokeWidth: f.lid === "heavy" ? 3.5 : 2.5 }}
              />
            )}
            {f.lash && (
              <path className="bb-l" d={`M ${x - inward(x, f.eyes) * (rx + 1)} ${y - ry * 0.2} l ${-inward(x, f.eyes) * 4} -3`} style={{ strokeWidth: 2.5 }} />
            )}
          </g>
        );
      })}
    </g>
  );
}

function PixelFace({ f, state }) {
  const { w, h, color } = f;
  const stroke = { stroke: color, strokeWidth: 4.5, strokeLinecap: "square", strokeLinejoin: "miter", fill: "none" };
  return f.eyes.map(([x, y], i) => {
    if (state === "correct") {
      return <path key={i} d={`M ${x - w / 2} ${y + h / 5} L ${x} ${y - h / 4} L ${x + w / 2} ${y + h / 5}`} style={stroke} />;
    }
    if (state === "wrong") {
      const r = Math.min(w, h) * 0.38;
      return <path key={i} d={`M ${x - r} ${y - r} L ${x + r} ${y + r} M ${x + r} ${y - r} L ${x - r} ${y + r}`} style={stroke} />;
    }
    if (state === "surprised") {
      const r = Math.min(w, h) * 0.42;
      return <circle key={i} cx={x} cy={y} r={r} style={stroke} />;
    }
    const sh = state === "thinking" ? h * 0.55 : h;
    const dy = state === "thinking" ? -h * 0.2 : 0;
    const dx = state === "thinking" ? w * 0.2 : 0;
    return (
      <g key={i} className={state === "idle" ? "bb-blink" : undefined}>
        <rect x={x - w / 2 + dx} y={y - sh / 2 + dy} width={w} height={sh} rx={Math.min(6, w / 3)} fill={color} />
        <rect x={x - w / 2 + dx + w * 0.2} y={y - sh / 2 + dy + 3} width={Math.max(3, w * 0.32)} height={Math.max(3, w * 0.32)} rx="1" fill="#FFFFFF" />
      </g>
    );
  });
}

function SlitFace({ f, state }) {
  const { w, h, color, glow } = f;
  return f.eyes.map(([x, y], i) => {
    const s = inward(x, f.eyes);
    if (state === "correct") {
      return (
        <path key={i} d={`M ${x - w / 2} ${y + 2} Q ${x} ${y - h - 3} ${x + w / 2} ${y + 2}`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      );
    }
    if (state === "surprised") {
      return (
        <g key={i}>
          {glow && <ellipse cx={x} cy={y} rx={w * 0.8} ry={h * 1.1} fill={glow} opacity="0.35" />}
          <ellipse cx={x} cy={y} rx={w * 0.4} ry={h * 1.15} fill={color} />
        </g>
      );
    }
    const hh = state === "thinking" && i === 0 ? h * 0.4 : h;
    const rot = state === "wrong" ? -s * 16 : 0;
    const dy = state === "wrong" ? 2 : 0;
    return (
      <g key={i} className={state === "idle" ? "bb-blink" : undefined} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
        {glow && <ellipse cx={x} cy={y + dy} rx={w * 0.7} ry={hh * 0.9 + 1} fill={glow} opacity="0.35" />}
        <path d={`M ${x - w / 2} ${y + dy} Q ${x} ${y + dy - hh} ${x + w / 2} ${y + dy} Q ${x} ${y + dy + hh * 0.55} ${x - w / 2} ${y + dy} Z`} fill={color} />
      </g>
    );
  });
}

function BarFace({ f, state }) {
  const { w, h, color } = f;
  return f.eyes.map(([x, y], i) => {
    const s = inward(x, f.eyes);
    if (state === "correct") {
      return <path key={i} d={`M ${x - w / 2} ${y + 2} Q ${x} ${y - 5} ${x + w / 2} ${y + 2}`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />;
    }
    if (state === "surprised") {
      return <rect key={i} x={x - w / 2} y={y - h * 1.1} width={w} height={h * 2.2} rx={Math.min(5, w / 3)} fill={color} />;
    }
    const rot = state === "wrong" ? -s * 14 : 0;
    const ww = state === "thinking" && i === 0 ? w * 0.5 : w;
    return (
      <rect
        key={i}
        className={state === "idle" ? "bb-blink" : undefined}
        x={x - ww / 2}
        y={y - h / 2}
        width={ww}
        height={h}
        rx="2"
        fill={color}
        transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
      />
    );
  });
}

function DotFace({ f, state }) {
  return f.eyes.map(([x, y], i) => {
    if (state === "correct") {
      return <path key={i} className="bb-l" d={`M ${x - 5} ${y + 2} Q ${x} ${y - 5} ${x + 5} ${y + 2}`} style={{ strokeWidth: 3 }} />;
    }
    if (state === "surprised") {
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={f.r * 1.6} fill={INK} />
          <circle cx={x + 2} cy={y - 2.5} r={f.r * 0.5} fill="#FFFFFF" />
        </g>
      );
    }
    const dy = state === "wrong" ? 3 : state === "thinking" ? -3 : 0;
    const dx = state === "thinking" ? 2 : 0;
    return (
      <g key={i} className={state === "idle" ? "bb-blink" : undefined}>
        <circle cx={x + dx} cy={y + dy} r={f.r} fill={INK} />
        <circle cx={x + dx + 1.5} cy={y + dy - 2} r={f.r * 0.38} fill="#FFFFFF" />
      </g>
    );
  });
}

function HolesFace({ f, state }) {
  return f.eyes.map(([x, y], i) => {
    if (state === "correct") {
      return <path key={i} d={`M ${x - 4} ${y + 1.5} Q ${x} ${y - 3.5} ${x + 4} ${y + 1.5}`} fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />;
    }
    if (state === "surprised") {
      return <circle key={i} cx={x} cy={y} r={f.r * 1.5} fill="#FFFFFF" />;
    }
    const dy = state === "wrong" ? 1.5 : state === "thinking" ? -1.5 : 0;
    const dx = state === "thinking" ? 2 : 0;
    return (
      <circle
        key={i}
        className={state === "idle" ? "bb-blink" : undefined}
        cx={x + dx}
        cy={y + dy}
        r={state === "wrong" ? f.r * 0.8 : f.r}
        fill="#FFFFFF"
        opacity={state === "wrong" ? 0.7 : 1}
      />
    );
  });
}

const FACES = {
  eyes: EyesFace,
  pixel: PixelFace,
  slit: SlitFace,
  bar: BarFace,
  dot: DotFace,
  holes: HolesFace,
};

// Every one of the 20 states renders as one of five base expressions
// (idle, thinking, correct, wrong, surprised) — this is the only place
// that decides which. Everything else about a state (how big the jump
// is, what color the sparkles are, how long it lasts) lives in CSS, per
// data-state, and never needs to touch a character's face-drawing code.
const FACE_STATE_ALIAS = {
  win: "correct",
  perfect: "correct",
  streak: "correct",
  rankUp: "correct",
  shielded: "correct",
  greet: "correct",
  laughing: "correct",
  cheer: "correct",
  lose: "wrong",
  rankDown: "wrong",
  hype: "thinking",
  confused: "thinking",
  determined: "thinking",
  sleepy: "idle",
  waiting: "idle",
};

function Mouth({ m, state }) {
  if (!m) return null;
  const { x, y, w } = m;
  if (m.kind === "pixel") {
    const st = { fill: "none", stroke: m.color, strokeWidth: 4, strokeLinecap: "square", strokeLinejoin: "miter" };
    if (state === "correct") return <path d={`M ${x - w * 0.65} ${y - 5} V ${y + 2} H ${x + w * 0.65} V ${y - 5}`} style={st} />;
    if (state === "wrong") return <path d={`M ${x - w / 2} ${y + 3} V ${y - 2} H ${x + w / 2} V ${y + 3}`} style={st} />;
    if (state === "thinking") return <path d={`M ${x - w * 0.15} ${y} H ${x + w * 0.35}`} style={st} />;
    if (state === "surprised") return <rect x={x - w * 0.14} y={y - w * 0.14} width={w * 0.28} height={w * 0.28} style={{ ...st, fill: m.color }} />;
    return <path d={`M ${x - w / 2} ${y - 3} V ${y} H ${x + w / 2} V ${y - 3}`} style={st} />;
  }
  if (state === "correct") {
    return (
      <g>
        <path className="bb-k" d={`M ${x - w / 2} ${y - 1} Q ${x} ${y + w * 0.75} ${x + w / 2} ${y - 1} Q ${x} ${y + w * 0.12} ${x - w / 2} ${y - 1} Z`} fill={MOUTH_FILL} style={{ strokeWidth: 2.5 }} />
        <path d={`M ${x - w * 0.22} ${y + w * 0.36} Q ${x} ${y + w * 0.22} ${x + w * 0.22} ${y + w * 0.36} Q ${x} ${y + w * 0.5} ${x - w * 0.22} ${y + w * 0.36} Z`} fill="#E8747C" />
      </g>
    );
  }
  if (state === "wrong") {
    return <path className="bb-l" d={`M ${x - w / 2} ${y + 4} Q ${x - w / 4} ${y} ${x} ${y + 2} Q ${x + w / 4} ${y + 4} ${x + w / 2} ${y}`} style={{ strokeWidth: 2.5 }} />;
  }
  if (state === "thinking") {
    return <ellipse className="bb-k" cx={x + w * 0.22} cy={y + 2} rx="2.6" ry="3.2" fill={MOUTH_FILL} style={{ strokeWidth: 2 }} />;
  }
  if (state === "surprised") {
    return <ellipse className="bb-k" cx={x} cy={y + 2} rx={w * 0.17} ry={w * 0.22} fill={MOUTH_FILL} style={{ strokeWidth: 2.5 }} />;
  }
  return <path className="bb-l" d={`M ${x - w / 2} ${y} Q ${x} ${y + w * 0.38} ${x + w / 2} ${y}`} style={{ strokeWidth: 2.5 }} />;
}

// Which of the 20 states get the fuller, 4-star burst instead of the
// plain 3-star "correct" sparkle — the session/milestone-level moments.
const BIG_SPARK_STATES = new Set(["win", "perfect", "rankUp"]);

function Fx({ sprite, state }) {
  const [tx, ty] = sprite.top;
  const [sx, sy] = sprite.sweat;
  const star = "M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z";
  // "win" and friends get a 4th, bigger star and more spread — a fuller
  // burst than the single-question "correct" sparkle — rather than a
  // whole separate asset, since it's the same celebration, just louder.
  const big = BIG_SPARK_STATES.has(state);
  // A flawless run earns an actual new accent: a small crown, not just a
  // bigger sparkle — the one state that gets its own unique prop.
  const crown = "M-13 1 L-9 -8 L-3 -1 L0 -11 L3 -1 L9 -8 L13 1 L11 6 L-11 6 Z";
  return (
    <>
      <g className="bb-fx bb-fx--spark">
        <path className="bb-star" d={star} transform={`translate(${tx - 54} ${ty + 30}) scale(${big ? 1.15 : 1})`} fill="#FFD84D" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path className="bb-star bb-star--b" d={star} transform={`translate(${tx + 56} ${ty + 18}) scale(${big ? 0.95 : 0.8})`} fill="#7CF7FF" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path className="bb-star bb-star--c" d={star} transform={`translate(${tx + 6} ${ty - 6}) scale(${big ? 0.8 : 0.65})`} fill="#FF7AB8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {big && (
          <path className="bb-star bb-star--d" d={star} transform={`translate(${tx} ${ty + 36}) scale(0.7)`} fill="#A3FF7A" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        )}
      </g>
      <g className="bb-fx bb-fx--sweat">
        {/* Same drop shape doubles as a worried sweat bead ("wrong"/
            "rankDown") or a falling tear ("lose") — just recolored/
            retimed by CSS so one small, well-tuned asset covers both
            without a second drawing. */}
        <path d={`M ${sx} ${sy} Q ${sx + 7} ${sy + 11} ${sx} ${sy + 15} Q ${sx - 7} ${sy + 11} ${sx} ${sy} Z`} fill="#7CC8FF" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <g className="bb-fx bb-fx--think">
        <circle cx={tx + 46} cy={ty + 26} r="4" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
        <circle cx={tx + 58} cy={ty + 14} r="5.5" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
        <circle cx={tx + 74} cy={ty} r="8" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
      </g>
      <g className="bb-fx bb-fx--crown">
        <path d={crown} transform={`translate(100 ${ty - 10}) scale(0.8)`} fill="#FFD84D" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>
    </>
  );
}

export default function ByteBornSprite({ id, state = "idle", showFx = true, label }) {
  const sprite = SPRITES[id] ?? SPRITES.pixel;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const g = {};
  for (const key of Object.keys(sprite.grads)) g[key] = `url(#${uid}${key})`;

  // The literal `state` still drives data-state (so CSS can give "win"/
  // "lose" their own, bigger animation) — only face/mouth rendering below
  // looks at the aliased version.
  const faceState = FACE_STATE_ALIAS[state] ?? state;
  const FaceKind = FACES[sprite.face.kind] ?? EyesFace;
  const piv = sprite.pivots;
  const origin = (p) => (p ? { transformOrigin: `${p[0]}px ${p[1]}px` } : undefined);

  const arms = (
    <>
      {sprite.armL && <g className="bb-arm bb-arm--l" style={origin(piv.armL)}>{sprite.armL(g)}</g>}
      {sprite.armR && <g className="bb-arm bb-arm--r" style={origin(piv.armR)}>{sprite.armR(g)}</g>}
    </>
  );

  return (
    <svg
      className="bb"
      data-char={id}
      data-state={state}
      viewBox="-12 -16 224 258"
      role="img"
      aria-label={label}
      style={{ "--raise": `${sprite.raise ?? 140}deg` }}
    >
      <defs>
        {Object.entries(sprite.grads).map(([key, spec]) => (
          <Gradient key={key} id={`${uid}${key}`} spec={spec} />
        ))}
      </defs>
      <ellipse className="bb-shadow" cx="100" cy="229" rx="62" ry="8" />
      <g className="bb-figure">
        {sprite.back && <g className="bb-back">{sprite.back(g)}</g>}
        {!sprite.armsFront && arms}
        {sprite.body(g)}
        {sprite.armsFront && arms}
        <g className="bb-head" style={origin(piv.head)}>
          {sprite.head(g)}
          <FaceKind f={sprite.face} state={faceState} />
          {sprite.face.kind === "eyes" && <Brows f={sprite.face} state={faceState} />}
          <Mouth m={sprite.mouth} state={faceState} />
          {sprite.over && sprite.over(g)}
        </g>
      </g>
      {sprite.extra && sprite.extra(g)}
      {showFx && <Fx sprite={sprite} state={state} />}
    </svg>
  );
}

export const BYTEBORN_IDS = Object.keys(SPRITES);

// The canonical, ordered list of all 20 states (see the top comment) — a
// single source of truth so nothing else (the roster preview, a future
// debug screen) has to re-type this list and risk drifting from it.
export const ALL_STATES = [
  "idle",
  "thinking",
  "correct",
  "wrong",
  "win",
  "lose",
  "perfect",
  "streak",
  "rankUp",
  "rankDown",
  "shielded",
  "greet",
  "hype",
  "waiting",
  "surprised",
  "sleepy",
  "laughing",
  "confused",
  "determined",
  "cheer",
];

// A parametric, reskinnable SVG "rig" for the character roster. One shared
// body/arm/leg/face skeleton is reused for every character; each character
// reskins it via body type, hairstyle, clothing, accessory and color
// config (see src/data/characters.js), and gets its own movement
// signature through CSS custom properties (--idle-amp, --correct-dur,
// etc.) so no animation code is duplicated per character — only the
// numbers differ. State (idle / correct / wrong / thinking) is driven by
// a data-state attribute that CSS keyframes in App.css key off of.

const BODY_TYPES = {
  lean: {
    headR: 13, headCy: 26,
    neckW: 7,
    torsoY: 46, torsoH: 46, torsoW: 27,
    armW: 8, armLen: 48,
    hipY: 92, legW: 11, legLen: 62,
    heightScale: 1.06,
  },
  average: {
    headR: 16, headCy: 32,
    neckW: 9,
    torsoY: 54, torsoH: 52, torsoW: 38,
    armW: 10, armLen: 44,
    hipY: 106, legW: 13, legLen: 50,
    heightScale: 1,
  },
  sturdy: {
    headR: 19, headCy: 39,
    neckW: 11,
    torsoY: 63, torsoH: 52, torsoW: 52,
    armW: 13, armLen: 37,
    hipY: 115, legW: 16, legLen: 39,
    heightScale: 0.94,
  },
};

function getLayout(bodyKey) {
  const bt = BODY_TYPES[bodyKey] || BODY_TYPES.average;
  const cx = 60;
  const torsoX = cx - bt.torsoW / 2;
  const torsoRight = cx + bt.torsoW / 2;
  const hipLX = torsoX + bt.torsoW * 0.1;
  const hipRX = torsoRight - bt.torsoW * 0.1 - bt.legW;
  return {
    ...bt,
    cx,
    torsoX,
    torsoRight,
    shoulderY: bt.torsoY + bt.torsoH * 0.1,
    armLX: torsoX - bt.armW * 0.55,
    armRX: torsoRight - bt.armW * 0.45,
    hipLX,
    hipRX,
    feetY: bt.hipY + bt.legLen,
    eyeR: Math.max(1.8, bt.headR * 0.12),
    pupilR: Math.max(1, bt.headR * 0.06),
    eyeLX: cx - bt.headR * 0.42,
    eyeRX: cx + bt.headR * 0.42,
    eyeY: bt.headCy - bt.headR * 0.04,
    mouthCy: bt.headCy + bt.headR * 0.52,
    neckTop: bt.headCy + bt.headR - 3,
  };
}

// --- Hair ------------------------------------------------------------

const HAIR = {
  short: {
    front: (L, color) => (
      <path
        d={`M ${L.cx - L.headR - 1} ${L.headCy - 1}
            A ${L.headR + 2} ${L.headR + 2} 0 0 1 ${L.cx + L.headR + 1} ${L.headCy - 1}
            L ${L.cx + L.headR - 1} ${L.headCy - L.headR * 0.4}
            A ${L.headR - 1} ${L.headR - 1} 0 0 0 ${L.cx - L.headR + 1} ${L.headCy - L.headR * 0.4}
            Z`}
        fill={color}
      />
    ),
  },
  bald: {
    front: (L) => (
      <ellipse
        cx={L.cx - L.headR * 0.3}
        cy={L.headCy - L.headR * 0.55}
        rx={L.headR * 0.22}
        ry={L.headR * 0.12}
        fill="#fff"
        opacity="0.35"
      />
    ),
  },
  pony: {
    back: (L, color) => (
      <path
        d={`M ${L.cx + L.headR - 2} ${L.headCy - L.headR * 0.5}
            Q ${L.cx + L.headR + 16} ${L.headCy + 6} ${L.cx + L.headR + 6} ${L.headCy + L.headR + 20}
            Q ${L.cx + L.headR - 2} ${L.headCy + L.headR + 14} ${L.cx + L.headR - 6} ${L.headCy + L.headR * 0.6}
            Z`}
        fill={color}
      />
    ),
    front: (L, color) => (
      <path
        d={`M ${L.cx - L.headR - 1} ${L.headCy - 2}
            A ${L.headR + 2} ${L.headR + 2} 0 0 1 ${L.cx + L.headR + 1} ${L.headCy - 2}
            L ${L.cx + L.headR - 2} ${L.headCy - L.headR * 0.5}
            A ${L.headR - 1} ${L.headR - 1} 0 0 0 ${L.cx - L.headR + 2} ${L.headCy - L.headR * 0.5}
            Z`}
        fill={color}
      />
    ),
  },
  afro: {
    back: (L, color) => (
      <circle cx={L.cx} cy={L.headCy - 1} r={L.headR * 1.42} fill={color} />
    ),
  },
  bob: {
    front: (L, color) => (
      <path
        d={`M ${L.cx - L.headR - 2} ${L.headCy - L.headR * 0.3}
            A ${L.headR + 2} ${L.headR + 2} 0 0 1 ${L.cx + L.headR + 2} ${L.headCy - L.headR * 0.3}
            L ${L.cx + L.headR + 2} ${L.headCy + L.headR * 0.75}
            Q ${L.cx + L.headR - 2} ${L.headCy + L.headR * 0.5} ${L.cx + L.headR - 5} ${L.headCy + L.headR * 0.75}
            L ${L.cx - L.headR + 5} ${L.headCy + L.headR * 0.75}
            Q ${L.cx - L.headR - 2} ${L.headCy + L.headR * 0.5} ${L.cx - L.headR - 2} ${L.headCy + L.headR * 0.75}
            Z`}
        fill={color}
      />
    ),
  },
  mohawk: {
    front: (L, color) => (
      <path
        d={`M ${L.cx - L.headR * 0.16} ${L.headCy - L.headR * 1.5}
            L ${L.cx + L.headR * 0.16} ${L.headCy - L.headR * 1.5}
            L ${L.cx + L.headR * 0.22} ${L.headCy - L.headR * 0.3}
            L ${L.cx - L.headR * 0.22} ${L.headCy - L.headR * 0.3}
            Z`}
        fill={color}
      />
    ),
  },
  bun: {
    back: (L, color) => (
      <circle cx={L.cx} cy={L.headCy - L.headR * 1.35} r={L.headR * 0.38} fill={color} />
    ),
    front: (L, color) => (
      <path
        d={`M ${L.cx - L.headR - 1} ${L.headCy - 1}
            A ${L.headR + 2} ${L.headR + 2} 0 0 1 ${L.cx + L.headR + 1} ${L.headCy - 1}
            L ${L.cx + L.headR - 1} ${L.headCy - L.headR * 0.45}
            A ${L.headR - 1} ${L.headR - 1} 0 0 0 ${L.cx - L.headR + 1} ${L.headCy - L.headR * 0.45}
            Z`}
        fill={color}
      />
    ),
  },
  curly: {
    back: (L, color) => (
      <g fill={color}>
        {[-0.85, -0.5, -0.15, 0.2, 0.55, 0.85].map((t, i) => (
          <circle
            key={i}
            cx={L.cx + t * L.headR * 1.25}
            cy={L.headCy - L.headR * (0.75 - Math.abs(t) * 0.35)}
            r={L.headR * 0.38}
          />
        ))}
      </g>
    ),
  },
  sidePart: {
    front: (L, color) => (
      <path
        d={`M ${L.cx - L.headR - 1} ${L.headCy - 2}
            A ${L.headR + 2} ${L.headR + 2} 0 0 1 ${L.cx + L.headR + 1} ${L.headCy - 2}
            L ${L.cx + L.headR - 1} ${L.headCy - L.headR * 0.55}
            L ${L.cx + L.headR * 0.15} ${L.headCy - L.headR * 0.75}
            L ${L.cx - L.headR + 1} ${L.headCy - L.headR * 0.4}
            Z`}
        fill={color}
      />
    ),
  },
};

// --- Clothing ----------------------------------------------------------

const CLOTHING = {
  trenchCoat: (L, ink) => (
    <g>
      <rect x={L.torsoX - 1} y={L.torsoY + 4} width={L.torsoW + 2} height={L.torsoH - 2} rx={L.torsoW * 0.22} fill="none" stroke={ink} strokeWidth="1.6" opacity="0.55" />
      <line x1={L.cx} y1={L.torsoY + 4} x2={L.cx} y2={L.torsoY + L.torsoH} stroke={ink} strokeWidth="1.6" opacity="0.55" />
      <rect x={L.torsoX + 2} y={L.torsoY + L.torsoH * 0.55} width={L.torsoW - 4} height="4" rx="2" fill={ink} opacity="0.5" />
    </g>
  ),
  trenchCoatRich: (L, ink) => (
    <g>
      <path d={`M ${L.cx - L.torsoW * 0.28} ${L.torsoY + 3} L ${L.cx - L.torsoW * 0.05} ${L.torsoY + L.torsoH * 0.28} L ${L.cx - L.torsoW * 0.32} ${L.torsoY + L.torsoH * 0.24} Z`} fill={ink} opacity="0.5" />
      <path d={`M ${L.cx + L.torsoW * 0.28} ${L.torsoY + 3} L ${L.cx + L.torsoW * 0.05} ${L.torsoY + L.torsoH * 0.28} L ${L.cx + L.torsoW * 0.32} ${L.torsoY + L.torsoH * 0.24} Z`} fill={ink} opacity="0.5" />
      <line x1={L.cx} y1={L.torsoY + 4} x2={L.cx} y2={L.torsoY + L.torsoH} stroke={ink} strokeWidth="1.6" opacity="0.55" />
      <rect x={L.torsoX + 1} y={L.torsoY + L.torsoH * 0.58} width={L.torsoW - 2} height="5" rx="2.5" fill={ink} opacity="0.6" />
      <rect x={L.cx - 3} y={L.torsoY + L.torsoH * 0.58} width="6" height="5" rx="1.5" fill={ink} opacity="0.85" />
    </g>
  ),
  glowCoat: (L, ink, secondary) => (
    <g>
      <rect x={L.torsoX - 1} y={L.torsoY + 4} width={L.torsoW + 2} height={L.torsoH - 2} rx={L.torsoW * 0.22} fill="none" stroke={secondary} strokeWidth="1.8" opacity="0.85" className="char-rig__glow-edge" />
      <line x1={L.cx} y1={L.torsoY + 4} x2={L.cx} y2={L.torsoY + L.torsoH} stroke={secondary} strokeWidth="1.4" opacity="0.7" />
    </g>
  ),
  trackJacket: (L, ink) => (
    <g>
      <line x1={L.cx} y1={L.torsoY + 3} x2={L.cx} y2={L.torsoY + L.torsoH - 3} stroke={ink} strokeWidth="2" opacity="0.6" />
      <rect x={L.torsoX - 1} y={L.torsoY + L.torsoH * 0.15} width={L.torsoW + 2} height="4" rx="2" fill={ink} opacity="0.45" />
    </g>
  ),
  blazer: (L, ink) => (
    <g>
      <path d={`M ${L.cx - L.torsoW * 0.22} ${L.torsoY + 3} L ${L.cx - L.torsoW * 0.02} ${L.torsoY + L.torsoH * 0.4} L ${L.cx - L.torsoW * 0.3} ${L.torsoY + L.torsoH * 0.22} Z`} fill={ink} opacity="0.55" />
      <path d={`M ${L.cx + L.torsoW * 0.22} ${L.torsoY + 3} L ${L.cx + L.torsoW * 0.02} ${L.torsoY + L.torsoH * 0.4} L ${L.cx + L.torsoW * 0.3} ${L.torsoY + L.torsoH * 0.22} Z`} fill={ink} opacity="0.55" />
      {[0.5, 0.65, 0.8].map((t, i) => (
        <circle key={i} cx={L.cx} cy={L.torsoY + L.torsoH * t} r="1.6" fill={ink} opacity="0.6" />
      ))}
    </g>
  ),
  apron: (L, ink) => (
    <g>
      <path
        d={`M ${L.cx - L.torsoW * 0.3} ${L.torsoY + L.torsoH * 0.2}
            L ${L.cx + L.torsoW * 0.3} ${L.torsoY + L.torsoH * 0.2}
            L ${L.cx + L.torsoW * 0.4} ${L.torsoY + L.torsoH}
            L ${L.cx - L.torsoW * 0.4} ${L.torsoY + L.torsoH}
            Z`}
        fill={ink}
        opacity="0.4"
      />
      <rect x={L.cx - L.torsoW * 0.16} y={L.torsoY + L.torsoH * 0.5} width={L.torsoW * 0.32} height={L.torsoH * 0.2} rx="2" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.6" />
      <line x1={L.cx - L.torsoW * 0.28} y1={L.torsoY + L.torsoH * 0.2} x2={L.torsoX} y2={L.torsoY + 2} stroke={ink} strokeWidth="1.3" opacity="0.55" />
      <line x1={L.cx + L.torsoW * 0.28} y1={L.torsoY + L.torsoH * 0.2} x2={L.torsoRight} y2={L.torsoY + 2} stroke={ink} strokeWidth="1.3" opacity="0.55" />
    </g>
  ),
  vestArmor: (L, ink) => (
    <g>
      <path d={`M ${L.torsoX} ${L.torsoY + 4} L ${L.cx} ${L.torsoY + L.torsoH * 0.5} L ${L.torsoRight} ${L.torsoY + 4} L ${L.torsoRight} ${L.torsoY + L.torsoH} L ${L.torsoX} ${L.torsoY + L.torsoH} Z`} fill={ink} opacity="0.3" />
      <rect x={L.torsoX - 2} y={L.shoulderY - 2} width={L.torsoW * 0.28} height="6" rx="3" fill={ink} opacity="0.55" />
      <rect x={L.torsoRight - L.torsoW * 0.28 + 2} y={L.shoulderY - 2} width={L.torsoW * 0.28} height="6" rx="3" fill={ink} opacity="0.55" />
    </g>
  ),
  cardigan: (L, ink) => (
    <g>
      <path d={`M ${L.cx - L.torsoW * 0.12} ${L.torsoY + 3} L ${L.cx} ${L.torsoY + L.torsoH * 0.45} L ${L.cx + L.torsoW * 0.12} ${L.torsoY + 3}`} fill="none" stroke={ink} strokeWidth="1.6" opacity="0.55" />
      {[0.5, 0.68, 0.86].map((t, i) => (
        <circle key={i} cx={L.cx} cy={L.torsoY + L.torsoH * t} r="1.5" fill={ink} opacity="0.6" />
      ))}
    </g>
  ),
  patchwork: (L, ink) => (
    <g opacity="0.55">
      <rect x={L.torsoX + 2} y={L.torsoY + 6} width="8" height="7" fill={ink} transform={`rotate(-8 ${L.torsoX + 6} ${L.torsoY + 9})`} />
      <rect x={L.torsoRight - 12} y={L.torsoY + 14} width="9" height="8" fill={ink} transform={`rotate(6 ${L.torsoRight - 8} ${L.torsoY + 18})`} />
      <rect x={L.cx - 5} y={L.torsoY + L.torsoH - 16} width="9" height="8" fill={ink} transform={`rotate(-4 ${L.cx} ${L.torsoY + L.torsoH - 12})`} />
    </g>
  ),
  architectVest: (L, ink) => (
    <g>
      <line x1={L.torsoX + 2} y1={L.torsoY + L.torsoH * 0.2} x2={L.torsoRight - 2} y2={L.torsoY + L.torsoH * 0.8} stroke={ink} strokeWidth="1.4" opacity="0.45" strokeDasharray="2.5 2" />
      <rect x={L.torsoRight - L.torsoW * 0.3} y={L.torsoY + L.torsoH * 0.35} width="4" height={L.torsoH * 0.32} rx="1.5" fill={ink} opacity="0.6" />
    </g>
  ),
};

// --- Accessories (chest/face-mounted, never hand-held, so they never
// fight the arm-swing animation) ---------------------------------------

const ACCESSORY = {
  lens: (L, ink) => (
    <g transform={`translate(${L.torsoRight - L.torsoW * 0.12} ${L.torsoY + L.torsoH * 0.35}) rotate(20)`}>
      <circle r="5" fill="none" stroke={ink} strokeWidth="1.8" />
      <line x1="3.6" y1="3.6" x2="8" y2="8" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
  lensBig: (L, ink) => (
    <g transform={`translate(${L.torsoRight - L.torsoW * 0.14} ${L.torsoY + L.torsoH * 0.4}) rotate(18)`}>
      <circle r="7" fill="none" stroke={ink} strokeWidth="2" />
      <line x1="5" y1="5" x2="10.5" y2="10.5" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  lensGlow: (L, ink) => (
    <g className="char-rig__accessory-glow" transform={`translate(${L.torsoRight - L.torsoW * 0.12} ${L.torsoY + L.torsoH * 0.35}) rotate(20)`}>
      <circle r="5.5" fill="none" stroke={ink} strokeWidth="2" />
      <line x1="3.8" y1="3.8" x2="8.5" y2="8.5" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  bolt: (L, ink) => (
    <path
      transform={`translate(${L.cx - 4} ${L.torsoY + L.torsoH * 0.28})`}
      d="M6 0 L1 8 L4.5 8 L2.5 16 L9 6.5 L5.2 6.5 Z"
      fill={ink}
    />
  ),
  glasses: (L, ink) => (
    <g>
      <circle cx={L.eyeLX} cy={L.eyeY} r={L.eyeR + 2} fill="none" stroke={ink} strokeWidth="1.3" />
      <circle cx={L.eyeRX} cy={L.eyeY} r={L.eyeR + 2} fill="none" stroke={ink} strokeWidth="1.3" />
      <line x1={L.eyeLX + L.eyeR + 2} y1={L.eyeY} x2={L.eyeRX - L.eyeR - 2} y2={L.eyeY} stroke={ink} strokeWidth="1.3" />
    </g>
  ),
  scissors: (L, ink) => (
    <g transform={`translate(${L.cx} ${L.torsoY + L.torsoH * 0.35}) rotate(-25)`}>
      <ellipse cx="-3" cy="0" rx="3" ry="1.8" fill="none" stroke={ink} strokeWidth="1.3" />
      <ellipse cx="3" cy="0" rx="3" ry="1.8" fill="none" stroke={ink} strokeWidth="1.3" />
      <line x1="0" y1="0" x2="9" y2="6" stroke={ink} strokeWidth="1.3" />
      <line x1="0" y1="0" x2="9" y2="-2" stroke={ink} strokeWidth="1.3" />
    </g>
  ),
  shield: (L, ink) => (
    <path
      transform={`translate(${L.cx - 5} ${L.torsoY + L.torsoH * 0.28})`}
      d="M5 0 L10 2 V7 C10 11 7.5 13.5 5 15 C2.5 13.5 0 11 0 7 V2 Z"
      fill="none"
      stroke={ink}
      strokeWidth="1.5"
    />
  ),
  links: (L, ink) => (
    <g fill="none" stroke={ink} strokeWidth="1.5">
      <ellipse cx={L.cx - 4} cy={L.torsoY + L.torsoH * 0.35} rx="3.4" ry="2.4" />
      <ellipse cx={L.cx + 1.5} cy={L.torsoY + L.torsoH * 0.35} rx="3.4" ry="2.4" />
      <ellipse cx={L.cx + 7} cy={L.torsoY + L.torsoH * 0.35} rx="3.4" ry="2.4" />
    </g>
  ),
  glitch: (L, ink, secondary) => (
    <g className="char-rig__glitch-blocks" opacity="0.85">
      <rect x={L.cx - 8} y={L.torsoY + L.torsoH * 0.22} width="6" height="3" fill={ink} />
      <rect x={L.cx + 1} y={L.torsoY + L.torsoH * 0.32} width="7" height="2.4" fill={secondary} />
      <rect x={L.cx - 3} y={L.torsoY + L.torsoH * 0.45} width="5" height="2.4" fill={ink} />
    </g>
  ),
  compass: (L, ink) => (
    <g transform={`translate(${L.cx} ${L.torsoY + L.torsoH * 0.35})`}>
      <circle r="6" fill="none" stroke={ink} strokeWidth="1.3" />
      <line x1="0" y1="0" x2="3.5" y2="-4.5" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="0" y1="0" x2="-2.5" y2="4.5" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
      <circle r="1" fill={ink} />
    </g>
  ),
};

const MOUTHS = {
  idle: (L) => `M ${L.cx - 4} ${L.mouthCy} Q ${L.cx} ${L.mouthCy + 2.5} ${L.cx + 4} ${L.mouthCy}`,
  correct: (L) => `M ${L.cx - 5} ${L.mouthCy - 1} Q ${L.cx} ${L.mouthCy + 6} ${L.cx + 5} ${L.mouthCy - 1} Q ${L.cx} ${L.mouthCy + 3} ${L.cx - 5} ${L.mouthCy - 1}`,
  wrong: (L) => `M ${L.cx - 4} ${L.mouthCy + 2} Q ${L.cx} ${L.mouthCy - 2} ${L.cx + 4} ${L.mouthCy + 2}`,
  thinking: (L) => `M ${L.cx - 2} ${L.mouthCy} h 4`,
};

export default function CharacterRig({ character, state = "idle", showSparkles = true }) {
  const L = getLayout(character.body);
  const hair = HAIR[character.hair] || HAIR.short;
  const clothing = CLOTHING[character.clothing] || CLOTHING.trenchCoat;
  const accessory = ACCESSORY[character.accessory] || ACCESSORY.lens;
  const mouthD = (MOUTHS[state] || MOUTHS.idle)(L);

  const style = {
    "--char-primary": character.primary,
    "--char-secondary": character.secondary,
    "--char-ink": character.ink,
    "--char-hair": character.hairColor,
    "--char-skin": character.skin,
    "--idle-amp": character.vars.idleAmp,
    "--idle-dur": character.vars.idleDur,
    "--idle-ease": character.vars.idleEase || "ease-in-out",
    "--correct-amp": character.vars.correctAmp,
    "--correct-dur": character.vars.correctDur,
    "--wrong-amp": character.vars.wrongAmp,
    "--wrong-rot": character.vars.wrongRot,
    "--wrong-dur": character.vars.wrongDur,
    "--think-amp": character.vars.thinkAmp,
    "--think-dur": character.vars.thinkDur,
    "--think-ease": character.vars.thinkEase || "ease-in-out",
    "--arm-sway": character.vars.armSway,
    "--arm-raise": character.vars.armRaise,
  };

  return (
    <div className="char-rig" data-move={character.move} data-state={state} style={style}>
      <svg viewBox="0 0 120 170" className="char-rig__svg" role="img" aria-label={character.name}>
        <ellipse
          className="char-rig__shadow"
          cx="60"
          cy={L.feetY + 7}
          rx={L.torsoW * 0.62 * L.heightScale}
          ry="4.5"
        />
        <g
          className="char-rig__figure"
          transform={`translate(60 ${L.feetY + 8}) scale(${L.heightScale}) translate(-60 ${-(L.feetY + 8)})`}
        >
          <g className="char-rig__arm-right" style={{ transformOrigin: `${L.armRX + L.armW / 2}px ${L.shoulderY}px` }}>
            <rect x={L.armRX} y={L.shoulderY} width={L.armW} height={L.armLen} rx={L.armW / 2} fill="var(--char-skin)" />
          </g>

          <rect x={L.hipLX} y={L.hipY} width={L.legW} height={L.legLen} rx={L.legW / 3} fill="var(--char-ink)" opacity="0.85" />
          <rect x={L.hipRX} y={L.hipY} width={L.legW} height={L.legLen} rx={L.legW / 3} fill="var(--char-ink)" opacity="0.85" />
          <ellipse cx={L.hipLX + L.legW / 2} cy={L.feetY + 2} rx={L.legW * 0.65} ry="3.5" fill="var(--char-secondary)" />
          <ellipse cx={L.hipRX + L.legW / 2} cy={L.feetY + 2} rx={L.legW * 0.65} ry="3.5" fill="var(--char-secondary)" />

          <rect x={L.torsoX} y={L.torsoY} width={L.torsoW} height={L.torsoH} rx={L.torsoW * 0.24} fill="var(--char-primary)" />
          {clothing(L, "var(--char-ink)", "var(--char-secondary)")}

          <g className="char-rig__arm-left" style={{ transformOrigin: `${L.armLX + L.armW / 2}px ${L.shoulderY}px` }}>
            <rect x={L.armLX} y={L.shoulderY} width={L.armW} height={L.armLen} rx={L.armW / 2} fill="var(--char-skin)" />
          </g>

          <rect x={L.cx - L.neckW / 2} y={L.neckTop} width={L.neckW} height={L.torsoY - L.neckTop + 4} fill="var(--char-skin)" />

          {hair.back && hair.back(L, "var(--char-hair)")}
          <circle cx={L.cx} cy={L.headCy} r={L.headR} fill="var(--char-skin)" />
          {hair.front && hair.front(L, "var(--char-hair)")}

          <circle cx={L.eyeLX} cy={L.eyeY} r={L.eyeR} fill="#fff" />
          <circle cx={L.eyeRX} cy={L.eyeY} r={L.eyeR} fill="#fff" />
          <circle className="char-rig__pupil" cx={L.eyeLX} cy={L.eyeY} r={L.pupilR} fill="#2b2417" />
          <circle className="char-rig__pupil" cx={L.eyeRX} cy={L.eyeY} r={L.pupilR} fill="#2b2417" />

          <path className="char-rig__mouth" d={mouthD} stroke="#2b2417" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          <g className="char-rig__accessory">{accessory(L, "var(--char-ink)", "var(--char-secondary)")}</g>

          <g className="char-rig__think-dots">
            <circle cx={L.cx + L.headR + 6} cy={L.headCy - L.headR - 4} r="2.4" />
            <circle cx={L.cx + L.headR + 13} cy={L.headCy - L.headR - 10} r="2" />
            <circle cx={L.cx + L.headR + 19} cy={L.headCy - L.headR - 16} r="1.6" />
          </g>
        </g>

        {showSparkles && (
          <g className="char-rig__sparkles">
            <path className="char-rig__spark" d="M60 8 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 Z" transform="translate(-8 -2)" />
            <path className="char-rig__spark char-rig__spark--b" d="M60 8 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 Z" transform="translate(26 6)" />
            <path className="char-rig__spark char-rig__spark--c" d="M60 8 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 Z" transform="translate(8 -14) scale(0.7)" />
          </g>
        )}
      </svg>
    </div>
  );
}

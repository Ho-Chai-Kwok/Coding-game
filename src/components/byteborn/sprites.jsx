// Front-view art for the 12 Byteborn, split into animatable parts.
//
// Each sprite is drawn in a 200 x 240 box (ground at y = 228) and is made of:
//   back   - drawn behind everything (capes, tails, scarves)
//   armL / armR - rotate around `pivots.armL / armR` for cheering etc.
//   body   - torso, legs, props that never move on their own
//   head   - tilts around `pivots.head`; eyes/mouth are NOT drawn here,
//            ByteBornSprite draws them from `face` so they can change per state
//   over   - drawn on top of the face (hat brims that shade the eyes)
//   extra  - floating bits outside the figure (sparkle dust, debris)
// `g` maps each gradient key to a unique url(#...) for this instance, so many
// copies of the same character can sit on one page safely.

const k = "bb-k";
const l = "bb-l";
const hl = "bb-hl";
const INK = "#1B1530";

export const SPRITES = {
  // 01 ------------------------------------------------------------------
  pixel: {
    grads: {
      a: ["#9BF5D0", "#4FE0A8", "#2FA97E"],
      b: ["#FFFFFF", "#F6EED8", "#D4C7A6"],
      c: ["#FFB27A", "#FF8A3D", "#D9622A"],
    },
    pivots: { head: [100, 146], armL: [62, 158], armR: [138, 158] },
    raise: 150,
    top: [100, 4],
    sweat: [156, 58],
    armL: (g) => (
      <>
        <rect className={k} x="48" y="156" width="18" height="38" rx="9" transform="rotate(14 57 175)" fill={g.a} />
        <circle className={k} cx="50" cy="197" r="10" fill={g.b} />
      </>
    ),
    armR: (g) => (
      <>
        <rect className={k} x="134" y="156" width="18" height="38" rx="9" transform="rotate(-14 143 175)" fill={g.a} />
        <circle className={k} cx="150" cy="197" r="10" fill={g.b} />
      </>
    ),
    body: (g) => (
      <>
        <path className={k} d="M70 228 Q68 208 84 206 Q97 206 97 216 L97 228 Z" fill={g.c} />
        <path className={k} d="M130 228 Q132 208 116 206 Q103 206 103 216 L103 228 Z" fill={g.c} />
        <path className={l} d="M72 221 H96 M104 221 H128" style={{ strokeWidth: 2.5 }} />
        <rect className={k} x="66" y="146" width="68" height="64" rx="22" fill={g.a} />
        <rect className={k} x="80" y="160" width="40" height="30" rx="8" fill="#E9FFF6" style={{ strokeWidth: 2.5 }} />
        <circle cx="90" cy="175" r="4.5" fill="#FF5A6E" />
        <circle cx="100" cy="175" r="4.5" fill="#FFD84D" />
        <circle cx="110" cy="175" r="4.5" fill="#5AA9FF" />
        <path className={k} d="M70 140 L58 178 L70 174 L74 184 L82 144 Z" fill={g.c} />
        <path className={k} d="M62 146 Q100 162 138 146 L136 134 Q100 148 64 134 Z" fill={g.c} />
      </>
    ),
    head: (g) => (
      <>
        <path className={l} d="M100 22 V46" />
        <g className="bb-blinker">
          <rect className={k} x="93" y="6" width="14" height="18" rx="3" fill="#FFD84D" />
          <rect x="96" y="9" width="4" height="6" fill="#FFFFFF" />
        </g>
        <rect className={k} x="36" y="44" width="128" height="100" rx="24" fill={g.b} />
        <path className={hl} d="M50 52 Q62 48 92 48" />
        <rect className={k} x="48" y="56" width="104" height="76" rx="14" fill="#12304A" style={{ strokeWidth: 3 }} />
        <path d="M52 72 H148 M52 84 H148 M52 96 H148 M52 108 H148 M52 120 H148" stroke="#1C4565" strokeWidth="2" />
        <path d="M56 64 Q60 60 78 60 L62 86 Z" fill="#FFFFFF" opacity="0.12" />
        <rect x="56" y="106" width="12" height="6" rx="2" fill="#FF7AB8" opacity="0.85" />
        <rect x="132" y="106" width="12" height="6" rx="2" fill="#FF7AB8" opacity="0.85" />
        <rect x="84" y="134" width="32" height="6" rx="3" fill="#D4C7A6" />
        <circle cx="140" cy="137" r="3.5" fill="#FF8A3D" />
        <circle cx="128" cy="137" r="3.5" fill="#4FE0A8" />
      </>
    ),
    face: { kind: "pixel", eyes: [[76, 89], [124, 89]], w: 20, h: 26, color: "#7CF7FF" },
    mouth: { kind: "pixel", x: 100, y: 113, w: 20, color: "#7CF7FF" },
  },

  // 02 ------------------------------------------------------------------
  vex: {
    grads: {
      a: ["#5B49A0", "#3B2D6B", "#241A47"],
      b: ["#FF86B6", "#FF3D8B", "#C41E64"],
    },
    pivots: { head: [100, 104], armL: [76, 118], armR: [124, 118] },
    raise: 150,
    top: [100, 4],
    sweat: [146, 40],
    back: (g) => (
      <>
        <path className={k} d="M122 104 Q160 94 180 118 L170 126 Q156 110 124 116 Z" fill={g.b} />
        <path className={k} d="M120 112 Q150 118 166 144 L156 148 Q142 126 118 120 Z" fill={g.b} />
      </>
    ),
    armL: (g) => (
      <>
        <path className={k} d="M70 116 Q54 130 56 160 L70 160 Q70 138 82 124 Z" fill={g.a} />
        <g className="bb-spin" style={{ transformOrigin: "44px 170px" }}>
          <circle cx="44" cy="170" r="19" fill="none" stroke={INK} strokeWidth="11" />
          <circle cx="44" cy="170" r="19" fill="none" stroke="#C9D2E8" strokeWidth="6" />
          <circle cx="44" cy="170" r="19" fill="none" stroke="#4DF2FF" strokeWidth="2" />
          <path className={k} d="M56 150 L68 152 L60 162 Z" fill="#4DF2FF" style={{ strokeWidth: 2.5 }} />
        </g>
        <circle className={k} cx="62" cy="165" r="9" fill="#241A47" />
      </>
    ),
    armR: (g) => (
      <>
        <path className={k} d="M130 116 Q146 130 144 160 L130 160 Q130 138 118 124 Z" fill={g.a} />
        <g className="bb-spin bb-spin--rev" style={{ transformOrigin: "156px 170px" }}>
          <circle cx="156" cy="170" r="19" fill="none" stroke={INK} strokeWidth="11" />
          <circle cx="156" cy="170" r="19" fill="none" stroke="#C9D2E8" strokeWidth="6" />
          <circle cx="156" cy="170" r="19" fill="none" stroke="#4DF2FF" strokeWidth="2" />
          <path className={k} d="M144 150 L132 152 L140 162 Z" fill="#4DF2FF" style={{ strokeWidth: 2.5 }} />
        </g>
        <circle className={k} cx="138" cy="165" r="9" fill="#241A47" />
      </>
    ),
    body: (g) => (
      <>
        <path className={k} d="M70 228 Q70 214 82 212 L97 212 Q99 220 98 228 Z" fill="#241A47" />
        <path className={k} d="M130 228 Q130 214 118 212 L103 212 Q101 220 102 228 Z" fill="#241A47" />
        <path className={k} d="M80 214 L82 176 L98 176 L97 214 Z" fill={g.a} />
        <path className={k} d="M120 214 L118 176 L102 176 L103 214 Z" fill={g.a} />
        <path d="M82 188 L97 184 M82 198 L97 194 M81 208 L97 204 M118 188 L103 184 M118 198 L103 194 M119 208 L103 204" fill="none" stroke="#E8E2FF" strokeWidth="3" strokeLinecap="round" />
        <path className={k} d="M70 112 Q100 104 130 112 L124 178 Q100 186 76 178 Z" fill={g.a} />
        <path className={k} d="M74 118 L84 113 L126 166 L116 171 Z" fill={g.b} />
        <rect className={k} x="74" y="164" width="52" height="12" rx="5" fill="#241A47" />
        <circle className={k} cx="100" cy="170" r="9" fill="#4DF2FF" />
        <path className={l} d="M104 167 A5 5 0 1 0 104 173" style={{ strokeWidth: 2.5 }} />
        <path d="M103 164 L108 167 L103 170 Z" fill={INK} />
        <path className={k} d="M70 106 Q100 122 130 106 L128 92 Q100 106 72 92 Z" fill={g.b} />
      </>
    ),
    head: (g) => (
      <>
        <path className={k} d="M68 36 L58 6 L86 24 Z" fill={g.a} />
        <path className={k} d="M132 36 L142 6 L114 24 Z" fill={g.a} />
        <path className={k} d="M58 70 Q56 22 100 18 Q144 22 142 70 Q142 100 100 104 Q58 100 58 70 Z" fill={g.a} />
        <path className={k} d="M70 62 Q100 48 130 62 L128 88 Q100 98 72 88 Z" fill="#F0C9A6" style={{ strokeWidth: 3 }} />
        <path className={k} d="M71 76 Q100 84 129 76 L128 88 Q100 98 72 88 Z" fill="#241A47" style={{ strokeWidth: 3 }} />
        <path className={k} d="M66 58 Q100 50 134 58 L132 72 Q100 66 68 72 Z" fill="#4DF2FF" />
        <path d="M74 60 Q90 56 104 56" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
        <path className={l} d="M100 82 V95" style={{ strokeWidth: 2 }} />
        <path className={hl} d="M68 46 Q74 28 96 24" />
      </>
    ),
    face: { kind: "slit", eyes: [[87, 66], [113, 66]], w: 18, h: 6, color: "#FFFFFF" },
  },

  // 03 ------------------------------------------------------------------
  ifra: {
    grads: {
      a: ["#FFE68A", "#FFC93D", "#D49A14"],
      b: ["#7E9BF0", "#4A6FD8", "#2E4AA6"],
    },
    pivots: { head: [100, 104], armL: [52, 124], armR: [148, 164] },
    raise: 35,
    armsFront: true,
    top: [100, 0],
    sweat: [146, 48],
    armL: (g) => (
      <>
        <path className={k} d="M6 160 L40 122 L74 160 L40 210 Z" fill="#F4F1FF" />
        <path className={k} d="M18 160 L40 136 L62 160 L40 194 Z" fill={g.a} style={{ strokeWidth: 2.5 }} />
        <text x="40" y="171" textAnchor="middle" fontFamily="'Lilita One', 'Arial Black', sans-serif" fontSize="28" fill={INK}>?</text>
      </>
    ),
    armR: (g) => (
      <>
        <path className={k} d="M144 152 L144 92 L135 70 L141 67 L148 82 L155 67 L161 70 L152 92 L152 152 Z" fill="#EEF2FF" />
        <path d="M148 140 V96" fill="none" stroke="#9AA8D8" strokeWidth="2" />
        <rect className={k} x="133" y="148" width="30" height="8" rx="3" fill={g.a} />
        <rect className={k} x="145" y="156" width="6" height="16" fill="#2A2550" style={{ strokeWidth: 2.5 }} />
        <circle className={k} cx="148" cy="176" r="5" fill={g.a} style={{ strokeWidth: 2.5 }} />
        <circle className={k} cx="148" cy="164" r="10" fill={g.b} />
      </>
    ),
    body: (g) => (
      <>
        <rect className={k} x="76" y="174" width="22" height="34" rx="4" fill="#2A2550" />
        <rect className={k} x="102" y="174" width="22" height="34" rx="4" fill="#2A2550" />
        <ellipse className={k} cx="87" cy="190" rx="12" ry="9" fill={g.a} />
        <ellipse className={k} cx="113" cy="190" rx="12" ry="9" fill={g.b} />
        <path className={k} d="M64 228 Q62 208 80 206 L98 206 L98 228 Z" fill={g.a} />
        <path className={k} d="M136 228 Q138 208 120 206 L102 206 L102 228 Z" fill={g.b} />
        <path className={k} d="M46 126 L42 164 L60 166 L66 128 Z" fill="#2A2550" />
        <path className={k} d="M154 126 L158 164 L140 166 L134 128 Z" fill="#2A2550" />
        <path className={k} d="M60 110 Q80 103 100 102 L100 186 Q82 184 66 178 Z" fill={g.a} />
        <path className={k} d="M140 110 Q120 103 100 102 L100 186 Q118 184 134 178 Z" fill={g.b} />
        <rect className={k} x="66" y="168" width="68" height="12" rx="4" fill="#2A2550" />
        <rect className={k} x="93" y="166" width="14" height="16" rx="3" fill="#F4F1FF" style={{ strokeWidth: 2.5 }} />
        <path className={k} d="M100 122 L117 141 L100 160 L83 141 Z" fill="#F4F1FF" />
        <text x="100" y="149" textAnchor="middle" fontFamily="'Lilita One', 'Arial Black', sans-serif" fontSize="22" fill={INK}>?</text>
        <path className={k} d="M38 120 Q36 94 62 92 Q82 94 82 112 Q70 128 42 130 Z" fill={g.a} />
        <path className={k} d="M162 120 Q164 94 138 92 Q118 94 118 112 Q130 128 158 130 Z" fill={g.b} />
        <circle cx="54" cy="108" r="2.5" fill={INK} />
        <circle cx="146" cy="108" r="2.5" fill={INK} />
        <path className={hl} d="M46 104 Q50 96 62 96" />
      </>
    ),
    head: (g) => (
      <>
        <g className="bb-sway" style={{ transformOrigin: "100px 30px" }}>
          <path className={k} d="M100 28 Q84 0 62 6 Q84 10 96 32 Z" fill={g.a} />
          <path className={k} d="M100 28 Q116 0 138 6 Q116 10 104 32 Z" fill={g.b} />
        </g>
        <rect className={k} x="92" y="18" width="16" height="12" rx="3" fill="#2A2550" />
        <path className={k} d="M58 72 Q58 26 100 24 L100 106 Q78 104 60 100 Z" fill={g.a} />
        <path className={k} d="M142 72 Q142 26 100 24 L100 106 Q122 104 140 100 Z" fill={g.b} />
        <path className={k} d="M70 62 H130 V73 H106 V98 H94 V73 H70 Z" fill={INK} style={{ strokeWidth: 2.5 }} />
        <path className={l} d="M64 56 Q100 46 136 56" />
        <circle cx="66" cy="86" r="2.5" fill={INK} />
        <circle cx="134" cy="86" r="2.5" fill={INK} />
        <path className={hl} d="M66 44 Q74 30 92 28" />
      </>
    ),
    face: { kind: "bar", eyes: [[83.5, 67.5], [116.5, 67.5]], w: 15, h: 5, color: "#7CF7FF" },
  },

  // 04 ------------------------------------------------------------------
  bugsy: {
    grads: {
      a: ["#9BE88C", "#5CC94A", "#3E9A32"],
      b: ["#FFB27A", "#FF8A3D", "#D9622A"],
      c: ["#B37C58", "#8D5B3E", "#6A402A"],
      d: ["#FFE08A", "#E0A93B", "#B07A18"],
      e: ["#7FB2FF", "#3A86FF", "#2462CC"],
    },
    pivots: { head: [100, 108], armL: [62, 114], armR: [138, 114] },
    raise: 70,
    armsFront: true,
    top: [100, 0],
    sweat: [146, 56],
    back: (g) => (
      <>
        <path className={k} d="M66 110 Q34 98 30 136 Q30 172 64 168 Z" fill={g.a} />
        <path className={k} d="M134 110 Q166 98 170 136 Q170 172 136 168 Z" fill={g.a} />
        <circle cx="44" cy="128" r="5" fill="#3E9A32" />
        <circle cx="46" cy="150" r="4" fill="#3E9A32" />
        <circle cx="156" cy="128" r="5" fill="#3E9A32" />
        <circle cx="154" cy="150" r="4" fill="#3E9A32" />
      </>
    ),
    armL: (g) => (
      <>
        <path d="M52 206 L40 52" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M52 206 L40 52" fill="none" stroke="#8A5A36" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="38" cy="38" r="20" fill="#8FE9FF" opacity="0.35" />
        <path d="M24 30 H52 M20 40 H56 M24 50 H52 M30 20 V56 M40 18 V58 M50 22 V54" fill="none" stroke="#BFF4FF" strokeWidth="1.5" opacity="0.8" />
        <circle cx="38" cy="38" r="20" fill="none" stroke={INK} strokeWidth="8" />
        <circle cx="38" cy="38" r="20" fill="none" stroke="#E0A93B" strokeWidth="4" />
        <path className={hl} d="M26 30 Q30 24 38 22" />
        <rect className={k} x="50" y="110" width="20" height="24" rx="9" transform="rotate(14 60 122)" fill={g.e} />
        <rect className={k} x="46" y="128" width="16" height="30" rx="8" transform="rotate(8 54 143)" fill={g.c} />
        <circle className={k} cx="49" cy="166" r="9" fill={g.c} />
      </>
    ),
    armR: (g) => (
      <>
        <rect className={k} x="130" y="110" width="20" height="24" rx="9" transform="rotate(-14 140 122)" fill={g.e} />
        <rect className={k} x="138" y="128" width="16" height="30" rx="8" transform="rotate(-8 146 143)" fill={g.c} />
        <rect className={k} x="141" y="166" width="20" height="24" rx="6" fill="#BFF4FF" />
        <circle cx="151" cy="180" r="4" fill="#FF2BD6" />
        <path className={l} d="M147 176 L144 172 M155 176 L158 172" style={{ strokeWidth: 1.5 }} />
        <circle className={k} cx="151" cy="164" r="9" fill={g.c} />
      </>
    ),
    body: (g) => (
      <>
        <path className={k} d="M66 228 Q64 208 82 206 L97 206 L97 228 Z" fill="#6B4226" />
        <path className={k} d="M134 228 Q136 208 118 206 L103 206 L103 228 Z" fill="#6B4226" />
        <path className={l} d="M68 222 H96 M104 222 H132" style={{ strokeWidth: 2.5 }} />
        <rect className={k} x="80" y="176" width="17" height="32" rx="4" fill={g.b} />
        <rect className={k} x="103" y="176" width="17" height="32" rx="4" fill={g.b} />
        <rect className={k} x="83" y="186" width="11" height="9" rx="2" fill="#C9CED8" style={{ strokeWidth: 2 }} />
        <rect className={k} x="64" y="106" width="72" height="54" rx="20" fill={g.e} />
        <path className={k} d="M76 126 L124 126 L126 150 L136 152 L134 180 Q100 188 66 180 L64 152 L74 150 Z" fill={g.b} />
        <path className={k} d="M78 128 L72 108 L82 106 L86 128 Z" fill={g.b} />
        <path className={k} d="M122 128 L128 108 L118 106 L114 128 Z" fill={g.b} />
        <circle className={k} cx="80" cy="130" r="3.5" fill="#FFD84D" style={{ strokeWidth: 2 }} />
        <circle className={k} cx="120" cy="130" r="3.5" fill="#FFD84D" style={{ strokeWidth: 2 }} />
        <rect className={k} x="106" y="122" width="4" height="12" rx="1" fill="#FF5A6E" style={{ strokeWidth: 2 }} />
        <rect className={k} x="88" y="134" width="24" height="16" rx="3" fill="#D9622A" style={{ strokeWidth: 2.5 }} />
        <circle cx="98" cy="141" r="4" fill="none" stroke="#FFE08A" strokeWidth="2" />
        <path d="M101 144 L105 148" stroke="#FFE08A" strokeWidth="2" strokeLinecap="round" />
        <rect className={k} x="64" y="158" width="72" height="9" rx="3" fill="#5A3A22" style={{ strokeWidth: 2.5 }} />
      </>
    ),
    head: (g) => (
      <>
        <ellipse className={k} cx="62" cy="76" rx="7" ry="9" fill={g.c} />
        <ellipse className={k} cx="138" cy="76" rx="7" ry="9" fill={g.c} />
        <circle className={k} cx="100" cy="72" r="40" fill={g.c} />
        <g className="bb-wobble" style={{ transformOrigin: "100px 30px" }}>
          <path className={l} d="M88 30 Q78 10 64 8" />
          <path className={l} d="M112 30 Q122 10 136 8" />
          <circle className={k} cx="62" cy="8" r="5" fill="#FFD84D" style={{ strokeWidth: 2.5 }} />
          <circle className={k} cx="138" cy="8" r="5" fill="#FFD84D" style={{ strokeWidth: 2.5 }} />
        </g>
        <path className={k} d="M60 64 Q58 28 100 26 Q142 28 140 64 Q100 52 60 64 Z" fill={g.a} />
        <circle cx="84" cy="40" r="4" fill="#3E9A32" />
        <circle cx="116" cy="38" r="5" fill="#3E9A32" />
        <path className={l} d="M100 28 V54" style={{ strokeWidth: 2 }} />
        <path className={k} d="M58 62 Q100 50 142 62 L146 70 Q100 58 54 70 Z" fill="#3E9A32" />
        <path d="M60 76 H72 M128 76 H140" stroke={INK} strokeWidth="6" />
        <circle className={k} cx="84" cy="78" r="14" fill={g.d} />
        <circle className={k} cx="116" cy="78" r="14" fill={g.d} />
        <circle className={k} cx="84" cy="78" r="9.5" fill="#8FE9FF" style={{ strokeWidth: 2.5 }} />
        <circle className={k} cx="116" cy="78" r="9.5" fill="#8FE9FF" style={{ strokeWidth: 2.5 }} />
        <rect className={k} x="96" y="74" width="8" height="6" rx="2" fill={g.d} style={{ strokeWidth: 2 }} />
        <path className={l} d="M99 88 Q102 91 99 94" style={{ strokeWidth: 2 }} />
        <circle cx="74" cy="94" r="1.5" fill="#6A402A" />
        <circle cx="78" cy="98" r="1.5" fill="#6A402A" />
        <circle cx="126" cy="94" r="1.5" fill="#6A402A" />
        <circle cx="122" cy="98" r="1.5" fill="#6A402A" />
        <path className={hl} d="M70 44 Q78 32 94 30" />
      </>
    ),
    face: { kind: "dot", eyes: [[86, 79], [118, 79]], r: 4 },
    mouth: { kind: "human", x: 100, y: 99, w: 24 },
  },

  // 05 ------------------------------------------------------------------
  recursa: {
    grads: {
      a: ["#A98BFF", "#7B4DFF", "#4E25C2"],
      b: ["#A6FFE3", "#5CF2C7", "#22B88E"],
      c: ["#4FC7BD", "#1F9E95", "#11635E"],
      d: ["#FFE0C4", "#F1C6A2", "#D19F78"],
      e: ["#5A3BB8", "#3A2380", "#24145A"],
    },
    pivots: { head: [100, 106], armL: [66, 116], armR: [134, 116] },
    raise: 30,
    armsFront: true,
    top: [100, 2],
    sweat: [138, 60],
    back: (g) => (
      <path className={k} d="M60 66 Q54 108 66 128 L134 128 Q146 108 140 66 Z" fill={g.c} />
    ),
    armL: (g) => (
      <>
        <path className={k} d="M66 112 Q50 116 44 140 L38 160 Q52 168 66 160 L70 134 Z" fill={g.a} />
        <path className={k} d="M38 156 Q52 164 66 156 L66 162 Q52 170 37 163 Z" fill={g.b} />
        <path d="M42 224 L40 48" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M42 224 L40 48" fill="none" stroke="#6B4A2E" strokeWidth="5" strokeLinecap="round" />
        <g className="bb-glow">
          <circle cx="40" cy="34" r="16" fill="none" stroke={INK} strokeWidth="8" />
          <circle cx="40" cy="34" r="16" fill="none" stroke="#F4C542" strokeWidth="4" />
          <circle cx="40" cy="34" r="9" fill="none" stroke={INK} strokeWidth="6" />
          <circle cx="40" cy="34" r="9" fill="none" stroke="#5CF2C7" strokeWidth="3" />
          <circle className={k} cx="40" cy="34" r="4" fill={g.a} style={{ strokeWidth: 2 }} />
        </g>
        <circle className={k} cx="44" cy="166" r="8" fill={g.d} />
      </>
    ),
    armR: (g) => (
      <>
        <path className={k} d="M134 112 Q150 116 156 140 L162 160 Q148 168 134 160 L130 134 Z" fill={g.a} />
        <path className={k} d="M162 156 Q148 164 134 156 L134 162 Q148 170 163 163 Z" fill={g.b} />
        <circle className={k} cx="158" cy="166" r="8" fill={g.d} />
        <g className="bb-float">
          <circle cx="160" cy="142" r="9" fill="none" stroke="#5CF2C7" strokeWidth="3" />
          <circle cx="160" cy="142" r="5" fill="none" stroke="#A6FFE3" strokeWidth="2" />
          <circle cx="160" cy="142" r="1.8" fill="#FFFFFF" />
        </g>
      </>
    ),
    body: (g) => (
      <>
        <ellipse className={k} cx="84" cy="222" rx="13" ry="6" fill="#24145A" />
        <ellipse className={k} cx="116" cy="222" rx="13" ry="6" fill="#24145A" />
        <path className={k} d="M66 112 Q100 102 134 112 L152 212 Q100 226 48 212 Z" fill={g.a} />
        <path className={l} d="M76 142 L62 204 M124 142 L138 204" style={{ strokeWidth: 2, opacity: 0.35 }} />
        <rect x="86" y="154" width="28" height="28" rx="2" fill="none" stroke="#5CF2C7" strokeWidth="2.5" />
        <rect x="91" y="159" width="18" height="18" rx="1" fill="none" stroke="#5CF2C7" strokeWidth="2.5" />
        <rect x="96" y="164" width="8" height="8" fill="#5CF2C7" />
        <path className={k} d="M50 202 Q100 216 150 202 L152 212 Q100 226 48 212 Z" fill={g.b} />
        <rect className={k} x="70" y="130" width="60" height="10" rx="4" fill={g.b} />
        <circle className={k} cx="100" cy="135" r="7" fill="#F4C542" style={{ strokeWidth: 2.5 }} />
        <path d="M100 135 m-3 0 a3 3 0 1 1 3 3 a1.5 1.5 0 1 1 -1.5 -1.5" fill="none" stroke={INK} strokeWidth="1.5" />
        <path className={k} d="M60 118 Q62 100 84 98 L116 98 Q138 100 140 118 Q100 132 60 118 Z" fill={g.e} />
        <path d="M62 116 Q100 130 138 116" fill="none" stroke="#5CF2C7" strokeWidth="3" />
        <path className={k} d="M90 98 L100 112 L110 98 Z" fill={g.b} style={{ strokeWidth: 2.5 }} />
      </>
    ),
    head: (g) => (
      <>
        <circle className={k} cx="100" cy="72" r="36" fill={g.d} />
        <path className={k} d="M64 68 Q58 100 70 124 L78 122 Q70 98 72 72 Z" fill={g.c} />
        <path className={k} d="M136 68 Q142 100 130 124 L122 122 Q130 98 128 72 Z" fill={g.c} />
        <path className={k} d="M64 72 Q62 40 100 38 Q138 40 136 72 L128 66 L124 56 L116 64 L110 54 L100 62 L90 54 L84 64 L76 56 L72 66 Z" fill={g.c} />
        <ellipse cx="80" cy="88" rx="5" ry="2.5" fill="#FF8FB0" opacity="0.55" />
        <ellipse cx="120" cy="88" rx="5" ry="2.5" fill="#FF8FB0" opacity="0.55" />
        <ellipse className={k} cx="100" cy="42" rx="62" ry="12" fill={g.e} />
        <ellipse cx="100" cy="42" rx="50" ry="9" fill="none" stroke="#7B4DFF" strokeWidth="2.5" />
        <ellipse cx="100" cy="42" rx="38" ry="6.5" fill="none" stroke="#7B4DFF" strokeWidth="2.5" />
        <ellipse cx="100" cy="42" rx="26" ry="4" fill="none" stroke="#7B4DFF" strokeWidth="2.5" />
        <path className={k} d="M76 42 Q86 14 106 6 Q118 2 126 10 Q116 12 116 20 Q122 30 124 42 Q100 50 76 42 Z" fill={g.e} />
        <path className={k} d="M78 35 Q100 42 122 35 L124 42 Q100 50 76 42 Z" fill={g.b} style={{ strokeWidth: 2.5 }} />
        <circle className={k} cx="100" cy="41" r="3.5" fill="#F4C542" style={{ strokeWidth: 2 }} />
        <path className={l} d="M126 10 q7 2 4 8 q-3 3 -6 0" style={{ strokeWidth: 3 }} />
        <path className={hl} d="M84 30 Q90 18 102 12" />
      </>
    ),
    face: {
      kind: "eyes", eyes: [[88, 78], [112, 78]], rx: 7, ry: 8,
      iris: "#7B4DFF", irisR: 5, ring: "#5CF2C7", lid: "thin", lash: true, brows: "#11635E",
    },
    mouth: { kind: "human", x: 101, y: 92, w: 16 },
  },

  // 06 ------------------------------------------------------------------
  stack: {
    grads: {
      a: ["#FFC266", "#FF9F1C", "#D9790A"],
      b: ["#7FE8DE", "#2EC4B6", "#1E8C82"],
      c: ["#B8A2FF", "#8E6CF0", "#6648C2"],
      d: ["#FFF0A0", "#FFD84D", "#D9A814"],
      e: ["#D6DCEA", "#A3ACC2", "#6E7792"],
    },
    pivots: { head: [100, 112], armL: [52, 124], armR: [148, 124] },
    raise: 60,
    armsFront: true,
    top: [100, 8],
    sweat: [140, 62],
    armL: (g) => (
      <>
        <circle className={k} cx="52" cy="124" r="10" fill={g.e} />
        <rect className={k} x="28" y="124" width="20" height="46" rx="8" transform="rotate(10 38 147)" fill={g.e} />
        <path className={l} d="M32 140 H48 M31 150 H47" style={{ strokeWidth: 2 }} />
        <rect className={k} x="16" y="164" width="36" height="30" rx="8" fill={g.a} />
        <path d="M26 166 V178 M34 166 V178 M42 166 V178" fill="none" stroke="#7A4A08" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
    armR: (g) => (
      <>
        <circle className={k} cx="148" cy="124" r="10" fill={g.e} />
        <rect className={k} x="152" y="124" width="20" height="40" rx="8" transform="rotate(-10 162 144)" fill={g.e} />
        <rect className={k} x="144" y="128" width="48" height="70" rx="10" fill={g.b} />
        <rect x="150" y="134" width="36" height="58" rx="6" fill="none" stroke="#1E8C82" strokeWidth="2.5" />
        <path className={k} d="M168 144 L180 158 H173 V178 H163 V158 H156 Z" fill="#FFFFFF" style={{ strokeWidth: 2.5 }} />
        <circle cx="150" cy="134" r="2" fill={INK} />
        <circle cx="186" cy="134" r="2" fill={INK} />
        <circle cx="150" cy="192" r="2" fill={INK} />
        <circle cx="186" cy="192" r="2" fill={INK} />
      </>
    ),
    body: (g) => (
      <>
        <rect className={k} x="70" y="196" width="20" height="20" rx="4" fill="#4A5068" />
        <rect className={k} x="110" y="196" width="20" height="20" rx="4" fill="#4A5068" />
        <rect className={k} x="60" y="212" width="36" height="16" rx="6" fill={g.e} />
        <rect className={k} x="104" y="212" width="36" height="16" rx="6" fill={g.e} />
        <rect className={k} x="48" y="168" width="104" height="32" rx="8" fill={g.a} />
        <text x="100" y="192" textAnchor="middle" fontFamily="'Lilita One', 'Arial Black', sans-serif" fontSize="20" fill={INK} opacity="0.75">0</text>
        <circle cx="58" cy="184" r="2.5" fill={INK} />
        <circle cx="142" cy="184" r="2.5" fill={INK} />
        <path className={hl} d="M56 174 H88" style={{ strokeWidth: 3.5 }} />
        <rect className={k} x="56" y="138" width="88" height="32" rx="8" fill={g.b} />
        <text x="100" y="162" textAnchor="middle" fontFamily="'Lilita One', 'Arial Black', sans-serif" fontSize="20" fill={INK} opacity="0.75">1</text>
        <circle cx="65" cy="154" r="2.5" fill={INK} />
        <circle cx="135" cy="154" r="2.5" fill={INK} />
        <path className={hl} d="M64 144 H92" style={{ strokeWidth: 3.5 }} />
        <rect className={k} x="62" y="110" width="76" height="30" rx="8" fill={g.c} />
        <text x="100" y="133" textAnchor="middle" fontFamily="'Lilita One', 'Arial Black', sans-serif" fontSize="18" fill={INK} opacity="0.75">2</text>
        <path className={hl} d="M70 116 H96" style={{ strokeWidth: 3.5 }} />
      </>
    ),
    head: (g) => (
      <>
        <g className="bb-float">
          <path className={k} d="M90 24 H110 V36 H118 L100 50 L82 36 H90 Z" fill="#FF5A6E" />
          <text x="100" y="18" textAnchor="middle" fontFamily="'Lilita One', 'Arial Black', sans-serif" fontSize="13" fill="#FF5A6E">TOP</text>
        </g>
        <circle className={k} cx="66" cy="84" r="6" fill={g.e} />
        <circle className={k} cx="134" cy="84" r="6" fill={g.e} />
        <rect className={k} x="66" y="56" width="68" height="56" rx="14" fill={g.d} />
        <path className={hl} d="M74 62 Q90 60 104 60" style={{ strokeWidth: 3.5 }} />
        <rect className={k} x="74" y="70" width="52" height="24" rx="10" fill={INK} />
        <rect className={k} x="86" y="98" width="28" height="8" rx="3" fill="#3A3654" style={{ strokeWidth: 2.5 }} />
        <path d="M93 99 V105 M100 99 V105 M107 99 V105" stroke="#7CF7FF" strokeWidth="1.5" />
        <rect x="70" y="98" width="8" height="5" rx="2" fill="#FF8FB0" />
        <rect x="122" y="98" width="8" height="5" rx="2" fill="#FF8FB0" />
      </>
    ),
    face: { kind: "pixel", eyes: [[88, 82], [112, 82]], w: 12, h: 14, color: "#7CF7FF" },
  },

  // 07 ------------------------------------------------------------------
  nyx: {
    grads: {
      a: ["#4A3A80", "#2A1F4E", "#150F2E"],
      b: ["#5A3E9C", "#3B2A6E", "#24184A"],
      c: ["#F1E2FF", "#D8B4FF", "#A57AE0"],
      d: ["#C79BFF", "#9B5CFF", "#6A2FD0"],
    },
    pivots: { head: [100, 112], armL: [76, 114], armR: [124, 114] },
    raise: 120,
    armsFront: true,
    top: [100, 18],
    sweat: [140, 46],
    back: (g) => (
      <>
        <path className={k} d="M62 104 Q40 160 42 214 L56 206 L66 220 L80 208 L100 222 L120 208 L134 220 L144 206 L158 214 Q160 160 138 104 Z" fill={g.a} />
        <path d="M66 116 Q50 162 50 204 M134 116 Q150 162 150 204" fill="none" stroke="#6A2FD0" strokeWidth="2.5" opacity="0.7" />
      </>
    ),
    armL: (g) => (
      <>
        <path className={k} d="M76 112 Q62 120 60 148 L58 166 L70 168 L74 140 Z" fill={g.b} />
        <path className={k} d="M60 176 Q42 192 46 218 Q54 200 68 180 Z" fill={g.c} />
        <rect className={k} x="54" y="172" width="16" height="6" rx="2" transform="rotate(-30 62 175)" fill={g.d} />
        <circle className={k} cx="63" cy="170" r="8" fill="#150F2E" />
      </>
    ),
    armR: (g) => (
      <>
        <path className={k} d="M124 112 Q138 120 140 148 L142 166 L130 168 L126 140 Z" fill={g.b} />
        <path className={k} d="M140 176 Q158 192 154 218 Q146 200 132 180 Z" fill={g.c} />
        <rect className={k} x="130" y="172" width="16" height="6" rx="2" transform="rotate(30 138 175)" fill={g.d} />
        <circle className={k} cx="137" cy="170" r="8" fill="#150F2E" />
      </>
    ),
    body: (g) => (
      <>
        <path className={k} d="M76 228 L82 204 L97 204 L97 228 Z" fill="#24184A" />
        <path className={k} d="M124 228 L118 204 L103 204 L103 228 Z" fill="#24184A" />
        <path d="M84 212 H96 M104 212 H116" stroke="#D8B4FF" strokeWidth="2.5" />
        <rect className={k} x="83" y="170" width="14" height="38" rx="5" fill={g.b} />
        <rect className={k} x="103" y="170" width="14" height="38" rx="5" fill={g.b} />
        <path className={k} d="M76 108 Q100 100 124 108 L120 176 Q100 182 80 176 Z" fill={g.b} />
        <path d="M80 112 L120 170 M120 112 L80 170" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <path d="M80 112 L120 170 M120 112 L80 170" fill="none" stroke="#9B5CFF" strokeWidth="3" strokeLinecap="round" />
        <circle className={k} cx="100" cy="141" r="8" fill="#0B0918" />
        <circle cx="100" cy="141" r="4" fill="none" stroke="#D8B4FF" strokeWidth="2" />
        <path d="M95 146 L105 136" stroke="#D8B4FF" strokeWidth="2" strokeLinecap="round" />
        <rect className={k} x="78" y="166" width="44" height="9" rx="3" fill="#150F2E" style={{ strokeWidth: 2.5 }} />
      </>
    ),
    head: (g) => (
      <>
        <path className={k} d="M58 78 Q56 24 100 20 Q144 24 142 78 Q140 108 100 112 Q60 108 58 78 Z" fill={g.a} />
        <path d="M66 82 Q66 40 100 36 Q134 40 134 82" fill="none" stroke="#9B5CFF" strokeWidth="2.5" opacity="0.7" />
        <ellipse className={k} cx="100" cy="76" rx="29" ry="28" fill="#0B0918" style={{ strokeWidth: 3 }} />
        <path className={k} d="M76 80 Q100 76 124 80 Q122 100 100 104 Q78 100 76 80 Z" fill={g.c} style={{ strokeWidth: 3 }} />
        <circle cx="100" cy="91" r="6" fill="none" stroke={INK} strokeWidth="2.5" />
        <path d="M93 98 L107 84" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M68 44 Q76 28 96 24" fill="none" stroke="#C9A6FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      </>
    ),
    face: { kind: "slit", eyes: [[88, 70], [112, 70]], w: 16, h: 7, color: "#FFFFFF", glow: "#D8B4FF" },
    extra: () => (
      <g className="bb-drift">
        <rect x="34" y="222" width="5" height="5" fill="#9B5CFF" />
        <rect x="160" y="218" width="4" height="4" fill="#D8B4FF" />
        <rect x="166" y="196" width="5" height="5" fill="#9B5CFF" />
        <rect x="28" y="196" width="4" height="4" fill="#D8B4FF" />
        <rect x="150" y="228" width="4" height="4" fill="#D8B4FF" />
      </g>
    ),
  },

  // 08 ------------------------------------------------------------------
  async: {
    grads: {
      a: ["#4A5A9E", "#23305E", "#151D3E"],
      b: ["#FFD27A", "#FFB020", "#C98210"],
      c: ["#E9B48F", "#C98E6A", "#A06A48"],
      d: ["#FFFFFF", "#E4E9F7", "#AEB8D6"],
      e: ["#7FE8DE", "#2EC4B6", "#1E8C82"],
      f: ["#5A6280", "#2E3350", "#1C2038"],
    },
    pivots: { head: [100, 108] },
    top: [100, 14],
    sweat: [140, 50],
    body: (g) => (
      <>
        <rect className={k} x="80" y="176" width="17" height="36" rx="4" fill="#1C2038" />
        <rect className={k} x="103" y="176" width="17" height="36" rx="4" fill="#1C2038" />
        <path className={k} d="M66 228 Q64 210 82 208 L97 208 L97 228 Z" fill={g.d} />
        <path className={k} d="M134 228 Q136 210 118 208 L103 208 L103 228 Z" fill={g.d} />
        <path d="M68 223 H96 M104 223 H132" stroke="#FFB020" strokeWidth="3" />
        <path className={k} d="M86 106 L114 106 L114 180 L86 180 Z" fill={g.e} />
        <circle className={k} cx="100" cy="138" r="9" fill="#FFF6D6" style={{ strokeWidth: 2.5 }} />
        <g className="bb-tick" style={{ transformOrigin: "100px 138px" }}>
          <path className={l} d="M100 138 V132" style={{ strokeWidth: 2 }} />
        </g>
        <path className={l} d="M100 138 L104 140" style={{ strokeWidth: 2 }} />
        <rect className={k} x="86" y="172" width="28" height="8" rx="2" fill="#1C2038" style={{ strokeWidth: 2.5 }} />
        <path className={k} d="M66 108 Q100 100 134 108 L146 204 Q128 210 112 202 L112 120 L88 120 L88 202 Q72 210 54 204 Z" fill={g.a} />
        <path d="M88 120 L88 202 M112 120 L112 202 M56 198 Q70 204 86 200 M114 200 Q130 204 144 198" fill="none" stroke="#FFB020" strokeWidth="3" strokeLinecap="round" />
        <path className={k} d="M74 108 L66 86 L92 102 Z" fill={g.a} />
        <path className={k} d="M126 108 L134 86 L108 102 Z" fill={g.a} />
        <path className={k} d="M122 160 H134 L128 170 L134 180 H122 L128 170 Z" fill={g.b} style={{ strokeWidth: 2.5 }} />
        <rect className={k} x="58" y="110" width="20" height="64" rx="9" fill={g.a} />
        <rect className={k} x="122" y="110" width="20" height="42" rx="9" fill={g.a} />
        <g transform="rotate(-24 100 160)">
          <rect className={k} x="18" y="150" width="26" height="22" rx="6" fill={g.b} />
          <rect className={k} x="40" y="152" width="112" height="16" rx="6" fill={g.f} />
          <rect className={k} x="150" y="155" width="40" height="9" rx="3" fill={g.f} />
          <rect className={k} x="186" y="153" width="8" height="13" rx="2" fill={g.b} style={{ strokeWidth: 2.5 }} />
          <rect className={k} x="90" y="138" width="40" height="11" rx="5" fill={g.b} />
          <circle className={k} cx="130" cy="143" r="5" fill={g.e} style={{ strokeWidth: 2.5 }} />
          <circle className={k} cx="66" cy="160" r="10" fill="#FFF6D6" style={{ strokeWidth: 2.5 }} />
          <path className={l} d="M66 160 V154 M66 160 L71 162" style={{ strokeWidth: 2 }} />
          <rect className="bb-glow" x="96" y="158" width="44" height="4" rx="2" fill="#2EC4B6" />
        </g>
        <circle className={k} cx="68" cy="184" r="9" fill={g.c} />
        <circle className={k} cx="130" cy="153" r="9" fill={g.c} />
      </>
    ),
    head: (g) => (
      <>
        <circle className={k} cx="100" cy="70" r="38" fill={g.c} />
        <path className={k} d="M62 70 Q58 30 98 28 Q134 26 142 52 Q146 64 138 74 L132 60 Q116 50 98 52 Q80 54 72 70 Q66 62 62 70 Z" fill={g.d} />
        <path className={k} d="M70 56 Q98 36 138 50 Q118 54 108 70 Q92 62 70 56 Z" fill={g.d} />
        <path className={l} d="M84 40 Q100 34 118 38" style={{ stroke: "#AEB8D6", strokeWidth: 2 }} />
        <path d="M62 66 Q60 22 100 20 Q140 22 138 66" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M62 66 Q60 22 100 20 Q140 22 138 66" fill="none" stroke="#2E3350" strokeWidth="5" strokeLinecap="round" />
        <rect className={k} x="52" y="58" width="16" height="28" rx="7" fill={g.f} />
        <rect className={k} x="132" y="58" width="16" height="28" rx="7" fill={g.f} />
        <circle className={k} cx="60" cy="72" r="6" fill={g.b} style={{ strokeWidth: 2 }} />
        <circle className={k} cx="140" cy="72" r="6" fill={g.b} style={{ strokeWidth: 2 }} />
        <path className={l} d="M60 72 V68 M60 72 H63 M140 72 V68 M140 72 H137" style={{ strokeWidth: 1.5 }} />
        <path className={l} d="M99 84 Q103 88 99 90" style={{ strokeWidth: 2 }} />
        <path className={hl} d="M74 40 Q82 32 94 30" style={{ strokeWidth: 3.5 }} />
      </>
    ),
    face: {
      kind: "eyes", eyes: [[86, 77], [114, 77]], rx: 7, ry: 6,
      iris: "#FFB020", irisR: 4, lid: "heavy", brows: INK,
    },
    mouth: { kind: "human", x: 101, y: 95, w: 18 },
  },

  // 09 ------------------------------------------------------------------
  lambda: {
    grads: {
      a: ["#F7DCA0", "#E3B567", "#B88A3E"],
      b: ["#9A6A47", "#6B3E26", "#46271A"],
      c: ["#5FE0D4", "#1F9E95", "#126B65"],
      d: ["#FFFFFF", "#F4F1FF", "#C9C3E6"],
      e: ["#5A6280", "#2E3350", "#1C2038"],
      f: ["#8A5A36", "#6B4226", "#4A2C17"],
    },
    pivots: { head: [100, 104] },
    top: [100, 14],
    sweat: [142, 74],
    body: (g) => (
      <>
        <rect className={k} x="80" y="168" width="17" height="42" rx="4" fill="#3B3F5E" />
        <rect className={k} x="103" y="168" width="17" height="42" rx="4" fill="#3B3F5E" />
        <path className={k} d="M66 228 Q64 210 82 206 L97 206 L97 228 Z" fill={g.f} />
        <path className={k} d="M134 228 Q136 210 118 206 L103 206 L103 228 Z" fill={g.f} />
        <circle className={k} cx="66" cy="222" r="4.5" fill="#F4C542" style={{ strokeWidth: 2 }} />
        <circle className={k} cx="134" cy="222" r="4.5" fill="#F4C542" style={{ strokeWidth: 2 }} />
        <rect className={k} x="70" y="164" width="60" height="10" rx="3" fill="#46271A" />
        <rect className={k} x="92" y="162" width="16" height="14" rx="3" fill="#F4C542" style={{ strokeWidth: 2.5 }} />
        <path d="M97 165 Q99 164 100 167 L104 174 M100 169 L96 174" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <path className={k} d="M126 170 L140 170 L138 196 L128 196 Z" fill={g.b} />
        <rect className={k} x="128" y="158" width="10" height="14" rx="3" fill={g.e} />
        <path className={k} d="M62 118 Q74 100 100 98 Q126 100 138 118 L152 166 L100 186 L48 166 Z" fill={g.a} />
        <path d="M56 148 L66 140 L76 148 L86 140 L96 148 L104 140 L114 148 L124 140 L134 148 L144 140" fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d="M56 148 L66 140 L76 148 L86 140 L96 148 L104 140 L114 148 L124 140 L134 148 L144 140" fill="none" stroke="#1F9E95" strokeWidth="3" strokeLinejoin="round" />
        <text x="100" y="172" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fontSize="12" fill="#6B3E26">=&gt;</text>
        <path d="M52 168 L50 176 M62 172 L60 180 M74 176 L72 184 M86 180 L85 188 M114 180 L115 188 M126 176 L128 184 M138 172 L140 180 M148 168 L150 176" fill="none" stroke="#B88A3E" strokeWidth="2.5" strokeLinecap="round" />
        <g transform="rotate(-28 70 150)">
          <rect className={k} x="62" y="40" width="14" height="110" rx="5" fill={g.e} />
          <rect className={k} x="58" y="120" width="22" height="46" rx="7" fill={g.b} />
          <rect className={`${k} bb-glow`} x="65" y="60" width="8" height="40" rx="3" fill="#7CF7FF" style={{ strokeWidth: 2.5 }} />
          <rect className={k} x="58" y="34" width="22" height="10" rx="3" fill={g.e} />
        </g>
        <circle className={k} cx="56" cy="150" r="8" fill="#46271A" />
        <circle className={k} cx="134" cy="162" r="8" fill="#46271A" />
        <path className={k} d="M80 100 Q100 112 120 100 L118 112 Q100 124 82 112 Z" fill={g.c} />
        <path className={k} d="M106 112 L114 126 L102 120 Z" fill={g.c} style={{ strokeWidth: 2.5 }} />
      </>
    ),
    head: (g) => (
      <>
        <circle className={k} cx="100" cy="72" r="32" fill={g.d} />
        <ellipse cx="87" cy="68" rx="8" ry="5" fill={INK} />
        <ellipse cx="113" cy="68" rx="8" ry="5" fill={INK} />
        <path d="M94 76 Q98 74 100 80 L110 100 M102 86 L92 100" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className={l} d="M120 84 L124 90 L121 95" style={{ strokeWidth: 1.5 }} />
      </>
    ),
    face: { kind: "holes", eyes: [[87, 68], [113, 68]], r: 2.2 },
    over: (g) => (
      <>
        <path d="M70 54 Q100 64 130 54 L130 62 Q100 72 70 62 Z" fill={INK} opacity="0.25" />
        <path className={k} d="M70 54 Q70 20 86 16 Q100 22 114 16 Q130 20 130 54 Q100 62 70 54 Z" fill={g.b} />
        <path className={k} d="M71 44 Q100 52 129 44 L130 54 Q100 62 70 54 Z" fill={g.c} style={{ strokeWidth: 2.5 }} />
        <path className={l} d="M100 22 V34" style={{ strokeWidth: 2 }} />
        <path className={k} d="M28 50 Q100 66 172 50 Q164 64 100 70 Q36 64 28 50 Z" fill={g.b} />
        <path className={hl} d="M76 32 Q80 22 88 20" style={{ strokeWidth: 3.5 }} />
      </>
    ),
  },

  // 10 ------------------------------------------------------------------
  firewall: {
    grads: {
      a: ["#F08A74", "#C8483A", "#8F2B22"],
      b: { smooth: ["#FFF1A8", "#FFB238", "#FF6B2C"] },
      c: ["#A87666", "#6B3B32", "#4A2420"],
      d: ["#B8C0D0", "#5B6170", "#3A3F4C"],
      e: ["#FFE08A", "#F2C14E", "#C8901E"],
    },
    pivots: { head: [100, 92], armL: [36, 130], armR: [164, 130] },
    raise: 55,
    armsFront: true,
    top: [104, 2],
    sweat: [130, 50],
    armL: (g) => (
      <>
        <path className={k} d="M26 128 Q16 152 20 176 L42 176 Q42 154 46 134 Z" fill={g.c} />
        <path className={k} d="M14 186 Q12 168 30 166 Q48 166 48 184 Q48 202 30 202 Q14 202 14 186 Z" fill={g.a} />
        <path d="M22 178 V186 M30 176 V186 M38 178 V186" fill="none" stroke="#7A241C" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    armR: (g) => (
      <>
        <path className={k} d="M174 128 Q184 152 180 176 L158 176 Q158 154 154 134 Z" fill={g.c} />
        <path className={k} d="M128 112 Q128 104 136 104 L184 104 Q192 104 192 112 L192 182 Q192 206 160 218 Q128 206 128 182 Z" fill={g.a} />
        <path d="M134 110 L186 110 L186 182 Q186 200 160 210 Q134 200 134 182 Z" fill="none" stroke="#F2C14E" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M136 130 H184 M136 152 H184 M136 174 H184 M150 110 V130 M170 110 V130 M144 130 V152 M176 130 V152 M150 174 V196 M170 174 V196" fill="none" stroke="#7A241C" strokeWidth="2" strokeLinecap="round" />
        <path d="M153 148 V140 Q153 131 160 131 Q167 131 167 140 V148" fill="none" stroke={INK} strokeWidth="8" />
        <path d="M153 148 V140 Q153 131 160 131 Q167 131 167 140 V148" fill="none" stroke="#F2C14E" strokeWidth="3.5" />
        <rect className={k} x="148" y="148" width="24" height="22" rx="5" fill={g.e} />
        <circle cx="160" cy="157" r="2.8" fill={INK} />
        <path d="M158.5 158 L157 165 H163 L161.5 158 Z" fill={INK} />
      </>
    ),
    body: (g) => (
      <>
        <path className={k} d="M68 196 L96 196 L96 228 L64 228 Q62 212 68 196 Z" fill={g.c} />
        <path className={k} d="M132 196 L104 196 L104 228 L136 228 Q138 212 132 196 Z" fill={g.c} />
        <path d="M78 214 L82 222 M120 212 L118 220" fill="none" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
        <path className={k} d="M44 112 Q44 88 72 86 L128 86 Q156 88 156 112 L160 190 Q160 208 140 208 L60 208 Q40 208 40 190 Z" fill={g.a} />
        <path d="M44 110 H156 M42 134 H158 M41 158 H159 M40 182 H160 M72 86 V110 M100 86 V110 M128 86 V110 M58 110 V134 M86 110 V134 M114 110 V134 M142 110 V134 M72 134 V158 M128 134 V158 M58 158 V182 M86 158 V182 M114 158 V182 M142 158 V182 M72 182 V208 M100 182 V208 M128 182 V208" fill="none" stroke="#7A241C" strokeWidth="2.5" strokeLinecap="round" />
        <g className="bb-lava">
          <path d="M54 160 L62 172 L56 186 M100 156 L94 170 L104 184 L98 200" fill="none" stroke="#FF6B2C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
          <path d="M54 160 L62 172 L56 186 M100 156 L94 170 L104 184 L98 200" fill="none" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <rect className={k} x="78" y="118" width="44" height="34" rx="9" fill="#2A1A1A" />
        <rect className="bb-lava" x="84" y="124" width="32" height="22" rx="5" fill={g.b} />
        <path d="M92 124 V146 M100 124 V146 M108 124 V146" stroke="#2A1A1A" strokeWidth="3.5" />
        <path className={k} d="M22 112 Q22 84 48 82 Q72 84 74 108 Q72 132 48 134 Q24 132 22 112 Z" fill={g.c} />
        <path className={k} d="M178 112 Q178 84 152 82 Q128 84 126 108 Q128 132 152 134 Q176 132 178 112 Z" fill={g.c} />
        <path d="M36 98 L46 106 L40 118 M164 98 L154 106 L160 118" fill="none" stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round" />
        <path className={hl} d="M32 100 Q38 90 48 88 M140 92 Q146 88 154 88" style={{ strokeWidth: 3.5 }} />
      </>
    ),
    head: (g) => (
      <>
        <path className={k} d="M76 90 Q74 44 100 42 Q126 44 124 90 Q100 98 76 90 Z" fill={g.d} />
        <rect className={k} x="82" y="60" width="36" height="16" rx="8" fill="#14101A" />
        <circle cx="82" cy="84" r="2" fill="#3A3F4C" />
        <circle cx="100" cy="88" r="2" fill="#3A3F4C" />
        <circle cx="118" cy="84" r="2" fill="#3A3F4C" />
        <path className={l} d="M100 44 V58" style={{ stroke: "#3A3F4C", strokeWidth: 2.5 }} />
        <path className={hl} d="M82 56 Q86 48 96 46" style={{ strokeWidth: 3.5 }} />
        <g className="bb-flicker" style={{ transformOrigin: "104px 46px" }}>
          <path className={k} d="M100 44 Q88 32 94 16 Q98 26 102 22 Q100 10 108 2 Q112 18 118 24 Q120 38 108 46 Z" fill={g.b} />
          <path d="M101 42 Q95 34 99 26 Q102 32 106 30 Q109 38 104 43 Z" fill="#FFF1A8" />
        </g>
      </>
    ),
    face: { kind: "slit", eyes: [[92, 68], [108, 68]], w: 9, h: 8, color: "#FFD166" },
  },

  // 11 ------------------------------------------------------------------
  cache: {
    grads: {
      a: ["#E0A577", "#B9764A", "#8A5230"],
      b: ["#FFFAF0", "#F6E3C6", "#DCC29A"],
      c: ["#B8FFF7", "#3FE0D0", "#14A99B"],
      d: ["#8A6A4A", "#5A3A22", "#3A2416"],
      e: ["#E4E9F2", "#AEB7C8", "#7D879C"],
    },
    pivots: { head: [100, 130] },
    top: [100, 0],
    sweat: [146, 62],
    back: (g) => (
      <g className="bb-wag" style={{ transformOrigin: "128px 190px" }}>
        <path className={k} d="M128 196 Q184 194 188 142 Q192 94 160 70 Q144 60 132 72 Q160 96 158 132 Q156 162 124 176 Z" fill={g.c} />
        <path d="M136 186 L178 160 M146 166 L184 132 M152 140 L182 108 M150 114 L168 84 M164 186 L154 150 M178 164 L164 120 M186 132 L170 96" fill="none" stroke="#14A99B" strokeWidth="2" />
        <rect x="170" y="116" width="4" height="4" fill="#FFFFFF" />
        <rect x="158" y="88" width="4" height="4" fill="#FFFFFF" />
      </g>
    ),
    body: (g) => (
      <>
        <ellipse className={k} cx="80" cy="222" rx="17" ry="8" fill={g.a} />
        <ellipse className={k} cx="120" cy="222" rx="17" ry="8" fill={g.a} />
        <path className={l} d="M70 222 V226 M78 222 V227 M122 222 V227 M130 222 V226" style={{ strokeWidth: 2 }} />
        <ellipse className={k} cx="100" cy="176" rx="46" ry="46" fill={g.a} />
        <ellipse className={k} cx="100" cy="184" rx="30" ry="32" fill={g.b} style={{ strokeWidth: 2.5 }} />
        <rect className={k} x="88" y="198" width="24" height="12" rx="3" fill={g.e} style={{ strokeWidth: 2.5 }} />
        <path d="M93 201 V207 M98 201 V207 M103 201 V207 M108 201 V207" stroke="#3FE0D0" strokeWidth="2" />
        <path className={k} d="M58 160 Q70 168 80 176 Q82 186 74 186 Q62 182 56 170 Z" fill={g.a} />
        <path className={k} d="M142 160 Q130 168 120 176 Q118 186 126 186 Q138 182 144 170 Z" fill={g.a} />
        <ellipse className={`${k} bb-glow`} cx="100" cy="178" rx="16" ry="18" fill={g.c} />
        <rect className={k} x="94" y="192" width="12" height="8" rx="2" fill={g.e} style={{ strokeWidth: 2.5 }} />
        <path className={k} d="M82 172 Q84 154 100 154 Q116 154 118 172 Q100 178 82 172 Z" fill={g.d} />
        <path d="M88 164 L96 158 M96 168 L106 158 M104 170 L112 162" stroke="#8A6A4A" strokeWidth="1.5" />
        <rect className={k} x="97" y="146" width="6" height="10" rx="2" fill={g.d} style={{ strokeWidth: 2.5 }} />
        <circle className={k} cx="82" cy="182" r="8" fill={g.a} />
        <circle className={k} cx="118" cy="182" r="8" fill={g.a} />
      </>
    ),
    head: (g) => (
      <>
        <path className={k} d="M62 58 L54 16 L84 42 Z" fill={g.a} />
        <path className={k} d="M138 58 L146 16 L116 42 Z" fill={g.a} />
        <path d="M64 50 L60 26 L78 42 Z" fill="#F2B8A0" />
        <path d="M136 50 L140 26 L122 42 Z" fill="#F2B8A0" />
        <path className={l} d="M54 16 L50 7 M146 16 L150 7" style={{ strokeWidth: 3 }} />
        <g className="bb-blinker">
          <circle className={k} cx="49" cy="5" r="4" fill={g.c} style={{ strokeWidth: 2 }} />
          <circle className={k} cx="151" cy="5" r="4" fill={g.c} style={{ strokeWidth: 2 }} />
        </g>
        <circle className={k} cx="100" cy="90" r="44" fill={g.a} />
        <path className={k} d="M90 50 Q94 36 100 44 Q106 34 110 50 Z" fill={g.a} style={{ strokeWidth: 2.5 }} />
        <path className={k} d="M100 50 L107 57 L100 64 L93 57 Z" fill={g.c} style={{ strokeWidth: 2 }} />
        <ellipse className={k} cx="70" cy="106" rx="15" ry="14" fill={g.b} style={{ strokeWidth: 2.5 }} />
        <ellipse className={k} cx="130" cy="106" rx="15" ry="14" fill={g.b} style={{ strokeWidth: 2.5 }} />
        <path className={k} d="M80 104 Q82 86 100 86 Q118 86 120 104 Q120 122 100 124 Q80 122 80 104 Z" fill={g.b} style={{ strokeWidth: 2.5 }} />
        <path className={k} d="M95 98 Q100 95 105 98 Q103 103 100 104 Q97 103 95 98 Z" fill="#3A2416" style={{ strokeWidth: 2 }} />
        <path className={l} d="M93 109 Q96 112 100 109 Q104 112 107 109" style={{ strokeWidth: 2 }} />
        <rect className={k} x="95" y="110" width="10" height="8" rx="2" fill="#FFFFFF" style={{ strokeWidth: 2 }} />
        <path d="M100 110 V118" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="66" cy="112" rx="6" ry="3" fill="#FF8FB0" opacity="0.55" />
        <ellipse cx="134" cy="112" rx="6" ry="3" fill="#FF8FB0" opacity="0.55" />
        <path className={hl} d="M70 64 Q76 54 88 50" style={{ strokeWidth: 3.5 }} />
      </>
    ),
    face: {
      kind: "eyes", eyes: [[83, 84], [117, 84]], rx: 10, ry: 12,
      iris: "#3A2416", irisR: 8, brows: "#8A5230", big: true,
    },
  },

  // 12 ------------------------------------------------------------------
  glitch: {
    grads: {
      a: ["#3A2D5C", "#1A1430", "#0B0918"],
      d: ["#FFF0A0", "#FFD84D", "#D9A814"],
    },
    pivots: { head: [100, 100] },
    top: [100, 0],
    sweat: [140, 40],
    back: () => {
      const arms =
        "M72 104 L40 116 L28 150 L20 168 L30 166 L34 176 L40 160 L46 170 L48 150 L60 126 L76 120 Z M128 104 L160 116 L172 150 L180 168 L170 166 L166 176 L160 160 L154 170 L152 150 L140 126 L124 120 Z";
      const body = "M70 96 L130 96 L146 138 L128 148 L138 176 L114 170 L108 214 L98 194 L86 222 L82 176 L58 172 L72 146 L54 138 Z";
      const head = "M100 18 L134 40 L130 84 L100 100 L70 84 L66 40 Z";
      return (
        <>
          <g className="bb-rgb-c" fill="#29E0FF" opacity="0.9">
            <path d={arms} /><path d={body} /><path d={head} />
          </g>
          <g className="bb-rgb-m" fill="#FF2BD6" opacity="0.9">
            <path d={arms} /><path d={body} /><path d={head} />
          </g>
        </>
      );
    },
    body: (g) => (
      <>
        <path className={k} d="M72 104 L40 116 L28 150 L20 168 L30 166 L34 176 L40 160 L46 170 L48 150 L60 126 L76 120 Z" fill={g.a} />
        <path className={k} d="M128 104 L160 116 L172 150 L180 168 L170 166 L166 176 L160 160 L154 170 L152 150 L140 126 L124 120 Z" fill={g.a} />
        <path className={k} d="M70 96 L130 96 L146 138 L128 148 L138 176 L114 170 L108 214 L98 194 L86 222 L82 176 L58 172 L72 146 L54 138 Z" fill={g.a} />
        <path d="M66 112 H134 M62 128 H140 M70 156 H130 M86 190 H110" fill="none" stroke="#FF2BD6" strokeWidth="2" opacity="0.6" />
        <path className={k} d="M100 112 L114 136 L86 136 Z" fill={g.d} />
        <path d="M100 119 V128" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="132" r="1.8" fill={INK} />
      </>
    ),
    head: (g) => (
      <>
        <path className={k} d="M100 18 L134 40 L130 84 L100 100 L70 84 L66 40 Z" fill={g.a} />
        <path className={k} d="M78 72 L122 72 L118 84 L82 84 Z" fill="#0B0918" style={{ strokeWidth: 2.5 }} />
        <path d="M80 73 L86 80 L92 73 L98 80 L104 73 L110 80 L116 73 L120 76" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="miter" />
        <rect x="74" y="44" width="5" height="5" fill="#29E0FF" />
        <rect x="122" y="64" width="5" height="5" fill="#FF2BD6" />
        <g className="bb-float">
          <path className={k} d="M74 4 L83 18 L65 18 Z" fill={g.d} style={{ strokeWidth: 2.5 }} />
          <path className={k} d="M100 2 L108 14 L92 14 Z" fill={g.d} style={{ strokeWidth: 2.5 }} />
          <path className={k} d="M126 4 L135 18 L117 18 Z" fill={g.d} style={{ strokeWidth: 2.5 }} />
        </g>
      </>
    ),
    face: { kind: "eyes", eyes: [[100, 56]], rx: 17, ry: 12, iris: "#FF2BD6", irisR: 8, slit: true },
    extra: () => (
      <g className="bb-drift">
        <rect x="30" y="40" width="6" height="6" fill="#FF2BD6" />
        <rect x="160" y="30" width="8" height="8" fill="#29E0FF" />
        <rect x="24" y="96" width="5" height="5" fill="#29E0FF" />
        <rect x="176" y="92" width="6" height="6" fill="#FF2BD6" />
        <rect x="44" y="206" width="7" height="7" fill="#29E0FF" />
        <rect x="150" y="200" width="6" height="6" fill="#FF2BD6" />
      </g>
    ),
  },
};

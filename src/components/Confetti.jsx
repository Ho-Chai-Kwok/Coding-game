const PIECES = [
  { left: "6%", color: "#f87171", delay: "0s", rotate: "10deg" },
  { left: "16%", color: "#fbbf24", delay: "0.08s", rotate: "-15deg" },
  { left: "26%", color: "#4ade80", delay: "0.03s", rotate: "20deg" },
  { left: "36%", color: "#38bdf8", delay: "0.12s", rotate: "-10deg" },
  { left: "46%", color: "#c084fc", delay: "0.05s", rotate: "15deg" },
  { left: "56%", color: "#f472b6", delay: "0.16s", rotate: "-20deg" },
  { left: "66%", color: "#fb923c", delay: "0.02s", rotate: "10deg" },
  { left: "76%", color: "#34d399", delay: "0.1s", rotate: "-5deg" },
  { left: "86%", color: "#818cf8", delay: "0.14s", rotate: "25deg" },
  { left: "94%", color: "#fde047", delay: "0.18s", rotate: "-25deg" },
  { left: "11%", color: "#f87171", delay: "0.2s", rotate: "5deg" },
  { left: "81%", color: "#4ade80", delay: "0.22s", rotate: "-8deg" },
];

export default function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti__piece"
          style={{ left: p.left, background: p.color, animationDelay: p.delay, "--rotate": p.rotate }}
        />
      ))}
    </div>
  );
}

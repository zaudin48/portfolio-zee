import { useMemo } from "react";

// Abstract effect: several colored threads slowly orbiting/drifting
// around a shared center point, like tangled strands converging — a
// generic geometric idea, not a depiction of any character or artwork.
function buildOrbitPath(radius, phase) {
  const points = [];
  for (let a = 0; a <= 360; a += 8) {
    const rad = ((a + phase) * Math.PI) / 180;
    const wobble = Math.sin(rad * 3) * (radius * 0.15);
    const r = radius + wobble;
    points.push([50 + r * Math.cos(rad), 50 + r * Math.sin(rad) * 0.6]);
  }
  return "M" + points.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" L");
}

export default function ThreadsBackground() {
  const strands = useMemo(
    () => [
      { radius: 18, phase: 0, color: "var(--color-crimson)", dur: 22 },
      { radius: 28, phase: 60, color: "var(--color-crimson-glow)", dur: 30 },
      { radius: 36, phase: 140, color: "var(--color-web)", dur: 38 },
      { radius: 22, phase: 220, color: "var(--color-amber)", dur: 26 },
      { radius: 42, phase: 300, color: "var(--color-crimson)", dur: 44 },
    ],
    []
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(200,32,43,0.10), transparent 70%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {strands.map((s, i) => (
          <path
            key={i}
            d={buildOrbitPath(s.radius, s.phase)}
            fill="none"
            stroke={s.color}
            strokeWidth="0.3"
            className="orbit-strand"
            style={{
              transformOrigin: "50px 50px",
              animation: `orbit-spin ${s.dur}s linear infinite`,
              animationDelay: `${-i * 3}s`,
            }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
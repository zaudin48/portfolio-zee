// A quiet lattice of drifting web-strands behind every page.
// Pure SVG + CSS animation — no canvas, no per-frame JS, cheap to render.
export default function WebBackground() {
  const strands = [
    "M -10,80 Q 200,20 420,140 T 900,90",
    "M -10,220 Q 260,160 500,260 T 980,200",
    "M -10,360 Q 220,420 460,340 T 940,400",
    "M 60,-10 Q 140,220 90,440 T 40,900",
    "M 340,-10 Q 400,240 360,480 T 320,940",
    "M 640,-10 Q 700,260 660,500 T 700,960",
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      {/* radial vignette so the lines fade toward the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(200,32,43,0.08), transparent 60%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.16]"
        viewBox="0 0 900 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {strands.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--color-web)"
            strokeWidth="1"
            strokeDasharray="6 10"
            className="web-strand"
            style={{ animationDelay: `${i * -3}s` }}
          />
        ))}
      </svg>
      <style>{`
        .web-strand {
          animation: web-drift 26s linear infinite;
        }
        @keyframes web-drift {
          to { stroke-dashoffset: -320; }
        }
      `}</style>
    </div>
  );
}

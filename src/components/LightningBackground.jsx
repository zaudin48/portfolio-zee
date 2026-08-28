import { useEffect, useState } from "react";

// Abstract electric-storm effect: jagged bolt paths flash briefly at
// random intervals from random positions. Pure geometry — no character
// imagery of any kind.
function randomBolt() {
  const startX = 10 + Math.random() * 80;
  let x = startX;
  let y = -5;
  let d = `M${x},${y}`;
  const segments = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < segments; i++) {
    x += (Math.random() - 0.5) * 22;
    y += 100 / segments;
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

export default function LightningBackground() {
  const [bolts, setBolts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    function spawn() {
      if (cancelled) return;
      const id = Date.now() + Math.random();
      setBolts((b) => [...b, { id, d: randomBolt() }]);
      setTimeout(() => {
        setBolts((b) => b.filter((bolt) => bolt.id !== id));
      }, 220);
      setTimeout(spawn, 1800 + Math.random() * 3200);
    }
    const initial = setTimeout(spawn, 600);
    return () => {
      cancelled = true;
      clearTimeout(initial);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 10%, rgba(200,32,43,0.10), transparent 65%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {bolts.map((bolt) => (
          <path
            key={bolt.id}
            d={bolt.d}
            fill="none"
            stroke="var(--color-crimson-glow)"
            strokeWidth="0.4"
            opacity="0.85"
            style={{ filter: "drop-shadow(0 0 4px var(--color-crimson-glow))" }}
          />
        ))}
      </svg>
    </div>
  );
}
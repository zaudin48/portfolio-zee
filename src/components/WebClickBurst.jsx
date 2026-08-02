import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Click anywhere empty on the site -> a quick burst of "web-shot" threads
// fires from that point and fades. Purely decorative. Because this layer
// sits at the very back of the stacking order (z-0, mounted first), real
// buttons/links painted above it still receive clicks normally.
export default function WebClickBurst() {
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);

  const handleClick = useCallback((e) => {
    const id = idRef.current++;
    setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setBursts((b) => b.filter((burst) => burst.id !== id));
    }, 700);
  }, []);

  return (
    <div onClick={handleClick} className="fixed inset-0 z-0">
      <AnimatePresence>
        {bursts.map((b) => (
          <svg
            key={b.id}
            className="pointer-events-none fixed"
            style={{ left: b.x - 40, top: b.y - 40 }}
            width="80"
            height="80"
            viewBox="0 0 80 80"
          >
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <motion.line
                key={angle}
                x1="40"
                y1="40"
                x2={40 + 34 * Math.cos((angle * Math.PI) / 180)}
                y2={40 + 34 * Math.sin((angle * Math.PI) / 180)}
                stroke="var(--color-crimson-glow)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.9 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </svg>
        ))}
      </AnimatePresence>
    </div>
  );
}

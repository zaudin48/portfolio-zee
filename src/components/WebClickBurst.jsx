import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Click anywhere on the site -> a quick burst of "web-shot" threads fires
// from that point and fades. Purely decorative.
//
// This listens on `document` rather than putting onClick on a full-screen
// div, because a full-screen div sitting behind the page (z-0) never
// actually receives clicks — every real element on top of it (Navbar,
// Hero, every section) intercepts the click first, even "empty" looking
// space, since they're siblings in the tree, not ancestors of this div.
// A document-level listener fires on every click regardless of what was
// actually clicked, real buttons included, and doesn't interfere with
// their own click handlers.
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

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
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
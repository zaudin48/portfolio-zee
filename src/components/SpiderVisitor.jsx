import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

const REST_LENGTH = 190; // how far down the thread the spider hangs
const PULL_THRESHOLD = 90; // px of pull-down needed at the top to trigger a "refresh"

// A small spider (a real 8-legged bug, not any copyrighted character)
// that drops in on a silk thread when the page loads, idles with a
// gentle sway, and — if you pull down at the very top of the page on a
// touch device, like pull-to-refresh — drops again and reloads.
export default function SpiderVisitor() {
  const controls = useAnimationControls();
  const [pullY, setPullY] = useState(0);
  const startY = useRef(null);
  const pulling = useRef(false);

  useEffect(() => {
    async function playDrop() {
      await controls.start({
        height: REST_LENGTH,
        transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
      });
      controls.start({
        rotate: [0, 6, -6, 3, -3, 0],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      });
    }
    playDrop();
  }, [controls]);

  useEffect(() => {
    function onTouchStart(e) {
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    }
    function onTouchMove(e) {
      if (!pulling.current || startY.current == null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY <= 0) {
        setPullY(Math.min(delta * 0.5, 140));
      } else {
        pulling.current = false;
        setPullY(0);
      }
    }
    function onTouchEnd() {
      if (pulling.current && pullY > PULL_THRESHOLD) {
        window.location.reload();
      }
      pulling.current = false;
      startY.current = null;
      setPullY(0);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullY]);

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-0 z-50 -translate-x-1/2"
      style={{ transform: `translateX(-50%) translateY(${pullY}px)` }}
      aria-hidden="true"
    >
      {/* the silk thread, growing downward */}
      <motion.div
        initial={{ height: 0 }}
        animate={controls}
        className="mx-auto w-px bg-web/40"
      />
      {/* the spider, hanging at the end of the thread */}
      <motion.svg
        width="26"
        height="22"
        viewBox="0 0 26 22"
        className="-mt-px"
        style={{ transformOrigin: "top center" }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="13" cy="14" rx="5" ry="6" fill="var(--color-ink-soft)" stroke="var(--color-web)" strokeWidth="0.6" />
        <circle cx="13" cy="6" r="3" fill="var(--color-ink-soft)" stroke="var(--color-web)" strokeWidth="0.6" />
        {[-8, -4, 4, 8].map((dx, i) => (
          <path
            key={`l-${i}`}
            d={`M9,${12 + i} Q${9 + dx / 2},${14 + i} ${4 + dx},${18 + i}`}
            stroke="var(--color-web)"
            strokeWidth="0.6"
            fill="none"
          />
        ))}
        {[8, 4, -4, -8].map((dx, i) => (
          <path
            key={`r-${i}`}
            d={`M17,${12 + i} Q${17 + dx / 2},${14 + i} ${22 + dx},${18 + i}`}
            stroke="var(--color-web)"
            strokeWidth="0.6"
            fill="none"
          />
        ))}
        <circle cx="11.5" cy="5.5" r="0.7" fill="var(--color-crimson-glow)" />
        <circle cx="14.5" cy="5.5" r="0.7" fill="var(--color-crimson-glow)" />
      </motion.svg>
    </div>
  );
}

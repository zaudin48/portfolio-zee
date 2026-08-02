import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

const REST_LENGTH = 190; // how far down the thread the spider hangs
const PULL_THRESHOLD = 90; // px of pull-down needed at the top to trigger a "refresh"
const MARGIN_LEFT = 32; // resting position — near the left margin, under the logo

// A small spider (a real 8-legged bug, not any copyrighted character)
// that drops in near the left margin on a trembling silk thread when the
// page loads, idles with a gentle sway, and — if you pull down at the
// very top of the page on a touch device, like pull-to-refresh — slides
// to center, stretches, and reloads.
export default function SpiderVisitor() {
  const controls = useAnimationControls();
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const startY = useRef(null);
  const pullingRef = useRef(false);

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
        pullingRef.current = true;
      }
    }
    function onTouchMove(e) {
      if (!pullingRef.current || startY.current == null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY <= 0) {
        setPulling(true);
        setPullY(Math.min(delta * 0.5, 140));
      } else {
        pullingRef.current = false;
        setPulling(false);
        setPullY(0);
      }
    }
    function onTouchEnd() {
      if (pullingRef.current && pullY > PULL_THRESHOLD) {
        window.location.reload();
        return;
      }
      pullingRef.current = false;
      setPulling(false);
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
    <motion.div
      className="pointer-events-none fixed top-0 z-50"
      initial={false}
      animate={
        pulling
          ? { left: "50%", x: "-50%", y: pullY }
          : { left: MARGIN_LEFT, x: 0, y: 0 }
      }
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      aria-hidden="true"
    >
      {/* the silk thread — trembles like real taut web-silk, not a straight line */}
      <motion.div
        initial={{ height: 0 }}
        animate={controls}
        style={{ transformOrigin: "top center" }}
        className="relative"
      >
        <motion.div
          className="mx-auto h-full w-px bg-web/40"
          animate={{
            skewX: [0, 3, -2, 2.5, -3, 0],
            scaleX: [1, 1.4, 1, 1.3, 1],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* the spider, hanging at the end of the thread */}
      <motion.svg
        width="26"
        height="22"
        viewBox="0 0 26 22"
        className="-mt-px"
        style={{ transformOrigin: "top center" }}
        animate={{ rotate: [0, 6, -6, 4, -4, 0], x: [0, 2, -2, 1, 0] }}
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
    </motion.div>
  );
}

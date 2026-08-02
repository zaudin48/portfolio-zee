import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

const REST_LENGTH = 190; // how far down the thread the spider hangs
const PULL_THRESHOLD = 90; // px of pull-down needed at the top to trigger a "refresh"
const MARGIN_LEFT = 32; // resting position — near the left margin, under the logo
const SPIDER_SIZE = 42;

// A small spider (a real 8-legged bug, not any copyrighted character)
// that drops in near the left margin on a fine, glinting silk thread when
// the page loads, idles with a gentle sway, and — if you pull down at the
// very top of the page on a touch device, like pull-to-refresh — slides
// to center, stretches, and reloads.
export default function SpiderVisitor() {
  const controls = useAnimationControls();
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
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
      className="pointer-events-none fixed top-0 z-50 flex flex-col items-center"
      initial={false}
      animate={
        pulling
          ? { left: "50%", x: "-50%", y: pullY }
          : { left: MARGIN_LEFT, x: 0, y: 0 }
      }
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      aria-hidden="true"
    >
      {/* the silk thread — one fine glinting core fiber with tiny flyaway
          split-ends near the tip, the way real spider silk actually frays */}
      <motion.div
        initial={{ height: 0 }}
        animate={controls}
        style={{ transformOrigin: "top center", width: SPIDER_SIZE }}
        className="relative overflow-visible"
      >
        <motion.svg
          width={SPIDER_SIZE}
          height="100%"
          viewBox={`0 0 ${SPIDER_SIZE} 100`}
          preserveAspectRatio="none"
          className="absolute inset-0"
          animate={{ skewX: [0, 3, -2.5, 2, -3, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <defs>
            <filter id="thread-glow" x="-100%" y="-20%" width="300%" height="140%">
              <feGaussianBlur stdDeviation="0.9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* soft under-glow */}
          <path
            d={`M${SPIDER_SIZE / 2},0 Q${SPIDER_SIZE / 2 + 1.5},50 ${SPIDER_SIZE / 2},100`}
            fill="none"
            stroke="var(--color-web)"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.18"
            filter="url(#thread-glow)"
          />

          {/* the crisp main core fiber, runs all the way down flush to the spider */}
          <path
            d={`M${SPIDER_SIZE / 2},0 Q${SPIDER_SIZE / 2 + 1.5},50 ${SPIDER_SIZE / 2},100`}
            fill="none"
            stroke="var(--color-web)"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* tiny flyaway split-end fibers, only near the very tip */}
          {[-3.5, -1.5, 1.8, 3.2].map((dx, i) => (
            <path
              key={i}
              d={`M${SPIDER_SIZE / 2},86 Q${SPIDER_SIZE / 2 + dx / 2},93 ${SPIDER_SIZE / 2 + dx},100`}
              fill="none"
              stroke="var(--color-web)"
              strokeWidth="0.45"
              strokeLinecap="round"
              opacity="0.4"
            />
          ))}
        </motion.svg>
      </motion.div>

      {/* the spider — flush against the thread tip, no gap */}
      {imgFailed ? (
        <motion.div
          className="-mt-2 select-none text-2xl leading-none"
          style={{ transformOrigin: "top center" }}
          animate={{ rotate: [0, 6, -6, 4, -4, 0], x: [0, 2, -2, 1, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          🕷️
        </motion.div>
      ) : (
        <motion.img
          src="/assets/spider.png"
          alt=""
          width={SPIDER_SIZE}
          onError={() => setImgFailed(true)}
          className="-mt-3 select-none"
          style={{ transformOrigin: "top center" }}
          animate={{ rotate: [0, 6, -6, 4, -4, 0], x: [0, 2, -2, 1, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

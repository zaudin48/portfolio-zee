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
      {/* the silk thread — several fine twisted fibers, like real spun silk */}
      <motion.div
        initial={{ height: 0 }}
        animate={controls}
        style={{ transformOrigin: "top center", width: 20 }}
        className="relative mx-auto overflow-visible"
      >
        <motion.svg
          width="20"
          height="100%"
          viewBox="0 0 20 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
          animate={{
            skewX: [0, 4, -3, 3, -4, 0],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {[
            { cx: 10, amp: 4, w: 1, o: 0.55 },
            { cx: 7, amp: 2.5, w: 0.6, o: 0.35 },
            { cx: 13, amp: 2.5, w: 0.6, o: 0.35 },
          ].map((f, i) => (
            <path
              key={i}
              d={`M${f.cx},0 Q${f.cx + f.amp},6 ${f.cx},12 Q${f.cx - f.amp},18 ${f.cx},24 Q${f.cx + f.amp},30 ${f.cx},36 Q${f.cx - f.amp},42 ${f.cx},48 Q${f.cx + f.amp},54 ${f.cx},60 Q${f.cx - f.amp},66 ${f.cx},72 Q${f.cx + f.amp},78 ${f.cx},84 Q${f.cx - f.amp},90 ${f.cx},96 L${f.cx},100`}
              fill="none"
              stroke="var(--color-web)"
              strokeWidth={f.w}
              strokeLinecap="round"
              opacity={f.o}
            />
          ))}
        </motion.svg>
      </motion.div>

      {/* the spider, hanging at the end of the thread */}
      {imgFailed ? (
        <motion.div
          className="-mt-1 select-none text-2xl leading-none"
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
          width={42}
          onError={() => setImgFailed(true)}
          className="-mt-1 select-none"
          style={{ transformOrigin: "top center" }}
          animate={{ rotate: [0, 6, -6, 4, -4, 0], x: [0, 2, -2, 1, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

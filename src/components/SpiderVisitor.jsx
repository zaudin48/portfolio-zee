import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

const REST_LENGTH = 190; // how far down the thread the spider hangs
const PULL_THRESHOLD = 90; // px of pull-down needed at the top to trigger a "refresh"
const MARGIN_LEFT = 32; // resting position — near the left margin, under the logo
const SPIDER_SIZE = 42;
const CX = SPIDER_SIZE / 2;

// Build a series of small curls that spiral around the two main core
// fibers, alternating sides going down — this is what makes it read as
// a twisted cord instead of a plain line.
function buildWrapCurls() {
  const curls = [];
  for (let y = 8; y < 96; y += 11) {
    const dir = curls.length % 2 === 0 ? 1 : -1;
    curls.push(
      `M${CX - 2},${y} Q${CX + dir * 6},${y + 5.5} ${CX - 2},${y + 11}`
    );
  }
  return curls;
}
const WRAP_CURLS = buildWrapCurls();

// A small spider (a real 8-legged bug, not any copyrighted character)
// hanging from a twisted silk cord — two main core fibers with thin
// strands spiraling around them, the way real spun/plied silk looks.
// The thread and the spider are one single rigid swinging unit (same
// transform-origin, same animation) so they always move together.
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
      {/* ONE rigid swinging unit: thread + spider share this single slow
          sway, so they always move together, never independently */}
      <motion.div
        style={{ transformOrigin: "top center", width: SPIDER_SIZE }}
        className="flex flex-col items-center"
        animate={{ rotate: [0, 2.5, -2, 1.5, -1.5, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* the twisted cord — two main core fibers, thin strands curling
            around them like real plied/spun silk */}
        <motion.div
          initial={{ height: 0 }}
          animate={controls}
          style={{ width: SPIDER_SIZE }}
          className="relative overflow-visible"
        >
          <svg
            width={SPIDER_SIZE}
            height="100%"
            viewBox={`0 0 ${SPIDER_SIZE} 100`}
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            <defs>
              <filter id="thread-glow" x="-100%" y="-20%" width="300%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* soft under-glow behind the two main fibers */}
            <path d={`M${CX - 1.6},0 L${CX - 1.6},100`} stroke="var(--color-web)" strokeWidth="2.2" opacity="0.15" filter="url(#thread-glow)" strokeLinecap="round" />
            <path d={`M${CX + 1.6},0 L${CX + 1.6},100`} stroke="var(--color-web)" strokeWidth="2.2" opacity="0.15" filter="url(#thread-glow)" strokeLinecap="round" />

            {/* two main core fibers, running straight down together */}
            <path d={`M${CX - 1.6},0 L${CX - 1.6},100`} stroke="var(--color-web)" strokeWidth="1" opacity="0.85" strokeLinecap="round" />
            <path d={`M${CX + 1.6},0 L${CX + 1.6},100`} stroke="var(--color-web)" strokeWidth="1" opacity="0.85" strokeLinecap="round" />

            {/* thin strands spiraling around the main fibers — the twist */}
            {WRAP_CURLS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="var(--color-web)"
                strokeWidth="0.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            ))}
          </svg>
        </motion.div>

        {/* the spider — flush against the cord, part of the same rigid unit */}
        {imgFailed ? (
          <div className="-mt-2 select-none text-2xl leading-none">🕷️</div>
        ) : (
          <img
            src="/assets/spider.png"
            alt=""
            width={SPIDER_SIZE}
            onError={() => setImgFailed(true)}
            className="-mt-3 select-none"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

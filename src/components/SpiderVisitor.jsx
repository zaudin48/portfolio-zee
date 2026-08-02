import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

const REST_LENGTH = 190; // how far down the margin thread hangs at rest
const PULL_THRESHOLD = 90; // px of pull-down needed at the top to trigger a "refresh"
const PULL_MAX = 150; // how far the center thread can stretch while pulling
const MARGIN_LEFT = 32; // resting position — near the left margin, under the logo
const SPIDER_SIZE = 42;
const CX = SPIDER_SIZE / 2;

// ---------- twisted-cord path generation ----------
// Builds a smooth wavy path so the fiber itself twists along its whole
// length, instead of being a straight line with decoration on top.
function smoothPathFromPoints(points) {
  if (points.length < 2) return "";
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += ` Q${x0.toFixed(2)},${y0.toFixed(2)} ${mx.toFixed(2)},${my.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  d += ` L${last[0].toFixed(2)},${last[1].toFixed(2)}`;
  return d;
}

function wavePath(cx, amp, freqCycles, phaseDeg, height = 100, step = 4) {
  const phase = (phaseDeg * Math.PI) / 180;
  const points = [];
  for (let y = 0; y <= height; y += step) {
    const t = y / height;
    const x = cx + amp * Math.sin(t * freqCycles * 2 * Math.PI + phase);
    points.push([x, y]);
  }
  return smoothPathFromPoints(points);
}

// Two main fibers twisting around each other (opposite phase = they cross
// repeatedly, like a real two-ply twisted cord) plus several thinner
// strands twisting around them at a different rate, for a dense,
// properly-twisted look along the entire length.
function TwistedCord({ height }) {
  const mainFibers = [
    { amp: 3.4, freq: 2.4, phase: 0, w: 1, o: 0.85 },
    { amp: 3.4, freq: 2.4, phase: 180, w: 1, o: 0.85 },
  ];
  const wrapFibers = [
    { amp: 2.1, freq: 4.6, phase: 40, w: 0.5, o: 0.5 },
    { amp: 2.1, freq: 4.6, phase: 220, w: 0.5, o: 0.5 },
    { amp: 1.6, freq: 5.8, phase: 120, w: 0.4, o: 0.4 },
    { amp: 1.6, freq: 5.8, phase: 300, w: 0.4, o: 0.4 },
  ];

  return (
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

      {/* soft under-glow for the two main fibers */}
      {mainFibers.map((f, i) => (
        <path
          key={`glow-${i}`}
          d={wavePath(CX, f.amp, f.freq, f.phase)}
          fill="none"
          stroke="var(--color-web)"
          strokeWidth={f.w * 2.2}
          opacity={0.15}
          filter="url(#thread-glow)"
          strokeLinecap="round"
        />
      ))}

      {/* the two main twisting fibers */}
      {mainFibers.map((f, i) => (
        <path
          key={`main-${i}`}
          d={wavePath(CX, f.amp, f.freq, f.phase)}
          fill="none"
          stroke="var(--color-web)"
          strokeWidth={f.w}
          opacity={f.o}
          strokeLinecap="round"
        />
      ))}

      {/* thinner strands twisting around them */}
      {wrapFibers.map((f, i) => (
        <path
          key={`wrap-${i}`}
          d={wavePath(CX, f.amp, f.freq, f.phase)}
          fill="none"
          stroke="var(--color-web)"
          strokeWidth={f.w}
          opacity={f.o}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function SpiderGlyph({ imgFailed, setImgFailed, className = "" }) {
  if (imgFailed) {
    return <div className={`select-none text-2xl leading-none ${className}`}>🕷️</div>;
  }
  return (
    <img
      src="/assets/spider.png"
      alt=""
      width={SPIDER_SIZE}
      onError={() => setImgFailed(true)}
      className={`select-none ${className}`}
    />
  );
}

// A small spider (a real 8-legged bug, not any copyrighted character)
// that lives near the left margin, hanging from a twisted silk cord —
// two main fibers twisting around each other, with thinner strands
// twisting around them too, the way real plied/spun silk looks. Thread
// and spider are one single rigid swinging unit so they always move
// together, never independently, and the sway is slow and gentle.
//
// Pull-to-refresh (touch, at the very top of the page) doesn't drag this
// same spider across the screen — instead it fades out, and a separate
// new spider drops down the middle on its own cord, growing with your
// finger. Release past the threshold and the page reloads.
export default function SpiderVisitor() {
  const marginControls = useAnimationControls();
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [marginImgFailed, setMarginImgFailed] = useState(false);
  const [pullImgFailed, setPullImgFailed] = useState(false);
  const startY = useRef(null);
  const pullingRef = useRef(false);

  useEffect(() => {
    marginControls.start({
      height: REST_LENGTH,
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
    });
  }, [marginControls]);

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
        setPullY(Math.min(delta * 0.5, PULL_MAX));
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50" aria-hidden="true">
      {/* ---- resting spider, near the left margin ---- */}
      <motion.div
        className="absolute top-0 flex flex-col items-center"
        style={{ left: MARGIN_LEFT, width: SPIDER_SIZE }}
        animate={{ opacity: pulling ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          style={{ transformOrigin: "top center", width: SPIDER_SIZE }}
          className="flex flex-col items-center"
          animate={{ rotate: [0, 2.5, -2, 1.5, -1.5, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ height: 0 }}
            animate={marginControls}
            style={{ width: SPIDER_SIZE }}
            className="relative overflow-visible"
          >
            <TwistedCord />
          </motion.div>
          <SpiderGlyph
            imgFailed={marginImgFailed}
            setImgFailed={setMarginImgFailed}
            className="-mt-3"
          />
        </motion.div>
      </motion.div>

      {/* ---- pull-to-refresh spider, drops fresh in the center ---- */}
      {pulling && (
        <div
          className="absolute top-0 left-1/2 flex flex-col items-center"
          style={{ transform: "translateX(-50%)", width: SPIDER_SIZE }}
        >
          <div style={{ width: SPIDER_SIZE, height: pullY }} className="relative overflow-visible">
            <TwistedCord />
          </div>
          <SpiderGlyph
            imgFailed={pullImgFailed}
            setImgFailed={setPullImgFailed}
            className="-mt-3"
          />
        </div>
      )}
    </div>
  );
}
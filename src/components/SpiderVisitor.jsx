import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { cycleTheme } from "../lib/theme";

const REST_LENGTH = 190; // how far down the margin thread hangs at rest
const MAX_TUG = 110; // how far you can physically pull the margin string
const THEME_SWITCH_RATIO = 0.8; // pull past this fraction of MAX_TUG to swap themes
const PULL_THRESHOLD = 90; // px of pull-down needed at the top to trigger a "refresh"
const PULL_MAX_DRAG = 150; // how far the center thread stretches while your finger is still moving
const FULL_DROP = 230; // the full, satisfying length it snaps to right before reload
const MARGIN_LEFT = 32; // resting position — near the left margin, under the logo
const TOP_OFFSET = 72; // starts below the navbar so it never crosses the name
const SPIDER_SIZE = 42;
const CX = SPIDER_SIZE / 2;

// ---------- twisted-cord path generation ----------
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

function TwistedCord() {
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

      {mainFibers.map((f, i) => (
        <path key={`glow-${i}`} d={wavePath(CX, f.amp, f.freq, f.phase)} fill="none" stroke="var(--color-web)" strokeWidth={f.w * 2.2} opacity={0.15} filter="url(#thread-glow)" strokeLinecap="round" />
      ))}
      {mainFibers.map((f, i) => (
        <path key={`main-${i}`} d={wavePath(CX, f.amp, f.freq, f.phase)} fill="none" stroke="var(--color-web)" strokeWidth={f.w} opacity={f.o} strokeLinecap="round" />
      ))}
      {wrapFibers.map((f, i) => (
        <path key={`wrap-${i}`} d={wavePath(CX, f.amp, f.freq, f.phase)} fill="none" stroke="var(--color-web)" strokeWidth={f.w} opacity={f.o} strokeLinecap="round" />
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

export default function SpiderVisitor({ themes }) {
  const [themeToast, setThemeToast] = useState(null);
  // margin spider: a motion value so it can grow in on load AND be
  // physically tugged by the finger/mouse on top of that
  const threadHeight = useMotionValue(0);
  const [marginImgFailed, setMarginImgFailed] = useState(false);
  const dragStartY = useRef(null);
  const dragBaseHeight = useRef(REST_LENGTH);
  const isDragging = useRef(false);

  // center "pull to reload" spider
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pullImgFailed, setPullImgFailed] = useState(false);
  const pullStartY = useRef(null);
  const pullingRef = useRef(false);

  // drop-in on load
  useEffect(() => {
    const controls = animate(threadHeight, REST_LENGTH, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- physically pulling the margin string ----
  function onStringPointerDown(e) {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragBaseHeight.current = threadHeight.get();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onStringPointerMove(e) {
    if (!isDragging.current) return;
    const delta = e.clientY - dragStartY.current;
    if (delta > 0) {
      threadHeight.set(Math.min(dragBaseHeight.current + delta, REST_LENGTH + MAX_TUG));
    }
  }
  function onStringPointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    const pulled = threadHeight.get() - REST_LENGTH;
    if (pulled > MAX_TUG * THEME_SWITCH_RATIO) {
      const { theme } = cycleTheme(themes);
      setThemeToast(theme?.name || "New theme");
      setTimeout(() => setThemeToast(null), 1600);
    }
    animate(threadHeight, REST_LENGTH, { type: "spring", stiffness: 300, damping: 11 });
  }

  // ---- pull-to-refresh (touch, only at the very top of the page) ----
  useEffect(() => {
    function onTouchStart(e) {
      if (e.target.closest && e.target.closest("[data-spider-string], input, textarea, button, select, a, [contenteditable]")) {
        return;
      }
      if (window.scrollY <= 0) {
        pullStartY.current = e.touches[0].clientY;
        pullingRef.current = true;
        setDragActive(true);
        setPulling(true);
      }
    }
    function onTouchMove(e) {
      if (!pullingRef.current || pullStartY.current == null) return;
      const delta = e.touches[0].clientY - pullStartY.current;
      if (delta > 0 && window.scrollY <= 0) {
        setPullY(Math.min(delta * 0.5, PULL_MAX_DRAG));
      } else {
        pullingRef.current = false;
        setDragActive(false);
        setPulling(false);
        setPullY(0);
      }
    }
    function onTouchEnd() {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      setDragActive(false);
      if (pullY > PULL_THRESHOLD) {
        // commit: snap to a full, satisfying drop length, THEN reload
        setPullY(FULL_DROP);
        setTimeout(() => window.location.reload(), 380);
      } else {
        setPullY(0);
        setTimeout(() => setPulling(false), 280);
      }
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
    <div className="fixed inset-x-0 top-0 z-50" aria-hidden="true">
      {themeToast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full border border-line bg-card/90 px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-crimson backdrop-blur"
          style={{ top: TOP_OFFSET + 10 }}
        >
          {themeToast}
        </motion.div>
      )}
      {/* ---- resting spider, near the left margin — grabbable ---- */}
      <motion.div
        className="pointer-events-none absolute flex flex-col items-center"
        style={{ left: MARGIN_LEFT, top: TOP_OFFSET, width: SPIDER_SIZE }}
        animate={{ opacity: pulling ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* generous invisible hit-area so it's easy to grab on a phone */}
        <div
          className="pointer-events-auto absolute -inset-x-5 top-0 cursor-grab active:cursor-grabbing"
          style={{ height: REST_LENGTH + MAX_TUG + 30, touchAction: "none" }}
          data-spider-string="true"
          onPointerDown={onStringPointerDown}
          onPointerMove={onStringPointerMove}
          onPointerUp={onStringPointerUp}
          onPointerCancel={onStringPointerUp}
        />
        <motion.div style={{ height: threadHeight, width: SPIDER_SIZE }} className="relative overflow-visible">
          <TwistedCord />
        </motion.div>
        <SpiderGlyph imgFailed={marginImgFailed} setImgFailed={setMarginImgFailed} className="-mt-3" />
      </motion.div>

      {/* ---- pull-to-refresh spider, drops fresh in the center ---- */}
      {pulling && (
        <div
          className="pointer-events-none absolute left-1/2 flex flex-col items-center"
          style={{ transform: "translateX(-50%)", top: TOP_OFFSET, width: SPIDER_SIZE }}
        >
          <div
            style={{
              width: SPIDER_SIZE,
              height: pullY,
              transition: dragActive ? "none" : "height 320ms cubic-bezier(0.22,1,0.36,1)",
            }}
            className="relative overflow-visible"
          >
            <TwistedCord />
          </div>
          <SpiderGlyph imgFailed={pullImgFailed} setImgFailed={setPullImgFailed} className="-mt-3" />
        </div>
      )}
    </div>
  );
}
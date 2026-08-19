import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { detectDevice } from "../lib/deviceDetect";
import {
  getOrCreateSessionId,
  initVisitor,
  recordPageVisit,
  flushHeartbeat,
} from "../lib/visitorTracking";
            
const HEARTBEAT_MS = 30000; // one batched write every 30s, not per-click/per-second

// Mount this once, inside your Router, e.g. in App.jsx:
//   <TrackVisitor />
// Optionally pass an email/user id if you ever have one:
//   <TrackVisitor email={loggedInUser?.email} />
export default function TrackVisitor({ email, exclude = ["/admin"] }) {
  const location = useLocation();
  const sessionRef = useRef(null);
  const clicksRef = useRef(0);
  const lastFlushRef = useRef(Date.now());
  const initializedRef = useRef(false);

  const isExcluded = exclude.some((p) => location.pathname.startsWith(p));

  // one-time setup: session id + visitor doc, once per browser
  useEffect(() => {
    if (isExcluded) return;
    const { id } = getOrCreateSessionId();
    sessionRef.current = id;
    if (!initializedRef.current) {
      initializedRef.current = true;
      initVisitor({
        sessionId: id,
        deviceInfo: detectDevice(),
        referrer: document.referrer,
        email,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExcluded]);

  // record a page visit whenever the route changes
  useEffect(() => {
    if (isExcluded || !sessionRef.current) return;
    recordPageVisit(sessionRef.current, location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isExcluded]);

  // batched click counter — accumulated locally, flushed on the heartbeat
  useEffect(() => {
    if (isExcluded) return;
    function onClick() {
      clicksRef.current += 1;
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [isExcluded]);

  // heartbeat: every 30s (only while the tab is actually visible), flush
  // accumulated time + clicks in a single write
  useEffect(() => {
    if (isExcluded) return;

    function flush() {
      if (!sessionRef.current || document.visibilityState !== "visible") return;
      const now = Date.now();
      const secondsSpent = Math.round((now - lastFlushRef.current) / 1000);
      lastFlushRef.current = now;
      const clickCount = clicksRef.current;
      clicksRef.current = 0;
      flushHeartbeat(sessionRef.current, { secondsSpent, clickCount });
    }

    const interval = setInterval(flush, HEARTBEAT_MS);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        lastFlushRef.current = Date.now(); // don't count away-time as time-on-page
      } else {
        flush(); // flush what we have before the tab goes hidden
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isExcluded]);

  return null;
}
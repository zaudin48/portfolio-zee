import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Hidden entrance to the admin panel:
//  - Desktop: Shift + L
//  - Mobile: double-tap anywhere within 350ms
const DOUBLE_TAP_WINDOW_MS = 350;

function isTypingTarget(target) {
  return Boolean(
    target?.closest &&
      target.closest("input, textarea, select, [contenteditable], button, a")
  );
}

export default function SecretGesture() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastTap = useRef(0);

  useEffect(() => {
    // Already in the admin area — the gesture has nothing to do here,
    // and would otherwise yank you back to the login screen mid-edit.
    if (location.pathname.startsWith("/admin")) return;

    function onKeyDown(e) {
      if (isTypingTarget(e.target)) return; // typing "Learning" etc. shouldn't trigger it
      if (e.shiftKey && e.key.toLowerCase() === "l") {
        navigate("/admin/login");
      }
    }

    function onTouchStart(e) {
      if (isTypingTarget(e.target)) return; // tapping a field/button shouldn't trigger it
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_WINDOW_MS) {
        navigate("/admin/login");
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("touchstart", onTouchStart);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, [navigate, location.pathname]);

  return null;
}
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Hidden entrance to the admin panel:
//  - Desktop: Shift + L
//  - Mobile: double-tap anywhere within 350ms
const DOUBLE_TAP_WINDOW_MS = 350;

export default function SecretGesture() {
  const navigate = useNavigate();
  const lastTap = useRef(0);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.shiftKey && e.key.toLowerCase() === "l") {
        navigate("/admin/login");
      }
    }

    function onTouchStart() {
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
  }, [navigate]);

  return null;
}

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Hidden entrance to the admin panel — desktop only: Shift + L.
// (The mobile entrance is now "tap the logo 7 times" — see Navbar.jsx —
// since double-tap-anywhere kept firing on ordinary scroll/tap gestures.)
//
// Disarms itself once you're already inside /admin, and ignores the key
// while a form field is focused, so Shift+L while typing "Landing" in an
// admin text field doesn't yank you back to the login screen mid-edit.
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export default function SecretGesture() {
  const navigate = useNavigate();
  const location = useLocation();
  const onAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (onAdminRoute) return;

    function onKeyDown(e) {
      if (isTypingTarget(e.target)) return;
      if (e.shiftKey && e.key.toLowerCase() === "l") {
        navigate("/admin/login");
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navigate, onAdminRoute]);

  return null;
}
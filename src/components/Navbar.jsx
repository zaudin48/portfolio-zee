import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/contact", label: "Contact" },
];

// Tap the logo this many times, each within ADMIN_TAP_WINDOW_MS of the
// last, to reach the admin login — the phone-friendly replacement for the
// old "double-tap anywhere" gesture, which kept firing on ordinary scrolls.
const ADMIN_TAP_TARGET = 7;
const ADMIN_TAP_WINDOW_MS = 600;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [tapHint, setTapHint] = useState("");
  const tapCount = useRef(0);
  const lastTapAt = useRef(0);
  const hintTimeout = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const onAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => () => clearTimeout(hintTimeout.current), []);

  function handleLogoClick(e) {
    if (onAdminRoute) return; // already inside admin — just a normal link home

    const now = Date.now();
    tapCount.current = now - lastTapAt.current > ADMIN_TAP_WINDOW_MS ? 1 : tapCount.current + 1;
    lastTapAt.current = now;

    if (tapCount.current >= ADMIN_TAP_TARGET) {
      e.preventDefault();
      tapCount.current = 0;
      setTapHint("");
      navigate("/admin/login");
      return;
    }

    const remaining = ADMIN_TAP_TARGET - tapCount.current;
    setTapHint(remaining <= 3 ? `${remaining} more tap${remaining === 1 ? "" : "s"}...` : "");

    clearTimeout(hintTimeout.current);
    hintTimeout.current = setTimeout(() => {
      tapCount.current = 0;
      setTapHint("");
    }, ADMIN_TAP_WINDOW_MS);
  }

  return (
    <header
      className="sticky top-0 z-60 border-b border-line/60 bg-ink/70 backdrop-blur-md"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="relative">
          <NavLink
            to="/"
            onClick={handleLogoClick}
            className="font-display text-2xl tracking-wide text-web"
          >
            ZAUDIN<span className="text-crimson">.</span>
          </NavLink>
          {tapHint && (
            <span className="absolute -bottom-4 left-0 whitespace-nowrap font-mono text-[10px] text-muted">
              {tapHint}
            </span>
          )}
        </div>

        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `font-mono text-sm uppercase tracking-widest transition-colors ${
                  isActive ? "text-crimson" : "text-muted hover:text-web"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="text-web md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-line/40 py-3 font-mono text-sm uppercase tracking-widest ${
                      isActive ? "text-crimson" : "text-muted"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
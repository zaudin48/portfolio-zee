const STORAGE_KEY = "zaudin-theme-index";

// The site is always guaranteed at least this one theme, even before
// you've added any in the admin panel — it's the original red/black look.
export const FALLBACK_THEME = {
  name: "Crimson",
  bg: "#0a0a0d",
  card: "#191b22",
  line: "#262a34",
  accent: "#c8202b",
  accentGlow: "#ff3b44",
  text: "#eeece4",
  muted: "#8b8f9a",
  backgroundStyle: "webs",
};

const THEME_CHANGE_EVENT = "zaudin-theme-changed";

// Applies a theme by setting the same CSS custom properties every
// utility class and custom style in the site already reads from
// (see the @theme block in src/index.css). Because Tailwind v4's
// generated classes reference var(--color-x) rather than baking in a
// literal hex value, this re-themes the entire site live, instantly,
// with no rebuild needed.
export function applyTheme(theme) {
  const t = { ...FALLBACK_THEME, ...theme };
  const root = document.documentElement.style;
  root.setProperty("--color-ink", t.bg);
  root.setProperty("--color-ink-soft", t.card);
  root.setProperty("--color-card", t.card);
  root.setProperty("--color-line", t.line);
  root.setProperty("--color-crimson", t.accent);
  root.setProperty("--color-crimson-glow", t.accentGlow);
  root.setProperty("--color-web", t.text);
  root.setProperty("--color-muted", t.muted);
  // lets any mounted component (like the background picker) react to a
  // theme swap no matter where it was triggered from
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: t }));
}

export function onThemeChange(callback) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

export function getStoredThemeIndex() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw == null ? 0 : parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

export function setStoredThemeIndex(index) {
  window.localStorage.setItem(STORAGE_KEY, String(index));
}

// Applies whichever theme the visitor last picked (or the first one) from
// a given theme list — call this once at app startup and whenever the
// theme list changes.
export function applyStoredTheme(themes) {
  const list = themes && themes.length ? themes : [FALLBACK_THEME];
  const index = getStoredThemeIndex() % list.length;
  applyTheme(list[index]);
  return index;
}

// Moves to the next theme (wrapping back to the first after the last),
// applies it immediately, and remembers the choice for next time.
export function cycleTheme(themes) {
  const list = themes && themes.length ? themes : [FALLBACK_THEME];
  const next = (getStoredThemeIndex() + 1) % list.length;
  setStoredThemeIndex(next);
  applyTheme(list[next]);
  return { index: next, theme: list[next] };
}
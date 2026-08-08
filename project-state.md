# Zaudin Portfolio — Project State / Handoff Notes

## What this is
A React + Vite portfolio, hosted free on GitHub Pages via GitHub Actions
(auto-builds on every push). Content (projects, games, site text, themes)
lives in Firebase Firestore and is editable live through a hidden admin
panel — no code editing needed for day-to-day updates.

## Stack
- React 19 + Vite 8, React Router (HashRouter — avoids GitHub Pages
  subpath/404 issues)
- Tailwind CSS v4 (CSS-first config via `@theme` block in `src/index.css`,
  no `tailwind.config.js`)
- Framer Motion for all animation
- Firebase: Firestore (data) + Auth (admin login), no Storage (images are
  just pasted URLs to avoid Firebase's card-required Storage tier)

## Folder structure
```
src/
  components/  Navbar, Hero, WorkCard, About, Experience, Connect,
               Footer, WebBackground, WebClickBurst, SecretGesture,
               SpiderVisitor
  pages/       Home, Work, Contact, AdminLogin, AdminPanel
  lib/         firebase.js (connection), data.js (Firestore reads/writes
               + DEFAULT_SETTINGS schema), useAuth.js, theme.js (color
               palette engine)
.github/workflows/deploy.yml   auto build+deploy on push to main
firestore.rules                 public read, auth-only write
.env.example                    local dev env template
```

## Design system
- Colors/fonts defined as CSS variables in `src/index.css` `@theme` block:
  `--color-ink`, `--color-ink-soft`, `--color-card`, `--color-line`,
  `--color-crimson`, `--color-crimson-glow`, `--color-web`, `--color-muted`,
  `--color-amber`. Tailwind v4 generates utilities (`bg-ink`, `text-crimson`
  etc.) that reference these vars at runtime — NOT baked in at build time.
  This is what makes the live theme-swap system work.
- Fonts: Bebas Neue (display/headings), Inter (body), JetBrains Mono
  (labels/mono text).
- `.spidey-glow` (hover lift+glow) and `.web-divider` (gradient hr) are
  reusable utility classes defined in index.css.

## The settings/content model (Firestore)
One document: `settings/site`. Schema + defaults live in
`src/lib/data.js` as `DEFAULT_SETTINGS`. Includes hero text, about text,
contact info, Formspree URL, resume/LinkedIn/Instagram URLs,
`experienceItems` (array), and `themes` (array). A second collection,
`work`, holds projects/games (`title, description, link, image, category`).
Both are read live via `onSnapshot` — any admin edit appears on the live
site instantly, no rebuild.

## Admin panel
- Hidden entrance: Shift+L (desktop) or double-tap (mobile) on the
  **home page only** → `/admin/login`. Guarded against firing while
  already in `/admin/*`, and while typing/tapping real form elements
  (`SecretGesture.jsx`).
- Auth: Firebase email/password, one manually-created user via Firebase
  console (Authentication → Users).
- `AdminPanel.jsx` manages: work items (projects/games), site settings
  (text fields), experience timeline (add/edit/remove rows), and themes
  (add/edit/remove color palettes, 7 color pickers each: bg, card, line,
  accent, accentGlow, text, muted).

## The theme system (`src/lib/theme.js`)
- `applyTheme(theme)` — sets the 8 CSS vars on `document.documentElement`.
  Because Tailwind utilities read these vars live, this re-skins the
  whole site instantly with zero rebuild.
- `applyStoredTheme(themes)` — called once in `App.jsx` on load and
  whenever `settings.themes` changes; reads the visitor's last choice
  from `localStorage` (key: `zaudin-theme-index`) and applies it. Runs
  on every page, not just home, so the choice persists site-wide.
- `cycleTheme(themes)` — advances to next theme (wraps to 0 after the
  last), saves to localStorage, applies it. Triggered from
  `SpiderVisitor.jsx` when the margin string is pulled past
  `MAX_TUG * THEME_SWITCH_RATIO` (currently 0.8) and released — a light
  tug just springs back with no theme change.
- Empty `themes` array → falls back to `FALLBACK_THEME` (the original
  red/black look), defined in `theme.js` itself.

## The spider (`src/components/SpiderVisitor.jsx`) — the trickiest file
- Only rendered on the home page (`/`), gated via a small wrapper in
  `App.jsx` (`HomeOnlySpider`) using `useLocation()`. It used to be global
  and caused bugs (blocking taps, showing on login page) — keep it
  home-only.
- Two independent hanging cords, both built from the same `TwistedCord`
  component (two main fibers 180° out of phase + 4 thinner wrap fibers,
  all generated via a sine-wave path helper — not a static image):
  1. **Margin spider** (rests near the left margin, under the logo) —
     drops in on load via a Framer Motion `useMotionValue`, and is
     **physically draggable** via Pointer Events (`onPointerDown/Move/Up`
     on an invisible wider hit-box marked `data-spider-string="true"` so
     other touch listeners can recognize and ignore it). Springs back on
     release; a *hard* pull past the threshold cycles the theme instead.
  2. **Pull-to-refresh spider** — separate instance, only mounts while
     `pulling` is true (touch-drag at `window.scrollY <= 0`). On release
     past `PULL_THRESHOLD`, snaps to `FULL_DROP` length first, waits
     ~380ms so the animation is visible, then `window.location.reload()`.
     This listener explicitly ignores touches starting on
     `[data-spider-string]` or any real form element, to avoid conflicting
     with the draggable margin string or with typing/tapping in forms.
- The spider image itself: `public/assets/spider.png` (a real 8-legged
  spider illustration, deliberately NOT any copyrighted character — the
  whole site's "web-slinger" look is an original aesthetic, not Spider-Man
  IP). Falls back to a 🕷️ emoji if the image fails to load.

## Known constraints / house rules from this project
- **Never reproduce copyrighted characters/IP** (Spider-Man, Daredevil,
  Loki, Moon Knight etc.) — any "theme" inspired by these is built as an
  original color palette only, never actual character art/logos/costumes.
- Images (profile, cover, project thumbnails) are always just pasted
  URLs — never Firebase Storage uploads, to keep the free tier truly free
  (no card required).
- The user has repeatedly asked for targeted edits over full-file
  dumps when a change is small — prefer `str_replace`-style patches and
  explain changes in plain English rather than re-pasting entire files
  when only a few lines changed.
- GitHub Actions secrets must be named EXACTLY: `VITE_FIREBASE_API_KEY`,
  `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
  `VITE_FIREBASE_APP_ID` — a past bug was these being named without the
  `VITE_FIREBASE_` prefix, causing silent build failures.

## Still open / discussed but not yet built
- Nothing currently pending as of this note — last batch of work was the
  theme system + two bug fixes (SecretGesture firing during typing/while
  already in admin; SpiderVisitor blocking taps and appearing on non-home
  pages).

## How to verify changes locally before pushing (optional)
```bash
npm install
npm run build    # must complete with no errors
```
Full local preview with live Firebase data needs a `.env` file — see
`.env.example` and the main `README.md`.
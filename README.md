# Zaudin — Portfolio (React + Firebase)

A React rebuild of your portfolio: same idea, way more animated, with a
dark red/black "web-slinger" aesthetic — plus a small spider that drops
in on a web thread when the page loads. There's a live admin panel so
you can add projects, add games, and edit your info **without ever
opening a code editor again**. You only touch code once, during setup
below.

## How it works, in one paragraph
The site is built once by GitHub Actions and hosted free on GitHub Pages.
All your content (projects, games, contact info, hero text) lives in
Firebase — a free Google database. When you're signed in as admin and you
add a project, it appears on the live site **instantly**, because the
site reads straight from that database every time someone visits. No
rebuild, no git push, no VS Code.

## One-time setup (~15 minutes)

### 1. Create a Firebase project
1. Go to https://console.firebase.google.com -> **Add project** -> give it
   any name -> you can skip Google Analytics.
2. In the left sidebar: **Build -> Firestore Database** -> **Create database**
   -> start in **production mode** -> pick any region -> Done.
3. Still in Firestore, go to the **Rules** tab, delete what's there, and
   paste in the contents of `firestore.rules` from this repo -> **Publish**.
4. In the left sidebar: **Build -> Authentication** -> **Get started** ->
   enable the **Email/Password** provider.
5. Still in Authentication, go to the **Users** tab -> **Add user** -> enter
   an email and password for yourself. This is what you'll log in with on
   the site — it's separate from your actual Gmail, use whatever you like.

### 2. Get your Firebase config
1. Click the gear icon next to "Project Overview" -> **Project settings**.
2. Scroll to "Your apps" -> click the **</>** (web) icon -> give it any
   nickname -> **Register app**.
3. You'll see a code block with `apiKey`, `authDomain`, `projectId`, etc.
   Keep this tab open, you'll need these six values in the next step.

### 3. Add your Firebase config as GitHub secrets
1. In your GitHub repo: **Settings -> Secrets and variables -> Actions**.
2. Click **New repository secret** six times, once for each of these
   (name must match exactly, value comes from step 2):

   | Secret name | Firebase config field |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | apiKey |
   | `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
   | `VITE_FIREBASE_PROJECT_ID` | projectId |
   | `VITE_FIREBASE_STORAGE_BUCKET` | storageBucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
   | `VITE_FIREBASE_APP_ID` | appId |

### 4. Turn on GitHub Pages
1. **Settings -> Pages**.
2. Under **Source**, choose **GitHub Actions** (not "Deploy from a branch"
   — this repo already includes the workflow that builds and deploys it).

### 5. Push this repo to GitHub
Upload all these files to your GitHub repo (or `git push` if you're
already set up). Go to the **Actions** tab and watch it build — takes
about a minute. Once it's green, your site link is under **Settings ->
Pages** at the top.

That's the entire one-time setup. From here on, no more code.

## Using the admin panel
- **On desktop:** press **Shift + L** anywhere on the site.
- **On mobile:** double-tap anywhere on the screen.
- Log in with the email/password you created in step 1.5 above.
- From there you can:
  - Add/edit/delete **projects and games** — title, description, a
    link, and an optional image (just paste an image URL — no upload
    needed, so there's no storage cost).
  - Edit your **name, tagline, hero text, cover banner, profile photo,
    experience, and contact details** — all live-updating.
  - Set your **Formspree URL** so the contact form actually emails you
    (sign up free at https://formspree.io, create a form, paste the URL
    it gives you into the admin panel).

Every change shows up on the live site within a second or two, for every
visitor — no redeploy.

## The animations
- **Web-strand background** — a quiet lattice of drifting silk lines
  behind every page (`src/components/WebBackground.jsx`).
- **Spider drop-in** — a small spider drops down a thread when the page
  loads, then sways gently (`src/components/SpiderVisitor.jsx`). It's a
  real spider (8 legs, no costume) rather than any copyrighted character.
- **Pull-to-refresh** — on a phone, pull down while already at the top of
  the page: the thread stretches and the spider follows your finger. Let
  go past the threshold and the page reloads, replaying the drop-in.
- **Web-shot burst** — click any empty part of the page and a quick burst
  of threads fires from that spot (`src/components/WebClickBurst.jsx`).
- **Spidey-glow** — cards lift and glow red on hover (`.spidey-glow` in
  `src/index.css`).

All of this respects `prefers-reduced-motion` — if a visitor's system has
reduced motion turned on, the animations calm down automatically.

## Local development (optional)
Only needed if you want to preview changes on your own computer:
```bash
npm install
cp .env.example .env      # then fill in the same 6 Firebase values
npm run dev
```

## Design notes
- Color palette and fonts live in `src/index.css` under the `@theme`
  block — tweak the hex values there to shift the whole look.
- `src/components/Hero.jsx` has the Facebook-style cover banner behind
  the profile photo.

## Folder structure
```
src/
  components/   Navbar, Hero, WorkCard, WebBackground, SpiderVisitor,
                WebClickBurst, SecretGesture, Footer, About
  pages/        Home, Work, Contact, AdminLogin, AdminPanel
  lib/          firebase.js (connection), data.js (reads/writes), useAuth.js
.github/workflows/deploy.yml   Auto build + deploy on every push
firestore.rules                 Database security rules (paste into Firebase console)
.env.example                    Template for local development
```

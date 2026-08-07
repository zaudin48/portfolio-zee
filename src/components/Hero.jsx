import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Connect from "../components/Connect";


const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1600&q=80"; // dark city skyline at night
const DEFAULT_PROFILE = "./assets/profile.jpg";

export default function Hero({ settings }) {
  const [typed, setTyped] = useState("");
  const strings = settings?.heroTagline?.length
    ? settings.heroTagline
    : ["Frontend Developer", "Fast UI builder", "Event Manager"];

  // Lightweight typewriter loop — no external dependency needed.
  useEffect(() => {
    let stringIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout;

    function tick() {
      const current = strings[stringIndex];
      if (!deleting) {
        charIndex++;
        setTyped(current.slice(0, charIndex));
        if (charIndex === current.length) {
          deleting = true;
          timeout = setTimeout(tick, 1400);
          return;
        }
      } else {
        charIndex--;
        setTyped(current.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          stringIndex = (stringIndex + 1) % strings.length;
        }
      }
      timeout = setTimeout(tick, deleting ? 35 : 65);
    }

    timeout = setTimeout(tick, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(strings)]);

  return (
    <section className="relative">
      {/* COVER BANNER — Facebook-style band behind the profile photo */}
      <div className="relative h-52 w-full overflow-hidden sm:h-64 md:h-80">
        <img
          src={settings?.coverImage || DEFAULT_COVER}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-ink/20 via-ink/60 to-ink" />
        <div className="absolute inset-0 bg-crimson/10 mix-blend-multiply" />
      </div>

      {/* PROFILE PHOTO — overlaps the bottom of the banner */}
      <div className="mx-auto -mt-16 flex max-w-6xl justify-center px-5 sm:-mt-20 sm:justify-start md:-mt-24">
        <motion.div
          initial={{ opacity: 0, y: -40, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 11, delay: 0.15 }}
        className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-ink bg-card shadow-[0_0_0_2px_var(--color-crimson)] sm:h-40 sm:w-40 md:h-48 md:w-48"
        >
          <img
            src={settings?.profileImage || DEFAULT_PROFILE}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <Connect settings={settings} />
      </div>

      {/* TEXT */}
      <div className="mx-auto max-w-6xl px-5 pt-8 text-center sm:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display text-5xl leading-none sm:text-6xl md:text-7xl"
        >
          Hi, I'm <span className="text-crimson">{settings?.name || "Zaudin"}</span>
        </motion.h1>

        <div className="mt-4 h-8 font-mono text-xl text-amber sm:text-2xl">
          {typed}
          <span className="animate-pulse">|</span>
        </div>

        <p className="mx-auto mt-3 max-w-xl text-muted sm:mx-0">
          {settings?.heroSub ||
            "Frontend Developer • Event Manager • Fast AI-powered builder"}
        </p>

        <div className="mt-8 flex justify-center gap-4 sm:justify-start">
          <Link
            to="/work"
            className="rounded-lg bg-crimson px-6 py-3 font-semibold text-ink transition hover:bg-crimson-glow"
          >
            See work
          </Link>
          <Link
            to="/contact"
            className="rounded-lg border border-line px-6 py-3 font-semibold text-muted transition hover:border-crimson hover:text-web"
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}

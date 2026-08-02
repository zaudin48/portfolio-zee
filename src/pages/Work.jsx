import { useState } from "react";
import WorkCard from "../components/WorkCard";

const TABS = [
  { key: "all", label: "All" },
  { key: "project", label: "Projects" },
  { key: "game", label: "Games" },
];

export default function Work({ work }) {
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? work : work.filter((w) => w.category === tab);

  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="font-display text-5xl">My Work</h1>
      <p className="mt-2 text-muted">Projects, builds, and games — all in one place.</p>

      <div className="mt-8 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 font-mono text-sm uppercase tracking-wide transition ${
              tab === t.key
                ? "bg-crimson text-ink"
                : "border border-line text-muted hover:border-crimson hover:text-web"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {filtered.length === 0 ? (
          <p className="text-muted">Nothing here yet — add one from the admin panel.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <WorkCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { motion } from "framer-motion";

export default function Experience({ settings }) {
  const items = settings?.experienceItems || [];
  if (items.length === 0 && !settings?.resumeUrl) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl">Experience</h2>
          <p className="mt-1 text-muted">Where I've worked and what I've built.</p>
        </div>
        {settings?.resumeUrl && (
          <a
            href={settings.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-crimson px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-crimson-glow"
          >
            Download Resume ↓
          </a>
        )}
      </div>

      {items.length > 0 && (
        <div className="relative border-l border-line pl-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative mb-10 last:mb-0"
            >
              <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full bg-crimson shadow-[0_0_0_4px_var(--color-ink)]" />
              <div className="font-mono text-xs uppercase tracking-wide text-crimson">
                {item.period}
              </div>
              <h3 className="mt-1 font-display text-2xl">{item.role}</h3>
              <div className="text-sm text-muted">{item.org}</div>
              {item.description && (
                <p className="mt-2 max-w-2xl text-sm text-muted">{item.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
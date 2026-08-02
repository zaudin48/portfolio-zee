import { motion } from "framer-motion";

export default function WorkCard({ item, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
      className="spidey-glow flex flex-col overflow-hidden rounded-2xl border border-line bg-card"
    >
      {item.image && (
        <div className="h-44 w-full overflow-hidden">
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-crimson/15 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide text-crimson">
            {item.category === "game" ? "Game" : "Project"}
          </span>
        </div>
        <h3 className="mt-3 font-display text-2xl">{item.title}</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{item.description}</p>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center gap-1 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-web transition hover:border-crimson hover:text-crimson"
          >
            Open ↗
          </a>
        )}
      </div>
    </motion.div>
  );
}

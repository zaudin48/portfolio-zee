import { useState } from "react";
import { motion } from "framer-motion";

const CLAMP_LINES = 4;

export default function WorkCard({ item, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const description = item.description || "";
  // Rough heuristic for whether the description is even long enough to
  // need clamping in the first place — avoids showing a pointless
  // "Read more" on a one-line description.
  const isLong = description.length > 160;

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

        <p
          className="mt-1 flex-1 text-sm text-muted"
          style={
            !expanded && isLong
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: CLAMP_LINES,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {description}
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 w-fit text-xs font-semibold text-crimson hover:text-crimson-glow"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-web transition hover:border-crimson hover:text-crimson"
            >
              Open ↗
            </a>
          )}
          {item.githubUrl && (
            <a
              href={item.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-web transition hover:border-crimson hover:text-crimson"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
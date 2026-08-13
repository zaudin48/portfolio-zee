import { motion } from "framer-motion";

const DEFAULT_SKILLS = [
  { label: "Frontend", value: 98 },
  { label: "UI/UX", value: 92 },
  { label: "Event Mgmt", value: 88 },
  { label: "Branding", value: 79 },
  { label: "Canva", value: 72 },
  { label: "AI Tools", value: 67 },
];

export default function About({ settings }) {
  const years = settings?.yearsExperience ?? 2;
  const skills = settings?.skills?.length ? settings.skills : DEFAULT_SKILLS;

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="text-center">
        <h2 className="font-display text-4xl sm:text-5xl">
          {settings?.aboutTitle || "My Advantage"}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          {settings?.aboutSub ||
            "A blend of hands-on experience in design, frontend development, event execution, and AI-powered productivity — giving me an unfair edge in modern projects."}
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="spidey-glow flex flex-col justify-center rounded-2xl border border-line bg-card p-8"
        >
          <div className="font-display text-7xl text-crimson">
            {String(years).padStart(2, "0")}
          </div>
          <div className="mt-1 text-lg">Years of Experience</div>
          <div className="mt-5 w-fit rounded-lg bg-crimson/15 px-4 py-2 font-mono text-sm text-crimson">
            100% Client Satisfaction
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2">
          {skills.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="spidey-glow flex min-h- flex-col items-center justify-center rounded-2xl border border-line bg-card p-6 text-center"
            >
              <div className="font-display text-3xl text-crimson">{s.value}%</div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
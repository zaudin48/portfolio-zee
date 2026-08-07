export default function Connect({ settings }) {
  const links = [
    settings?.linkedinUrl && { label: "LinkedIn", url: settings.linkedinUrl },
    settings?.instagramUrl && { label: "Instagram", url: settings.instagramUrl },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-card px-6 py-10 text-center">
        <h2 className="font-display text-3xl">Let's Connect</h2>
        <p className="max-w-md text-sm text-muted">
          Find me elsewhere on the web.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold transition hover:border-crimson hover:text-crimson"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
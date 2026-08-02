import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import About from "../components/About";
import WorkCard from "../components/WorkCard";

export default function Home({ settings, work }) {
  const featured = work.slice(0, 3);

  return (
    <>
      <Hero settings={settings} />
      <About settings={settings} />

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl">Latest Work</h2>
          <Link to="/work" className="font-mono text-sm text-crimson hover:underline">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-muted">
            No projects yet — add some from the admin panel and they'll show up here.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, i) => (
              <WorkCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

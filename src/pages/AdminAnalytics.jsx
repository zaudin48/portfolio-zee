import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  subscribeRecentVisitors,
  fetchAllVisitors,
  cleanupOldVisitors,
} from "../lib/visitorTracking";

const POLL_MS = 5000;
const PIE_COLORS = ["#c8202b", "#ff3b44", "#f2a93b", "#8b8f9a", "#eeece4"];

function tsToMillis(ts) {
  return ts?.toMillis ? ts.toMillis() : 0;
}

function formatDuration(seconds) {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function buildHourlyBuckets(visitors) {
  const now = Date.now();
  const buckets = Array.from({ length: 24 }, (_, i) => {
    const hourStart = now - (23 - i) * 60 * 60 * 1000;
    return { hour: new Date(hourStart).getHours() + ":00", count: 0, start: hourStart };
  });
  visitors.forEach((v) => {
    (v.pageVisits || []).forEach((pv) => {
      const t = tsToMillis(pv.enteredAt);
      if (!t) return;
      const bucket = buckets.find((b, i) => {
        const next = buckets[i + 1]?.start ?? now + 3600000;
        return t >= b.start && t < next;
      });
      if (bucket) bucket.count += 1;
    });
  });
  return buckets;
}

function countBy(visitors, field) {
  const counts = {};
  visitors.forEach((v) => {
    const key = v[field] || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function topPages(visitors) {
  const counts = {};
  visitors.forEach((v) => {
    (v.pageVisits || []).forEach((pv) => {
      counts[pv.path] = (counts[pv.path] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export default function AdminAnalytics() {
  const [recent, setRecent] = useState([]);
  const [all, setAll] = useState([]);
  const [cleaning, setCleaning] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState("");

  useEffect(() => {
    const unsub = subscribeRecentVisitors(setRecent, 10);
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const data = await fetchAllVisitors();
      if (!cancelled) setAll(data);
    }
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const hourly = useMemo(() => buildHourlyBuckets(all), [all]);
  const deviceData = useMemo(() => countBy(all, "deviceType"), [all]);
  const browserData = useMemo(() => countBy(all, "browser"), [all]);
  const brandData = useMemo(
    () => countBy(all.filter((v) => v.deviceType === "phone" && v.brand), "brand"),
    [all]
  );
  const pages = useMemo(() => topPages(all), [all]);

  const totalVisitors = all.length;
  const avgTime =
    totalVisitors === 0
      ? 0
      : all.reduce((sum, v) => sum + (v.totalTimeSpent || 0), 0) / totalVisitors;
  const bounced = all.filter((v) => (v.pageVisits || []).length <= 1).length;
  const bounceRate = totalVisitors === 0 ? 0 : Math.round((bounced / totalVisitors) * 100);

  async function handleCleanup() {
    setCleaning(true);
    setCleanupMsg("");
    const removed = await cleanupOldVisitors(90);
    setCleanupMsg(`Removed ${removed} visitor${removed === 1 ? "" : "s"} older than 90 days.`);
    setCleaning(false);
    setTimeout(() => setCleanupMsg(""), 4000);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl sm:text-4xl">
          Visitor <span className="text-crimson">Analytics</span>
        </h1>
        <Link
          to="/admin"
          className="w-fit rounded-lg border border-line px-4 py-2 text-sm text-muted hover:border-crimson hover:text-web"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* ---- summary stats ---- */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Visitors" value={totalVisitors} />
        <StatCard label="Avg. Time Spent" value={formatDuration(avgTime)} />
        <StatCard label="Bounce Rate" value={`${bounceRate}%`} />
        <StatCard label="Live (last 10)" value={recent.length} />
      </div>

      {/* ---- hourly activity ---- */}
      <div className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-display text-xl text-crimson">Visitors — Last 24 Hours</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly}>
              <XAxis dataKey="hour" stroke="var(--color-muted)" fontSize={11} interval={2} />
              <YAxis stroke="var(--color-muted)" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-ink-soft)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--color-crimson)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- device / browser breakdown ---- */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PieCard title="Device Breakdown" data={deviceData} />
        <PieCard title="Browser Breakdown" data={browserData} />
        <PieCard title="Phone Brands" data={brandData} />
      </div>

      {/* ---- top pages + live visitors ---- */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-xl text-crimson">Top Pages</h2>
          <div className="mt-3 space-y-2">
            {pages.length === 0 && <p className="text-sm text-muted">No data yet.</p>}
            {pages.map((p) => (
              <div key={p.path} className="flex items-center justify-between text-sm">
                <span className="truncate text-web">{p.path}</span>
                <span className="ml-3 shrink-0 font-mono text-muted">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-xl text-crimson">Recent Activity</h2>
          <div className="mt-3 space-y-3">
            {recent.length === 0 && <p className="text-sm text-muted">No visitors yet.</p>}
            {recent.map((v) => (
              <div key={v.id} className="flex flex-col gap-0.5 border-b border-line/50 pb-2 text-sm last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-web">{v.deviceType || "unknown"}</span>
                  <span className="font-mono text-xs text-muted">
                    {v.lastActive?.toDate ? v.lastActive.toDate().toLocaleString() : "—"}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  {v.browser} · {v.osType}
                  {v.brand ? ` · ${v.brand}` : ""}
                </div>
                {(v.city || v.country) && (
                  <div className="text-xs text-muted">
                    📍 {[v.city, v.region, v.country].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- cleanup ---- */}
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-card p-5">
        <button
          onClick={handleCleanup}
          disabled={cleaning}
          className="rounded-lg border border-line px-4 py-2 text-sm hover:border-crimson hover:text-crimson disabled:opacity-60"
        >
          {cleaning ? "Cleaning..." : "Clean up data older than 90 days"}
        </button>
        {cleanupMsg && <span className="text-sm text-muted">{cleanupMsg}</span>}
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 text-center">
      <div className="font-display text-3xl text-crimson">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function PieCard({ title, data }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-display text-xl text-crimson">{title}</h2>
      <div className="mt-4 h-56">
        {data.length === 0 ? (
          <p className="text-sm text-muted">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-ink-soft)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
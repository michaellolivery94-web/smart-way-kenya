import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Gauge, Navigation, Route, TimerReset, Users } from "lucide-react";
import { CORRIDORS, LEVEL_CLASSES, getCorridor } from "@/data/corridors";
import { useLiveTraffic } from "@/hooks/useLiveTraffic";
import { resolveStatus } from "@/lib/liveTraffic";

const CorridorDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const corridor = getCorridor(slug);
  const [now, setNow] = useState(() => new Date());
  const { readings } = useLiveTraffic();

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!corridor) return;
    document.title = `${corridor.name} Traffic Today | Smart-Way Nairobi`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", `Live ${corridor.name} traffic status, travel time and choke points between ${corridor.from} and ${corridor.to}.`);
  }, [corridor]);

  const status = useMemo(
    () => (corridor ? resolveStatus(corridor, readings, now) : null),
    [corridor, readings, now],
  );


  if (!corridor || !status) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Corridor not found</h1>
        <Link to="/traffic" className="text-primary underline">
          Back to Nairobi live traffic
        </Link>
      </div>
    );
  }

  const cls = LEVEL_CLASSES[status.level];
  const others = CORRIDORS.filter((c) => c.slug !== corridor.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <Link
          to="/traffic"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> All corridors
        </Link>

        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{corridor.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {corridor.from} → {corridor.to} · {corridor.lengthKm} km
          </p>
        </motion.header>

        <div className={`mt-5 rounded-xl border p-4 ${cls.bg}`} role="status" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${cls.dot}`} aria-hidden="true" />
            <span className={`font-semibold ${cls.text}`}>{status.label} right now</span>
            {status.source === "live" ? (
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                <Users className="w-3.5 h-3.5" aria-hidden="true" /> Live from {status.sampleCount} driver readings
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Estimated from rush-hour patterns</span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <Gauge className="w-4 h-4 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-1 text-lg font-bold">{status.averageSpeed}</p>
              <p className="text-[11px] text-muted-foreground">km/h avg</p>
            </div>
            <div>
              <Clock className="w-4 h-4 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-1 text-lg font-bold">{status.travelMinutes}</p>
              <p className="text-[11px] text-muted-foreground">min end to end</p>
            </div>
            <div>
              <TimerReset className="w-4 h-4 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-1 text-lg font-bold">+{status.delayMinutes}</p>
              <p className="text-[11px] text-muted-foreground">min delay</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/?corridor=${corridor.slug}`)}
          className="mt-4 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Navigation className="w-4 h-4" aria-hidden="true" /> Open {corridor.shortName} on the map
        </button>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            About this route
          </h2>
          <p className="mt-2 text-sm leading-relaxed">{corridor.description}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Landmarks along the way
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {corridor.landmarks.map((l) => (
              <li
                key={l}
                className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium border border-border"
              >
                {l}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Typical peak hours
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {corridor.peakHours.map((h) => `${String(h).padStart(2, "0")}:00`).join(" · ")}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Other corridors
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {others.map((c) => (
              <Link
                key={c.slug}
                to={`/traffic/${c.slug}`}
                className="nav-card rounded-lg border border-border p-3 text-sm hover:border-primary/50 transition-colors inline-flex items-center gap-2"
              >
                <Route className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CorridorDetail;

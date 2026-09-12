import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, Gauge, MapPin, RefreshCw, Radio, Users } from "lucide-react";
import { CORRIDORS, LEVEL_CLASSES } from "@/data/corridors";
import { useLiveTraffic } from "@/hooks/useLiveTraffic";
import { resolveStatus } from "@/lib/liveTraffic";

const Traffic = () => {
  const [now, setNow] = useState(() => new Date());
  const { readings, liveCount } = useLiveTraffic();

  useEffect(() => {
    document.title = "Nairobi Live Traffic — Corridor Status | Smart-Way";
    const desc = document.querySelector('meta[name="description"]');
    desc?.setAttribute(
      "content",
      "Live traffic status for Nairobi's main corridors — Mombasa Road, Thika Superhighway, Waiyaki Way, Ngong Road, Jogoo Road, Outer Ring and the Expressway.",
    );
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(
    () => CORRIDORS.map((c) => ({ corridor: c, status: resolveStatus(c, readings, now) })),
    [now, readings],
  );

  const timeLabel = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to map
        </Link>

        <header className="mt-5 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nairobi Live Traffic</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Current conditions across the city's main corridors, with landmark-aware detail and a
            one-tap jump straight onto the road in the map.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Updated {timeLabel} EAT · refreshes every minute
          </p>
        </header>

        <ul className="space-y-3" aria-label="Nairobi traffic corridors">
          {rows.map(({ corridor, status }, i) => {
            const cls = LEVEL_CLASSES[status.level];
            return (
              <motion.li
                key={corridor.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/traffic/${corridor.slug}`}
                  className={`block nav-card rounded-xl border p-4 hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring ${cls.bg}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cls.dot}`} aria-hidden="true" />
                        <h2 className="font-semibold truncate">{corridor.name}</h2>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {corridor.from} → {corridor.to}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className={`font-semibold ${cls.text}`}>{status.label}</span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Gauge className="w-3.5 h-3.5" aria-hidden="true" /> {status.averageSpeed} km/h
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {status.travelMinutes} min
                          {status.delayMinutes > 0 && ` (+${status.delayMinutes})`}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-8 nav-card rounded-xl p-4 border border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" aria-hidden="true" /> How this works
          </h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Status blends each corridor's congestion profile with Nairobi rush-hour patterns and live
            community reports. Open a corridor to see its landmarks, choke points and to drop the map
            straight onto that road.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Traffic;

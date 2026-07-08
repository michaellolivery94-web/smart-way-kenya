import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  MapPin,
  Flag,
  LogOut,
  Route as RouteIcon,
  Clock,
} from "lucide-react";
import type { DirectionCardProps } from "./DirectionCard";

interface RouteSummaryProps {
  steps: Omit<DirectionCardProps, "isNext">[];
  totalDistance?: string;
  totalDuration?: string;
  originName?: string;
  destinationName?: string;
  detour?: {
    deltaDistance?: string;
    deltaDuration?: string;
    reason?: string;
    direction?: "faster" | "slower" | "shorter" | "longer";
  } | null;
}

const directionIcons = {
  straight: ArrowUp,
  "slight-right": ArrowUpRight,
  "slight-left": ArrowUpLeft,
  right: ArrowRight,
  left: ArrowLeft,
  "u-turn": RotateCcw,
} as const;

export const RouteSummary = ({
  steps,
  totalDistance,
  totalDuration,
  originName,
  destinationName,
  detour,
}: RouteSummaryProps) => {
  const exitCount = steps.filter((s) => s.exit).length;
  const laneCallouts = steps.filter((s) => s.lanes && s.lanes.length > 0).length;
  const isPositive = detour?.direction === "faster" || detour?.direction === "shorter";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      role="region"
      aria-label="Route summary"
      aria-live="polite"
      className="rounded-2xl border border-border/50 bg-card/80 overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <RouteIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Route summary
              </p>
              <p className="text-sm font-bold text-foreground">
                {steps.length} step{steps.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            {totalDuration && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  ETA
                </p>
                <p className="text-sm font-bold text-primary flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {totalDuration}
                </p>
              </div>
            )}
            {totalDistance && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Distance
                </p>
                <p className="text-sm font-bold text-foreground">{totalDistance}</p>
              </div>
            )}
          </div>
        </div>

        {/* From → To */}
        {(originName || destinationName) && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-info flex-shrink-0" />
              <span className="truncate text-foreground/80">{originName || "Current location"}</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
              <span className="truncate font-medium text-foreground">
                {destinationName || "Destination"}
              </span>
            </div>
          </div>
        )}

        {/* Detour / reroute banner */}
        {detour && (detour.deltaDistance || detour.deltaDuration || detour.reason) && (
          <div
            role="status"
            aria-live="assertive"
            className={`mt-2.5 p-2 rounded-lg border text-xs flex items-start gap-2 ${
              isPositive
                ? "bg-success/10 border-success/30 text-success"
                : "bg-warning/10 border-warning/30 text-warning"
            }`}
          >
            <RouteIcon aria-hidden="true" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold uppercase tracking-wider text-[10px]">
                Route updated{detour.direction ? ` · ${detour.direction}` : ""}
              </p>
              <p className="text-foreground/80 leading-snug">
                {detour.reason || "Summary refreshed for your new path."}
                {(detour.deltaDuration || detour.deltaDistance) && (
                  <>
                    {" "}
                    <span className="font-semibold">
                      {[detour.deltaDuration, detour.deltaDistance].filter(Boolean).join(" · ")}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Chips */}
        {(exitCount > 0 || laneCallouts > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {exitCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-[10px] font-bold uppercase tracking-wider">
                <LogOut className="w-3 h-3" />
                {exitCount} exit{exitCount === 1 ? "" : "s"}
              </span>
            )}
            {laneCallouts > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider">
                {laneCallouts} lane cue{laneCallouts === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <ol className="p-3 sm:p-4 space-y-2">
        {steps.map((s, i) => {
          const Icon = directionIcons[s.direction] || ArrowUp;
          const isLast = i === steps.length - 1;
          return (
            <li key={i} className="relative flex gap-3">
              {/* Rail */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[13px] top-8 bottom-[-8px] w-px bg-border"
                />
              )}
              <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 relative z-10">
                <Icon className="w-3.5 h-3.5 text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{s.distance}</span>
                  {s.roadName && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border/50 truncate max-w-[10rem]">
                      {s.roadName}
                    </span>
                  )}
                  {s.exit && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-warning">
                      <LogOut className="w-3 h-3" />
                      {s.exit.number ? `Exit ${s.exit.number}` : "Exit"}
                    </span>
                  )}
                  {s.landmark && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-success">
                      <MapPin className="w-3 h-3" />
                      {s.landmark.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/70 leading-snug mt-0.5 line-clamp-2">
                  {s.instruction}
                </p>
              </div>
            </li>
          );
        })}
        {/* Arrival */}
        <li className="relative flex gap-3">
          <div className="w-7 h-7 rounded-full bg-success/20 border border-success/40 flex items-center justify-center flex-shrink-0">
            <Flag className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs font-bold text-success">Arrive</p>
            <p className="text-xs text-foreground/70 truncate">
              {destinationName || "Your destination"}
            </p>
          </div>
        </li>
      </ol>
    </motion.div>
  );
};

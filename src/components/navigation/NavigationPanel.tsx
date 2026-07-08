import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, 
  MapPin, 
  Fuel, 
  ChevronUp,
  ChevronDown,
  Wifi,
  WifiOff,
  Zap,
  Download,
  Brain,
  Loader2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DirectionCard, type DirectionCardProps } from "./DirectionCard";
import { LaneGuidance } from "./LaneGuidance";
import { RouteSummary } from "./RouteSummary";
import { useOfflineMaps } from "@/hooks/useOfflineMaps";
import type { AIDirection } from "@/hooks/useAIDirections";

interface NavigationPanelProps {
  isNavigating?: boolean;
  isPro?: boolean;
  onOpenOfflineMaps?: () => void;
  aiDirections?: AIDirection[];
  aiDirectionsLoading?: boolean;
  totalDistance?: string;
  totalDuration?: string;
  originName?: string;
  destinationName?: string;
}

export const NavigationPanel = ({ 
  isNavigating = false, 
  isPro = false, 
  onOpenOfflineMaps,
  aiDirections = [],
  aiDirectionsLoading = false,
  totalDistance,
  totalDuration,
  originName,
  destinationName,
}: NavigationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOnline, downloadedRegions } = useOfflineMaps();

  // Detour-aware summary: detect when the route summary changes mid-trip.
  const prevTotalsRef = useRef<{ distance?: string; duration?: string }>({});
  const [detour, setDetour] = useState<
    | { deltaDistance?: string; deltaDuration?: string; reason?: string; direction?: "faster" | "slower" | "shorter" | "longer" }
    | null
  >(null);

  const parseMinutes = (s?: string) => {
    if (!s) return null;
    const m = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hour|hours)?\s*(\d+(?:\.\d+)?)?\s*(min|m)?/i);
    if (!m) return null;
    // simple: capture leading number, treat "h" as hours
    const numMatch = s.match(/(\d+(?:\.\d+)?)/g);
    if (!numMatch) return null;
    if (/h/i.test(s) && numMatch.length >= 1) {
      const h = parseFloat(numMatch[0]);
      const mm = numMatch[1] ? parseFloat(numMatch[1]) : 0;
      return h * 60 + mm;
    }
    return parseFloat(numMatch[0]);
  };
  const parseKm = (s?: string) => {
    if (!s) return null;
    const n = s.match(/(\d+(?:\.\d+)?)/);
    if (!n) return null;
    const v = parseFloat(n[1]);
    return /m\b/i.test(s) && !/km/i.test(s) ? v / 1000 : v;
  };

  useEffect(() => {
    const prev = prevTotalsRef.current;
    if (!isNavigating) {
      prevTotalsRef.current = { distance: totalDistance, duration: totalDuration };
      return;
    }
    if (prev.distance === undefined && prev.duration === undefined) {
      prevTotalsRef.current = { distance: totalDistance, duration: totalDuration };
      return;
    }

    const prevMin = parseMinutes(prev.duration);
    const nextMin = parseMinutes(totalDuration);
    const prevKm = parseKm(prev.distance);
    const nextKm = parseKm(totalDistance);

    const durChanged = prevMin != null && nextMin != null && Math.abs(nextMin - prevMin) >= 1;
    const distChanged = prevKm != null && nextKm != null && Math.abs(nextKm - prevKm) >= 0.2;

    if (durChanged || distChanged) {
      const dMin = nextMin! - (prevMin ?? nextMin!);
      const dKm = nextKm! - (prevKm ?? nextKm!);
      const direction =
        durChanged
          ? dMin < 0 ? "faster" : "slower"
          : dKm < 0 ? "shorter" : "longer";
      setDetour({
        deltaDuration: durChanged ? `${dMin > 0 ? "+" : ""}${Math.round(dMin)} min` : undefined,
        deltaDistance: distChanged ? `${dKm > 0 ? "+" : ""}${dKm.toFixed(1)} km` : undefined,
        reason: "Route recalculated to reflect your latest detour.",
        direction,
      });
      const t = setTimeout(() => setDetour(null), 12000);
      prevTotalsRef.current = { distance: totalDistance, duration: totalDuration };
      return () => clearTimeout(t);
    }
    prevTotalsRef.current = { distance: totalDistance, duration: totalDuration };
  }, [totalDistance, totalDuration, isNavigating]);

  // Use AI directions if available, otherwise show fallback
  const upcomingTurns: Omit<DirectionCardProps, 'isNext'>[] = aiDirections.length > 0
    ? aiDirections.map(d => ({
        direction: d.direction,
        distance: d.distance,
        instruction: d.instruction,
        detailedGuide: d.detailedGuide,
        laneHint: d.laneHint,
        lanes: d.lanes,
        exit: d.exit || undefined,
        tip: d.tip,
        warning: d.warning,
        roadName: d.roadName,
        estimatedTime: d.estimatedTime,
        landmark: d.landmark || undefined,
      }))
    : [];

  const lanes = [
    { id: 1, active: false, direction: "left" as const },
    { id: 2, active: true, direction: "straight" as const },
    { id: 3, active: true, direction: "straight" as const },
    { id: 4, active: false, direction: "right" as const, isExit: true },
  ];

  if (!isNavigating) {
    return (
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-0 left-0 right-0 p-2 sm:p-3"
      >
        <div className="nav-card p-3 sm:p-4">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-warning'} ${isOnline ? '' : 'animate-pulse'}`} />
              <span className="text-xs font-medium text-foreground">
                {isOnline ? "Ready" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenOfflineMaps}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-[10px] font-medium transition-colors"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </motion.button>
              {isPro && (
                <div className="pro-badge">
                  <Zap className="w-2.5 h-2.5" />
                  PRO
                </div>
              )}
            </div>
          </div>
          
          {/* Start Button */}
          <motion.button 
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className="nav-button-primary w-full py-3 sm:py-3.5 text-base font-bold flex items-center justify-center gap-2 rounded-xl"
          >
            <span>Start Navigation</span>
          </motion.button>

          {/* Trip Summary */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-foreground">
              <div className="w-6 h-6 rounded-md bg-info/15 flex items-center justify-center">
                <Clock className="w-3 h-3 text-info" />
              </div>
              <div>
                <span className="font-bold text-sm">18 min</span>
              </div>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex items-center gap-1.5 text-foreground">
              <div className="w-6 h-6 rounded-md bg-success/15 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-success" />
              </div>
              <div>
                <span className="font-bold text-sm">7.2 km</span>
              </div>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex items-center gap-1.5 text-foreground">
              <div className="w-6 h-6 rounded-md bg-warning/15 flex items-center justify-center">
                <Fuel className="w-3 h-3 text-warning" />
              </div>
              <div>
                <span className="font-bold text-sm">Ksh 120</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute bottom-0 left-0 right-0"
    >
      {/* ETA Bar */}
      <div className="bg-gradient-to-r from-primary to-primary/90 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary-foreground">18 min</div>
            <div className="text-xs sm:text-sm text-primary-foreground/80">
              7.2 km • {new Date(Date.now() + 18 * 60 * 1000).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })} arrival
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-primary-foreground/70">
              <Wifi className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Connected</span>
            </div>
          ) : (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={onOpenOfflineMaps}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warning/20 text-warning"
            >
              <WifiOff className="w-4 h-4" />
              <span className="text-xs font-medium">{downloadedRegions.length} maps</span>
            </motion.button>
          )}
          {isPro && (
            <div className="pro-badge">
              <Zap className="w-3 h-3" />
              PRO
            </div>
          )}
        </div>
      </div>

      {/* Lane Guidance */}
      <div className="bg-card border-b border-border p-4">
        <LaneGuidance lanes={lanes} currentLane={2} />
      </div>

      {/* Expandable Directions Panel */}
      <div className="nav-card rounded-t-none border-t-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="directions-list"
          aria-label={isExpanded ? "Hide all directions" : "Show all directions"}
          className="w-full p-3 flex items-center justify-center gap-2 border-b border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isExpanded ? (
            <ChevronDown aria-hidden="true" className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp aria-hidden="true" className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {isExpanded ? "Hide directions" : "Show all directions"}
          </span>
          {aiDirections.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              <Brain aria-hidden="true" className="w-3 h-3" /> AI
            </span>
          )}
        </button>

        <div id="directions-list" className="p-3 sm:p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {/* Loading State */}
          {aiDirectionsLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-3.5 h-3.5 text-primary" />
                </motion.div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Generating smart directions…</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI is analyzing your route with Nairobi landmarks & traffic tips
                </p>
              </div>
            </motion.div>
          )}

          {/* No directions yet and not loading */}
          {!aiDirectionsLoading && upcomingTurns.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">Directions will appear once navigation starts</p>
            </div>
          )}

          {/* Route Summary (expanded view only) */}
          {isExpanded && upcomingTurns.length > 0 && (
            <RouteSummary
              steps={upcomingTurns}
              totalDistance={totalDistance}
              totalDuration={totalDuration}
              originName={originName}
              destinationName={destinationName}
              detour={detour}
            />
          )}

          {/* Direction Cards */}
          <AnimatePresence>
            {(isExpanded ? upcomingTurns : upcomingTurns.slice(0, 1)).map((turn, index) => (
              <DirectionCard
                key={index}
                {...turn}
                isNext={index === 0}
              />
            ))}
          </AnimatePresence>

          {!isExpanded && upcomingTurns.length > 1 && (
            <p className="text-center text-xs text-muted-foreground pt-1">
              +{upcomingTurns.length - 1} more steps — tap "Show all" above
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border/50 flex items-center justify-around" role="toolbar" aria-label="Navigation quick actions">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            aria-label="Add a stop along the route"
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all min-h-11 min-w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center" aria-hidden="true">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Add Stop</span>
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            aria-label="Find fuel stations along the route"
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all min-h-11 min-w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center" aria-hidden="true">
              <Fuel className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-medium">Fuel</span>
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onOpenOfflineMaps}
            aria-label="Manage offline maps"
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all min-h-11 min-w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center" aria-hidden="true">
              <Download className="w-5 h-5 text-info" />
            </div>
            <span className="text-xs font-medium">Offline</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

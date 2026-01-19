import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  MapPin, 
  Fuel, 
  ChevronUp,
  ChevronDown,
  Wifi,
  WifiOff,
  Zap
} from "lucide-react";
import { useState } from "react";
import { DirectionCard } from "./DirectionCard";
import { LaneGuidance } from "./LaneGuidance";

interface NavigationPanelProps {
  isNavigating?: boolean;
  isPro?: boolean;
}

export const NavigationPanel = ({ isNavigating = false, isPro = false }: NavigationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline] = useState(true);

  const upcomingTurns = [
    {
      direction: "slight-right" as const,
      distance: "250m",
      instruction: "Keep right at the fork onto Ring Road",
      landmark: { name: "Sarit Centre", type: "mall" as const, position: "left" as const },
    },
    {
      direction: "straight" as const,
      distance: "1.2km",
      instruction: "Continue on Ring Road Parklands",
    },
    {
      direction: "left" as const,
      distance: "500m",
      instruction: "Turn left onto Waiyaki Way",
      landmark: { name: "Total Petrol", type: "fuel" as const, position: "right" as const },
    },
  ];

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
        className="absolute bottom-0 left-0 right-0 p-4"
      >
        <div className="nav-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-success" />
              ) : (
                <WifiOff className="w-4 h-4 text-warning" />
              )}
              <span className="text-xs text-muted-foreground">
                {isOnline ? "Online" : "Offline Mode"}
              </span>
            </div>
            {isPro && (
              <div className="pro-badge">
                <Zap className="w-3 h-3" />
                PRO
              </div>
            )}
          </div>
          
          <button className="nav-button-primary w-full py-4 text-lg">
            Start Navigation
          </button>

          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>18 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>7.2 km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-4 h-4" />
              <span>Ksh 120</span>
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
      className="absolute bottom-0 left-0 right-0"
    >
      {/* ETA Bar */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xl font-bold text-primary-foreground">18 min</div>
            <div className="text-xs text-primary-foreground/70">7.2 km • 2:45 PM arrival</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-primary-foreground/70" />
          ) : (
            <WifiOff className="w-4 h-4 text-warning" />
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
          className="w-full p-3 flex items-center justify-center gap-2 border-b border-border/50"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {isExpanded ? "Hide directions" : "Show all directions"}
          </span>
        </button>

        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {(isExpanded ? upcomingTurns : upcomingTurns.slice(0, 1)).map((turn, index) => (
              <DirectionCard
                key={index}
                direction={turn.direction}
                distance={turn.distance}
                instruction={turn.instruction}
                landmark={turn.landmark}
                isNext={index === 0}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border/50 flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <MapPin className="w-5 h-5" />
            <span className="text-xs">Stop</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Fuel className="w-5 h-5" />
            <span className="text-xs">Fuel</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Clock className="w-5 h-5" />
            <span className="text-xs">ETA</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

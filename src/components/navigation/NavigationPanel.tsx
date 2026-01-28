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
  Download
} from "lucide-react";
import { useState } from "react";
import { DirectionCard } from "./DirectionCard";
import { LaneGuidance } from "./LaneGuidance";
import { useOfflineMaps } from "@/hooks/useOfflineMaps";

interface NavigationPanelProps {
  isNavigating?: boolean;
  isPro?: boolean;
  onOpenOfflineMaps?: () => void;
}

export const NavigationPanel = ({ isNavigating = false, isPro = false, onOpenOfflineMaps }: NavigationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOnline, downloadedRegions } = useOfflineMaps();

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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-0 left-0 right-0 p-3 sm:p-4"
      >
        <div className="nav-card p-4 sm:p-5">
          {/* Status Bar - Cleaner layout */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-success' : 'bg-warning'} ${isOnline ? '' : 'animate-pulse'}`} />
              <span className="text-sm font-medium text-foreground">
                {isOnline ? "Ready to navigate" : "Offline mode"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenOfflineMaps}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Maps</span>
              </motion.button>
              {isPro && (
                <div className="pro-badge">
                  <Zap className="w-3 h-3" />
                  PRO
                </div>
              )}
            </div>
          </div>
          
          {/* Start Button - Already enhanced, keeping consistent */}
          <motion.button 
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className="nav-button-primary w-full py-4 sm:py-5 text-lg sm:text-xl font-bold flex items-center justify-center gap-3 rounded-2xl"
          >
            <span>Start Navigation</span>
          </motion.button>

          {/* Trip Summary - Improved visual hierarchy */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-info/15 flex items-center justify-center">
                <Clock className="w-4 h-4 text-info" />
              </div>
              <div>
                <span className="font-bold text-base">18 min</span>
                <p className="text-[10px] text-muted-foreground">Duration</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-success" />
              </div>
              <div>
                <span className="font-bold text-base">7.2 km</span>
                <p className="text-[10px] text-muted-foreground">Distance</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                <Fuel className="w-4 h-4 text-warning" />
              </div>
              <div>
                <span className="font-bold text-base">Ksh 120</span>
                <p className="text-[10px] text-muted-foreground">Fuel cost</p>
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
      {/* ETA Bar - Enhanced */}
      <div className="bg-gradient-to-r from-primary to-primary/90 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary-foreground">18 min</div>
            <div className="text-xs sm:text-sm text-primary-foreground/80">7.2 km • 2:45 PM arrival</div>
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

        {/* Quick Actions - Enhanced with better touch targets */}
        <div className="p-4 border-t border-border/50 flex items-center justify-around">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Add Stop</span>
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-medium">Fuel</span>
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onOpenOfflineMaps}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center">
              <Download className="w-5 h-5 text-info" />
            </div>
            <span className="text-xs font-medium">Offline</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

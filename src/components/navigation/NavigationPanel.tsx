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
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { DirectionCard, type DirectionCardProps } from "./DirectionCard";
import { LaneGuidance } from "./LaneGuidance";
import { useOfflineMaps } from "@/hooks/useOfflineMaps";

interface NavigationPanelProps {
  isNavigating?: boolean;
  isPro?: boolean;
  onOpenOfflineMaps?: () => void;
  // AI directions props
  aiDirections?: Omit<DirectionCardProps, 'isNext'>[];
  aiSummary?: { totalDistance: string; totalDuration: string; arrivalTime: string } | null;
  isLoadingDirections?: boolean;
  directionsError?: string | null;
  onRetryDirections?: () => void;
}

export const NavigationPanel = ({ 
  isNavigating = false, 
  isPro = false, 
  onOpenOfflineMaps,
  aiDirections = [],
  aiSummary,
  isLoadingDirections = false,
  directionsError,
  onRetryDirections,
}: NavigationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOnline, downloadedRegions } = useOfflineMaps();

  const lanes = [
    { id: 1, active: false, direction: "left" as const },
    { id: 2, active: true, direction: "straight" as const },
    { id: 3, active: true, direction: "straight" as const },
    { id: 4, active: false, direction: "right" as const, isExit: true },
  ];

  const totalDistance = aiSummary?.totalDistance || "—";
  const totalDuration = aiSummary?.totalDuration || "—";
  const arrivalTime = aiSummary?.arrivalTime || "—";
  const fuelEstimate = aiSummary ? `Ksh ${Math.round(parseFloat(aiSummary.totalDistance) * 18) || "—"}` : "—";

  if (!isNavigating) {
    return (
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-0 left-0 right-0 p-2 sm:p-3"
      >
        <div className="nav-card p-3 sm:p-4">
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
          
          <motion.button 
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className="nav-button-primary w-full py-3 sm:py-3.5 text-base font-bold flex items-center justify-center gap-2 rounded-xl"
          >
            <span>Start Navigation</span>
          </motion.button>

          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-foreground">
              <div className="w-6 h-6 rounded-md bg-info/15 flex items-center justify-center">
                <Clock className="w-3 h-3 text-info" />
              </div>
              <span className="font-bold text-sm">18 min</span>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex items-center gap-1.5 text-foreground">
              <div className="w-6 h-6 rounded-md bg-success/15 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-success" />
              </div>
              <span className="font-bold text-sm">7.2 km</span>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex items-center gap-1.5 text-foreground">
              <div className="w-6 h-6 rounded-md bg-warning/15 flex items-center justify-center">
                <Fuel className="w-3 h-3 text-warning" />
              </div>
              <span className="font-bold text-sm">Ksh 120</span>
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
            <div className="text-2xl sm:text-3xl font-bold text-primary-foreground">
              {isLoadingDirections ? "..." : totalDuration}
            </div>
            <div className="text-xs sm:text-sm text-primary-foreground/80">
              {isLoadingDirections ? "Calculating route..." : `${totalDistance} • ${arrivalTime} arrival`}
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
      {aiDirections.length > 0 && (
        <div className="bg-card border-b border-border p-4">
          <LaneGuidance lanes={lanes} currentLane={2} />
        </div>
      )}

      {/* Directions Panel */}
      <div className="nav-card rounded-t-none border-t-0">
        {/* Loading State */}
        {isLoadingDirections && (
          <div className="p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Generating smart directions...</p>
            <p className="text-xs text-muted-foreground text-center">
              AI is analyzing your route and creating beginner-friendly instructions
            </p>
          </div>
        )}

        {/* Error State */}
        {directionsError && !isLoadingDirections && (
          <div className="p-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground text-center">{directionsError}</p>
            {onRetryDirections && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onRetryDirections}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
            )}
          </div>
        )}

        {/* Directions List */}
        {!isLoadingDirections && !directionsError && aiDirections.length > 0 && (
          <>
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
                {isExpanded ? "Hide directions" : `Show all ${aiDirections.length} directions`}
              </span>
            </button>

            <div className="p-3 sm:p-4 space-y-3 max-h-[50vh] overflow-y-auto">
              <AnimatePresence>
                {(isExpanded ? aiDirections : aiDirections.slice(0, 1)).map((turn, index) => (
                  <DirectionCard
                    key={index}
                    {...turn}
                    isNext={index === 0}
                  />
                ))}
              </AnimatePresence>

              {!isExpanded && aiDirections.length > 1 && (
                <p className="text-center text-xs text-muted-foreground pt-1">
                  +{aiDirections.length - 1} more steps — tap "Show all" above
                </p>
              )}
            </div>
          </>
        )}

        {/* No directions yet */}
        {!isLoadingDirections && !directionsError && aiDirections.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No directions available</p>
          </div>
        )}

        {/* Quick Actions */}
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

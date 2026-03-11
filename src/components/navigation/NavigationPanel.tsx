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
import { DirectionCard, type DirectionCardProps } from "./DirectionCard";
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

  const upcomingTurns: Omit<DirectionCardProps, 'isNext'>[] = [
    {
      direction: "slight-right" as const,
      distance: "250m",
      instruction: "Keep right at the fork — you're merging onto Ring Road Parklands.",
      detailedGuide: "You'll see the road split into two ahead. Don't worry — just gently steer to the RIGHT side. The left fork goes to Westlands CBD, but you want the right one that curves along Ring Road. There will be a green road sign overhead saying 'Ring Road'.",
      laneHint: "Stay in the 2nd lane from the right. Move over now if you're in the far left.",
      tip: "Slow down before the fork — many cars merge here. Keep a safe gap from the car in front.",
      warning: "Matatus often cut across lanes suddenly at this junction. Watch your mirrors!",
      roadName: "Ring Road Parklands",
      estimatedTime: "30 sec",
      landmark: { name: "Sarit Centre", type: "mall" as const, position: "left" as const },
    },
    {
      direction: "straight" as const,
      distance: "1.2km",
      instruction: "Continue straight on Ring Road Parklands — do not take any turns.",
      detailedGuide: "This is a long, straight stretch. Just keep driving forward. You'll pass some shops and apartments on both sides. The road has two lanes going your direction. Stay in your lane and keep a steady speed. You'll see a traffic light ahead at the end of this stretch.",
      tip: "Use this straight section to check your mirrors and settle into a comfortable speed. The speed limit here is 50 km/h.",
      roadName: "Ring Road Parklands",
      estimatedTime: "2 min",
    },
    {
      direction: "left" as const,
      distance: "500m",
      instruction: "Turn LEFT onto Waiyaki Way at the traffic lights.",
      detailedGuide: "When you reach the traffic lights, you need to turn LEFT. Start moving to the left lane BEFORE you reach the lights — don't wait until the last moment. When the light is green, check for oncoming traffic from your right, then make a smooth left turn. The new road (Waiyaki Way) is a wide dual carriageway.",
      laneHint: "Move to the LEFT lane now. Use your indicator/signal light so other drivers know you're turning.",
      tip: "If the light turns yellow while you're close, it's safer to stop than to rush through. There are traffic cameras here.",
      warning: "Pedestrians often cross at this junction — look carefully before turning. Also watch for boda-bodas on your left.",
      roadName: "Waiyaki Way",
      estimatedTime: "1 min",
      landmark: { name: "Total Petrol Station", type: "fuel" as const, position: "right" as const },
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

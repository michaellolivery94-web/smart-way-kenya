import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, AlertTriangle, TrafficCone, Construction, 
  Droplets, Car, Volume2, X
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

interface Hazard {
  id: string;
  type: "police" | "pothole" | "accident" | "speed-bump" | "flood" | "construction" | "stalled-vehicle";
  title: string;
  detail: string;
  road: string;
  distance: string;
  urgency: "low" | "medium" | "high";
}

const hazardConfig: Record<string, { icon: typeof Shield; color: string; bg: string; border: string }> = {
  "police": { icon: Shield, color: "text-info", bg: "bg-info/15", border: "border-info/30" },
  "pothole": { icon: TrafficCone, color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
  "accident": { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/30" },
  "speed-bump": { icon: Car, color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
  "flood": { icon: Droplets, color: "text-info", bg: "bg-info/15", border: "border-info/30" },
  "construction": { icon: Construction, color: "text-info", bg: "bg-info/15", border: "border-info/30" },
  "stalled-vehicle": { icon: Car, color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
};

const simulatedHazards: Hazard[] = [
  { id: "h1", type: "police", title: "Police Checkpoint", detail: "Officers checking documents — have your DL and insurance ready. Stay calm and cooperate.", road: "Uhuru Highway", distance: "500m", urgency: "medium" },
  { id: "h2", type: "pothole", title: "Deep Pothole", detail: "Large pothole in the left lane near the drainage. Move to the right lane to avoid it.", road: "Ngong Road", distance: "300m", urgency: "high" },
  { id: "h3", type: "speed-bump", title: "Speed Bumps Ahead", detail: "3 speed bumps in quick succession near the school zone. Slow to 20 km/h.", road: "Waiyaki Way", distance: "200m", urgency: "low" },
  { id: "h4", type: "accident", title: "Accident Reported", detail: "2 vehicles involved. Emergency services on scene. Use the shoulder to pass carefully.", road: "Mombasa Road (A109)", distance: "1.2km", urgency: "high" },
  { id: "h5", type: "stalled-vehicle", title: "Stalled Matatu", detail: "PSV broken down blocking the left lane at the bus stage. Merge right early.", road: "Jogoo Road", distance: "400m", urgency: "medium" },
  { id: "h6", type: "flood", title: "Flooded Road", detail: "Ankle-deep water across both lanes after heavy rain. Drive through at walking speed.", road: "Outer Ring Road", distance: "800m", urgency: "high" },
];

interface HazardPopupProps {
  isNavigating: boolean;
}

export const HazardPopup = ({ isNavigating }: HazardPopupProps) => {
  const [activeHazard, setActiveHazard] = useState<Hazard | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const dismissedRef = useRef<Set<string>>(new Set());
  useEffect(() => { dismissedRef.current = dismissed; }, [dismissed]);

  useEffect(() => {
    if (!isNavigating) {
      setActiveHazard(null);
      setDismissed(new Set());
      dismissedRef.current = new Set();
      return;
    }

    // Simulate hazards appearing at intervals
    let hazardIndex = 0;
    const showNextHazard = () => {
      const available = simulatedHazards.filter(h => !dismissedRef.current.has(h.id));
      if (available.length === 0) return;
      setActiveHazard(available[hazardIndex % available.length]);
      hazardIndex++;
    };

    const firstTimer = setTimeout(showNextHazard, 12000);
    const interval = setInterval(showNextHazard, 30000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [isNavigating]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!activeHazard) return;
    const timer = setTimeout(() => setActiveHazard(null), 8000);
    return () => clearTimeout(timer);
  }, [activeHazard]);

  const handleDismiss = useCallback(() => {
    if (activeHazard) {
      setDismissed(prev => new Set(prev).add(activeHazard.id));
    }
    setActiveHazard(null);
  }, [activeHazard]);

  const handleThankYou = useCallback(() => {
    handleDismiss();
  }, [handleDismiss]);

  return (
    <AnimatePresence>
      {activeHazard && (() => {
        const config = hazardConfig[activeHazard.type] || hazardConfig.pothole;
        const HazardIcon = config.icon;
        const urgencyColors = {
          low: "from-info/10 to-transparent",
          medium: "from-warning/10 to-transparent",
          high: "from-destructive/10 to-transparent",
        };

        return (
          <motion.div
            key={activeHazard.id}
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-20 left-3 right-3 z-[45]"
          >
            <div className={`nav-card rounded-2xl overflow-hidden border ${config.border} shadow-2xl`}>
              {/* Urgency stripe */}
              <div className={`h-1 w-full ${
                activeHazard.urgency === "high" ? "bg-destructive" :
                activeHazard.urgency === "medium" ? "bg-warning" : "bg-info"
              }`} />

              <div className={`p-3.5 bg-gradient-to-r ${urgencyColors[activeHazard.urgency]}`}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 border ${config.border}`}
                  >
                    <HazardIcon className={`w-6 h-6 ${config.color}`} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{activeHazard.title}</h4>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeHazard.urgency === "high" ? "bg-destructive/20 text-destructive" :
                        activeHazard.urgency === "medium" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"
                      }`}>
                        {activeHazard.distance}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">{activeHazard.detail}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">{activeHazard.road}</p>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-lg hover:bg-secondary/80 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 ml-[60px]">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleThankYou}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/15 text-success text-[10px] font-bold border border-success/20"
                  >
                    👍 Thanks
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDismiss}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-[10px] font-medium border border-border/30"
                  >
                    Not there
                  </motion.button>
                </div>
              </div>

              {/* Auto-dismiss progress bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className={`h-0.5 ${
                  activeHazard.urgency === "high" ? "bg-destructive" :
                  activeHazard.urgency === "medium" ? "bg-warning" : "bg-info"
                }`}
              />
            </div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};

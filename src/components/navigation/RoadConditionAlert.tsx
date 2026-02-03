import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Construction, Waves, CircleDot } from "lucide-react";
import { useRoadConditions, RoadConditionType } from "@/contexts/RoadConditionsContext";

const conditionConfig: Record<RoadConditionType, { 
  icon: typeof AlertTriangle; 
  label: string; 
  color: string;
  bgColor: string;
  description: string;
}> = {
  murram: {
    icon: CircleDot,
    label: "Murram Road",
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    description: "Unpaved road ahead",
  },
  construction: {
    icon: Construction,
    label: "Construction Zone",
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    description: "Work in progress",
  },
  pothole: {
    icon: AlertTriangle,
    label: "Pothole Alert",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    description: "Road damage ahead",
  },
  flooded: {
    icon: Waves,
    label: "Flooded Section",
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    description: "Water on road",
  },
};

const severityConfig = {
  low: { label: "Minor", color: "bg-success/20 text-success border-success/30" },
  medium: { label: "Moderate", color: "bg-warning/20 text-warning border-warning/30" },
  high: { label: "Severe", color: "bg-destructive/20 text-destructive border-destructive/30" },
};

export const RoadConditionAlert = () => {
  const { activeAlert, dismissAlert } = useRoadConditions();

  if (!activeAlert) return null;

  const config = conditionConfig[activeAlert.type];
  const severity = severityConfig[activeAlert.severity];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed top-16 left-3 right-3 sm:left-4 sm:right-4 z-50 max-w-md mx-auto"
      >
        <div className="nav-card overflow-hidden shadow-2xl border-2 border-warning/30">
          {/* Alert Header with Icon */}
          <div className={`${config.bgColor} px-4 py-3 flex items-center gap-3`}>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"
            >
              <Icon className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-white text-lg">
                  {config.label}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${severity.color}`}>
                  {severity.label}
                </span>
              </div>
              <p className="text-white/90 text-sm">{config.description}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={dismissAlert}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Alert Details */}
          <div className="p-4 bg-card">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {activeAlert.name}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeAlert.description}
                </p>
              </div>
              {activeAlert.verified && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Verified
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={dismissAlert}
                className="flex-1 py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm transition-colors"
              >
                Got it
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-colors"
              >
                Find Alternate
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

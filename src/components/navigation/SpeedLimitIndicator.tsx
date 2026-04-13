import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Volume2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SpeedLimitIndicatorProps {
  currentSpeed: number;
  speedLimit: number;
  isNavigating: boolean;
}

export const SpeedLimitIndicator = ({ currentSpeed, speedLimit, isNavigating }: SpeedLimitIndicatorProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const lastWarningTime = useRef(0);

  const isOverSpeed = currentSpeed > speedLimit;
  const isNearLimit = currentSpeed > speedLimit - 5 && currentSpeed <= speedLimit;
  const overBy = currentSpeed - speedLimit;

  // Trigger warning banner when first exceeding
  useEffect(() => {
    if (isOverSpeed && !warningDismissed) {
      const now = Date.now();
      if (now - lastWarningTime.current > 15000) {
        setShowWarning(true);
        lastWarningTime.current = now;
        // Auto-dismiss after 5s
        const timer = setTimeout(() => {
          setShowWarning(false);
          setWarningDismissed(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
    if (!isOverSpeed) {
      setWarningDismissed(false);
    }
  }, [isOverSpeed, warningDismissed]);

  if (!isNavigating) return null;

  const speedColor = isOverSpeed
    ? "text-destructive"
    : isNearLimit
    ? "text-warning"
    : "text-foreground";

  const borderColor = isOverSpeed
    ? "border-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.4)]"
    : isNearLimit
    ? "border-warning"
    : "border-border";

  return (
    <>
      {/* Speed + Limit Display */}
      <motion.div
        className="absolute left-2 sm:left-4 bottom-44 sm:bottom-56 z-10 flex items-end gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {/* Current Speed */}
        <motion.div
          className={`nav-card w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full flex flex-col items-center justify-center shadow-lg border-2 ${borderColor} transition-all duration-300`}
          animate={isOverSpeed ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: isOverSpeed ? Infinity : 0, duration: 1 }}
        >
          <span className={`text-2xl sm:text-3xl font-bold ${speedColor} transition-colors`}>
            {currentSpeed}
          </span>
          <span className="text-[8px] sm:text-[10px] text-muted-foreground font-medium">km/h</span>
        </motion.div>

        {/* Speed Limit Sign (Google Maps style) */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-[3px] border-destructive flex items-center justify-center shadow-md">
            <span className="text-sm sm:text-base font-bold text-gray-900">{speedLimit}</span>
          </div>
          <span className="text-[8px] text-muted-foreground font-medium">LIMIT</span>
        </div>
      </motion.div>

      {/* Overspeed Warning Banner */}
      <AnimatePresence>
        {showWarning && isOverSpeed && (
          <motion.div
            className="absolute top-28 left-4 right-4 sm:left-1/4 sm:right-1/4 z-40"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <div className="bg-destructive/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Slow Down!</p>
                <p className="text-xs text-white/80">
                  {overBy} km/h over the {speedLimit} km/h limit
                </p>
              </div>
              <button
                onClick={() => { setShowWarning(false); setWarningDismissed(true); }}
                className="text-white/70 hover:text-white text-xs font-medium px-2 py-1 rounded-lg bg-white/10"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

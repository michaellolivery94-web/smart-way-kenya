import { motion } from "framer-motion";
import { Clock, MapPin, Navigation2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ETAProgressBarProps {
  isNavigating: boolean;
  totalDuration: number; // in minutes
  totalDistance: string;
  destination: string | null;
}

export const ETAProgressBar = ({ 
  isNavigating, 
  totalDuration, 
  totalDistance,
  destination 
}: ETAProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Simulate progress during navigation
  useEffect(() => {
    if (!isNavigating) {
      setProgress(0);
      setElapsedMinutes(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (totalDuration * 6)); // Updates every 10s
        return Math.min(next, 98); // Never quite reach 100 until arrival
      });
      setElapsedMinutes(prev => {
        const next = prev + 1/6;
        return Math.min(next, totalDuration);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [isNavigating, totalDuration]);

  if (!isNavigating) return null;

  const remainingMins = Math.max(0, Math.round(totalDuration - elapsedMinutes));
  const arrivalTime = new Date(Date.now() + remainingMins * 60 * 1000)
    .toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      className="absolute top-[68px] left-0 right-0 z-25"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Thin progress bar */}
      <div className="h-1 bg-secondary/50 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-primary to-success rounded-r-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Moving dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg border-2 border-white"
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ marginLeft: "-6px" }}
        />
      </div>

      {/* Mini info bar */}
      <div className="bg-card/80 backdrop-blur-sm px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Navigation2 className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{remainingMins} min left</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Arrive {arrivalTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

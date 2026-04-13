import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Clock, Fuel, Gauge, Route, Star, 
  TrendingUp, Award, Share2 
} from "lucide-react";
import { useState } from "react";

interface TripSummaryProps {
  isVisible: boolean;
  onClose: () => void;
  destination: string | null;
  distance: string;
  duration: string;
  avgSpeed?: number;
  maxSpeed?: number;
  fuelCost?: string;
}

export const TripSummary = ({
  isVisible,
  onClose,
  destination,
  distance,
  duration,
  avgSpeed = 38,
  maxSpeed = 72,
  fuelCost = "Ksh 180",
}: TripSummaryProps) => {
  const [rating, setRating] = useState(0);

  // Parse duration for display
  const durationMins = parseInt(duration) || 18;
  const arrivalTime = new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const stats = [
    { icon: Route, label: "Distance", value: distance, color: "text-info", bg: "bg-info/15" },
    { icon: Clock, label: "Duration", value: `${durationMins} min`, color: "text-primary", bg: "bg-primary/15" },
    { icon: Gauge, label: "Avg Speed", value: `${avgSpeed} km/h`, color: "text-success", bg: "bg-success/15" },
    { icon: TrendingUp, label: "Top Speed", value: `${maxSpeed} km/h`, color: "text-warning", bg: "bg-warning/15" },
    { icon: Fuel, label: "Est. Fuel", value: fuelCost, color: "text-destructive", bg: "bg-destructive/15" },
    { icon: MapPin, label: "Arrived", value: arrivalTime, color: "text-info", bg: "bg-info/15" },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-[420px] z-50"
          >
            <div className="nav-card p-5 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">You've Arrived!</h3>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{destination}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/50"
                  >
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-bold text-foreground">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Rate this route */}
              <div className="border-t border-border/50 pt-4 mb-4">
                <p className="text-xs text-muted-foreground text-center mb-2">Rate this route</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= rating
                            ? "text-primary fill-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="flex-1 nav-button-primary py-3 text-sm font-bold rounded-xl text-center"
                >
                  Done
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

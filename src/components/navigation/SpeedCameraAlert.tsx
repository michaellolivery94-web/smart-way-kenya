import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Gauge } from "lucide-react";
import { useRoadConditions } from "@/contexts/RoadConditionsContext";

const cameraTypeLabels = {
  fixed: "Fixed Camera",
  mobile: "Mobile Unit",
  average: "Average Speed",
};

export const SpeedCameraAlert = () => {
  const { activeCameraAlert, dismissCameraAlert } = useRoadConditions();

  if (!activeCameraAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed top-16 left-3 right-3 sm:left-4 sm:right-4 z-50 max-w-md mx-auto"
      >
        <div className="nav-card overflow-hidden shadow-2xl border-2 border-red-500/50">
          {/* Alert Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"
            >
              <Camera className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-white text-lg">
                  Speed Camera Ahead
                </h3>
              </div>
              <p className="text-white/90 text-sm">{cameraTypeLabels[activeCameraAlert.type]}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={dismissCameraAlert}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Alert Details */}
          <div className="p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {activeCameraAlert.name}
                </h4>
                {activeCameraAlert.direction && (
                  <p className="text-sm text-muted-foreground">
                    {activeCameraAlert.direction}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30">
                <Gauge className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-red-500">
                  {activeCameraAlert.speedLimit}
                </span>
                <span className="text-sm text-red-500/80">km/h</span>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={dismissCameraAlert}
              className="w-full py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm transition-colors"
            >
              Got it, drive safely
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

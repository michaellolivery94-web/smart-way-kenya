import { motion } from "framer-motion";
import { Compass, Plus, Minus, Navigation2, Layers } from "lucide-react";

interface MapViewProps {
  isNavigating?: boolean;
  isPro?: boolean;
}

export const MapView = ({ isNavigating = false, isPro = false }: MapViewProps) => {
  return (
    <div className="map-container">
      {/* Simulated Map Background */}
      <div className="absolute inset-0">
        <svg 
          className="w-full h-full opacity-20"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Grid pattern representing streets */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1"/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Main Roads */}
          <path
            d="M 200 800 L 200 400 L 280 300 L 280 0"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="8"
            opacity="0.3"
          />
          <path
            d="M 0 500 L 400 500"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="6"
            opacity="0.3"
          />
          <path
            d="M 100 0 L 100 300 L 150 400 L 150 800"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="4"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Active Route */}
      {isNavigating && (
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M 200 750 L 200 500 L 200 400 L 250 350 L 280 300 L 280 150"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="0 0"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <motion.circle
            cx="280"
            cy="150"
            r="8"
            fill="hsl(var(--success))"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>
      )}

      {/* Current Location Marker */}
      <motion.div
        className="absolute left-1/2 bottom-32 -translate-x-1/2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-info rounded-full"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative w-6 h-6 bg-info rounded-full border-3 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* POI Markers */}
      <motion.div
        className="absolute left-[30%] top-[35%]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-warning text-warning-foreground px-2 py-1 rounded text-xs font-semibold shadow-lg">
          Sarit Centre
        </div>
      </motion.div>

      <motion.div
        className="absolute right-[25%] top-[20%]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-success text-success-foreground px-2 py-1 rounded text-xs font-semibold shadow-lg flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Destination
        </div>
      </motion.div>

      {/* Map Controls */}
      <div className="absolute right-4 top-1/3 flex flex-col gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-3 nav-card rounded-xl"
        >
          <Compass className="w-5 h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-3 nav-card rounded-xl"
        >
          <Plus className="w-5 h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-3 nav-card rounded-xl"
        >
          <Minus className="w-5 h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-3 nav-card rounded-xl"
        >
          <Layers className="w-5 h-5 text-foreground" />
        </motion.button>
      </div>

      {/* Re-center button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 bottom-48 p-4 bg-primary rounded-full shadow-lg"
      >
        <Navigation2 className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* Pro Mode Traffic Overlay */}
      {isPro && (
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <div className="nav-card px-3 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-foreground">Light Traffic</span>
          </div>
          <div className="nav-card px-3 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
            <span className="text-xs text-foreground">Mombasa Rd</span>
          </div>
        </div>
      )}
    </div>
  );
};

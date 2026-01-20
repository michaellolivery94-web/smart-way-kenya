import { motion } from "framer-motion";
import { Compass, Plus, Minus, Navigation2, Layers, MapPin, Building2, Fuel, ShoppingBag, Trees } from "lucide-react";

interface MapViewProps {
  isNavigating?: boolean;
  isPro?: boolean;
}

export const MapView = ({ isNavigating = false, isPro = false }: MapViewProps) => {
  return (
    <div className="map-container relative w-full h-full min-h-[400px] overflow-hidden">
      {/* Simulated Map Background with Enhanced Road Network */}
      <div className="absolute inset-0">
        <svg 
          className="w-full h-full"
          viewBox="0 0 800 1200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Enhanced grid pattern */}
            <pattern id="gridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
              <path 
                d="M 20 0 L 0 0 0 20" 
                fill="none" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth="0.3"
                opacity="0.3"
              />
            </pattern>
            <pattern id="gridLarge" width="80" height="80" patternUnits="userSpaceOnUse">
              <path 
                d="M 80 0 L 0 0 0 80" 
                fill="none" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth="0.5"
                opacity="0.4"
              />
            </pattern>
            
            {/* Route gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1"/>
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.8"/>
            </linearGradient>
            
            {/* Building pattern */}
            <pattern id="buildings" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="5" y="5" width="20" height="25" fill="hsl(var(--muted))" opacity="0.4" rx="2"/>
              <rect x="35" y="10" width="15" height="20" fill="hsl(var(--muted))" opacity="0.3" rx="2"/>
              <rect x="10" y="40" width="25" height="15" fill="hsl(var(--muted))" opacity="0.35" rx="2"/>
            </pattern>
            
            {/* Green area pattern */}
            <pattern id="greenArea" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="8" fill="hsl(var(--success))" opacity="0.15"/>
              <circle cx="5" cy="5" r="4" fill="hsl(var(--success))" opacity="0.1"/>
              <circle cx="25" cy="25" r="5" fill="hsl(var(--success))" opacity="0.12"/>
            </pattern>
          </defs>
          
          {/* Base layer */}
          <rect width="100%" height="100%" fill="hsl(var(--background))" />
          <rect width="100%" height="100%" fill="url(#gridSmall)" />
          <rect width="100%" height="100%" fill="url(#gridLarge)" />
          
          {/* Green areas / Parks */}
          <ellipse cx="150" cy="300" rx="80" ry="60" fill="url(#greenArea)" />
          <ellipse cx="650" cy="500" rx="100" ry="70" fill="url(#greenArea)" />
          <rect x="50" y="800" width="120" height="80" rx="20" fill="url(#greenArea)" />
          
          {/* Building blocks */}
          <rect x="200" y="100" width="150" height="120" fill="url(#buildings)" />
          <rect x="500" y="200" width="180" height="150" fill="url(#buildings)" />
          <rect x="100" y="450" width="130" height="100" fill="url(#buildings)" />
          <rect x="550" y="700" width="160" height="130" fill="url(#buildings)" />
          <rect x="250" y="900" width="200" height="150" fill="url(#buildings)" />
          
          {/* Major Highway - Mombasa Road style */}
          <path
            d="M 0 600 Q 200 600 400 550 T 800 500"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="16"
            opacity="0.25"
          />
          <path
            d="M 0 600 Q 200 600 400 550 T 800 500"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="12"
            opacity="0.4"
            strokeDasharray="2 0"
          />
          
          {/* Main arterial roads */}
          <path
            d="M 400 0 L 400 400 Q 400 500 450 550 L 500 600 L 500 1200"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="10"
            opacity="0.35"
          />
          <path
            d="M 200 0 L 200 300 Q 200 400 250 450 L 350 500 L 350 1200"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="8"
            opacity="0.3"
          />
          <path
            d="M 600 0 L 600 350 Q 600 450 550 500 L 500 550"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="8"
            opacity="0.3"
          />
          
          {/* Secondary roads */}
          <path d="M 0 300 L 300 300" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="5" opacity="0.25"/>
          <path d="M 350 400 L 800 400" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="5" opacity="0.25"/>
          <path d="M 0 800 L 250 800 Q 300 800 350 750 L 400 700" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="5" opacity="0.25"/>
          <path d="M 500 800 L 800 800" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="5" opacity="0.25"/>
          
          {/* Minor roads / estate roads */}
          <path d="M 100 200 L 100 500" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
          <path d="M 700 300 L 700 700" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
          <path d="M 0 450 L 200 450" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
          <path d="M 450 200 L 550 200" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
          <path d="M 300 650 L 300 850" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
          <path d="M 600 850 L 600 1100" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
          
          {/* Roundabouts */}
          <circle cx="400" cy="400" r="25" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="6" opacity="0.3"/>
          <circle cx="400" cy="400" r="12" fill="hsl(var(--muted))" opacity="0.5"/>
          <circle cx="250" cy="800" r="20" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="5" opacity="0.25"/>
          <circle cx="500" cy="550" r="18" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="5" opacity="0.25"/>
        </svg>
      </div>

      {/* Active Route Overlay */}
      {isNavigating && (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 1200"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Route path */}
          <motion.path
            d="M 400 1100 L 400 800 Q 400 700 420 650 L 450 600 Q 480 550 500 520 L 500 400 Q 500 350 520 300 L 560 250"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
          
          {/* Route glow effect */}
          <motion.path
            d="M 400 1100 L 400 800 Q 400 700 420 650 L 450 600 Q 480 550 500 520 L 500 400 Q 500 350 520 300 L 560 250"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
          
          {/* Destination marker */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, duration: 0.5, type: "spring" }}
          >
            <circle cx="560" cy="250" r="20" fill="hsl(var(--success))" opacity="0.3">
              <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="560" cy="250" r="12" fill="hsl(var(--success))"/>
            <circle cx="560" cy="250" r="5" fill="white"/>
          </motion.g>
          
          {/* Turn indicator */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
          >
            <circle cx="450" cy="600" r="10" fill="hsl(var(--warning))" />
            <path d="M 445 600 L 455 595 L 455 605 Z" fill="white"/>
          </motion.g>
        </svg>
      )}

      {/* Current Location Marker */}
      <motion.div
        className="absolute left-1/2 bottom-[15%] sm:bottom-[18%] md:bottom-[20%] -translate-x-1/2 z-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative">
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 bg-info rounded-full"
            style={{ width: 48, height: 48, marginLeft: -12, marginTop: -12 }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 bg-info rounded-full"
            style={{ width: 48, height: 48, marginLeft: -12, marginTop: -12 }}
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          {/* Main marker */}
          <div className="relative w-6 h-6 bg-info rounded-full border-[3px] border-white shadow-lg flex items-center justify-center">
            <Navigation2 className="w-3 h-3 text-white rotate-0" fill="white" />
          </div>
          {/* Direction cone */}
          <div 
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '16px solid hsl(var(--info))',
              opacity: 0.4
            }}
          />
        </div>
      </motion.div>

      {/* POI Markers - Responsive positioning */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sarit Centre */}
        <motion.div
          className="absolute left-[15%] sm:left-[20%] top-[30%] sm:top-[28%] pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="nav-card px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
            <span className="text-[10px] sm:text-xs font-semibold text-foreground whitespace-nowrap">Sarit Centre</span>
          </div>
        </motion.div>

        {/* Destination */}
        {isNavigating && (
          <motion.div
            className="absolute right-[15%] sm:right-[20%] top-[18%] sm:top-[15%] pointer-events-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-success text-success-foreground px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Destination</span>
            </div>
          </motion.div>
        )}

        {/* Westlands */}
        <motion.div
          className="absolute left-[8%] sm:left-[12%] top-[45%] sm:top-[42%] pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="nav-card px-2 py-1 sm:px-2.5 sm:py-1.5 flex items-center gap-1 shadow-md">
            <Building2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">Westlands</span>
          </div>
        </motion.div>

        {/* Shell Petrol */}
        <motion.div
          className="absolute right-[25%] sm:right-[30%] top-[55%] sm:top-[50%] pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="nav-card px-1.5 py-1 sm:px-2 sm:py-1.5 flex items-center gap-1 shadow-md">
            <Fuel className="w-3 h-3 text-warning" />
            <span className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">Shell</span>
          </div>
        </motion.div>

        {/* Uhuru Park */}
        <motion.div
          className="absolute left-[5%] sm:left-[10%] bottom-[30%] sm:bottom-[35%] pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="nav-card px-1.5 py-1 sm:px-2 sm:py-1.5 flex items-center gap-1 shadow-md">
            <Trees className="w-3 h-3 text-success" />
            <span className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">Uhuru Park</span>
          </div>
        </motion.div>
      </div>

      {/* Map Controls - Responsive */}
      <div className="absolute right-2 sm:right-4 top-1/4 sm:top-1/3 flex flex-col gap-1.5 sm:gap-2 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg"
          aria-label="Compass"
        >
          <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg"
          aria-label="Map layers"
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </motion.button>
      </div>

      {/* Re-center button - Responsive */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="absolute right-2 sm:right-4 bottom-36 sm:bottom-48 p-3 sm:p-4 bg-primary rounded-full shadow-lg z-10"
        aria-label="Re-center map"
      >
        <Navigation2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
      </motion.button>

      {/* Pro Mode Traffic Overlay - Responsive */}
      {isPro && (
        <motion.div 
          className="absolute left-2 sm:left-4 top-2 sm:top-4 flex flex-col gap-1.5 sm:gap-2 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="nav-card px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success" />
            <span className="text-[10px] sm:text-xs text-foreground whitespace-nowrap">Light Traffic</span>
          </div>
          <div className="nav-card px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-warning animate-pulse" />
            <span className="text-[10px] sm:text-xs text-foreground whitespace-nowrap">Mombasa Rd</span>
          </div>
          <div className="nav-card px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-[10px] sm:text-xs text-foreground whitespace-nowrap">Uhuru Highway</span>
          </div>
        </motion.div>
      )}

      {/* Speed indicator - Pro mode */}
      {isPro && isNavigating && (
        <motion.div
          className="absolute left-2 sm:left-4 bottom-36 sm:bottom-48 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="nav-card w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shadow-lg">
            <span className="text-lg sm:text-xl font-bold text-foreground">45</span>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground">km/h</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

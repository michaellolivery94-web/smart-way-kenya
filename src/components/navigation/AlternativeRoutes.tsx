import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Zap, Route, ChevronRight, Fuel, TrendingDown } from "lucide-react";

// Nairobi fuel economics (petrol, ~10 L/100km sedan)
const FUEL_PRICE_KSH_PER_L = 195;
const CONSUMPTION_L_PER_KM = 0.1;
const KSH_PER_KM = FUEL_PRICE_KSH_PER_L * CONSUMPTION_L_PER_KM;
const estimateFuelCost = (meters: number) => (meters / 1000) * KSH_PER_KM;
import { useState, useEffect } from "react";

export interface RouteOption {
  index: number;
  duration: number; // seconds
  distance: number; // meters
  summary: string;
  geometry: any;
  coordinates: [number, number][];
  steps: any[]; // OSRM route steps for AI directions
}

interface AlternativeRoutesProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  isVisible: boolean;
  onSelectRoute: (route: RouteOption) => void;
  onClose: () => void;
}

export const AlternativeRoutes = ({ 
  origin, destination, isVisible, onSelectRoute, onClose 
}: AlternativeRoutesProps) => {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!origin || !destination || !isVisible) return;
    
    const fetchRoutes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true&alternatives=3`
        );
        const data = await response.json();
        
        if (data.routes) {
          const parsed: RouteOption[] = data.routes.map((r: any, i: number) => ({
            index: i,
            duration: r.duration,
            distance: r.distance,
            summary: r.legs?.[0]?.summary || `Route ${i + 1}`,
            geometry: r.geometry,
            coordinates: r.geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as [number, number]
            ),
            steps: r.legs?.[0]?.steps || [],
          }));
          setRoutes(parsed);
          setSelectedIndex(0);
        }
      } catch {
        setRoutes([]);
      }
      setIsLoading(false);
    };

    fetchRoutes();
  }, [origin, destination, isVisible]);

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const formatDistance = (meters: number) => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  const getArrivalTime = (seconds: number) => {
    const arrival = new Date(Date.now() + seconds * 1000);
    return arrival.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  const getRouteColor = (index: number) => {
    if (index === 0) return "text-success";
    if (index === 1) return "text-info";
    return "text-warning";
  };

  const getRouteLabel = (index: number, routes: RouteOption[]) => {
    if (index === 0) return "Fastest";
    const diff = Math.round((routes[index].duration - routes[0].duration) / 60);
    return `+${diff} min`;
  };

  if (!isVisible || routes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-0 left-0 right-0 z-30 p-2 sm:p-3"
      >
        <div className="nav-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {routes.length} routes found
              </span>
            </div>
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>

          {/* Route Options */}
          <div className="p-2 space-y-2 max-h-[35vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-6 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Finding best routes...</p>
              </div>
            ) : (
              routes.map((route, i) => {
                const fuelCost = estimateFuelCost(route.distance);
                const maxFuel = Math.max(...routes.map(r => estimateFuelCost(r.distance)));
                const fuelSavings = maxFuel - fuelCost;
                const timeVsFastest = Math.round((route.duration - routes[0].duration) / 60);
                return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedIndex(i);
                    onSelectRoute(route);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${
                    selectedIndex === i
                      ? "border-primary/50 bg-primary/10 shadow-md shadow-primary/10"
                      : "border-border/30 bg-secondary/30 hover:bg-secondary/60"
                  }`}
                >
                  {/* Route indicator */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedIndex === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i === 0 ? (
                      <Zap className="w-5 h-5" />
                    ) : (
                      <Route className="w-5 h-5" />
                    )}
                  </div>

                  {/* Route details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-foreground">
                        {formatDuration(route.duration)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        i === 0 
                          ? "bg-success/20 text-success" 
                          : "bg-warning/20 text-warning"
                      }`}>
                        {getRouteLabel(i, routes)}
                      </span>
                      {fuelSavings > 5 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/20 text-success">
                          <TrendingDown className="w-2.5 h-2.5" />
                          Save Ksh {Math.round(fuelSavings)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDistance(route.distance)} • Arrive {getArrivalTime(route.duration)}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-warning font-medium">
                        <Fuel className="w-3 h-3" />
                        Ksh {Math.round(fuelCost)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-info font-medium">
                        <Clock className="w-3 h-3" />
                        {i === 0 ? "Baseline" : `+${timeVsFastest}m vs fastest`}
                      </span>
                    </div>
                    {route.summary && (
                      <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
                        via {route.summary}
                      </p>
                    )}
                  </div>

                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                    selectedIndex === i ? "text-primary" : "text-muted-foreground"
                  }`} />
                </motion.button>
              );})
            )}
          </div>

          {/* Start Button */}
          {routes.length > 0 && (
            <div className="p-3 border-t border-border/50 space-y-2">
              {/* Selected route summary */}
              <div className="flex items-center justify-around text-xs bg-secondary/40 rounded-lg py-2">
                <div className="flex items-center gap-1.5 text-info">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-bold">{formatDuration(routes[selectedIndex].duration)}</span>
                  <span className="text-muted-foreground">left</span>
                </div>
                <div className="w-px h-4 bg-border/50" />
                <div className="flex items-center gap-1.5 text-warning">
                  <Fuel className="w-3.5 h-3.5" />
                  <span className="font-bold">Ksh {Math.round(estimateFuelCost(routes[selectedIndex].distance))}</span>
                  <span className="text-muted-foreground">fuel</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectRoute(routes[selectedIndex])}
                className="w-full py-3 rounded-xl nav-button-primary text-sm font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Start on {selectedIndex === 0 ? "fastest" : `route ${selectedIndex + 1}`}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

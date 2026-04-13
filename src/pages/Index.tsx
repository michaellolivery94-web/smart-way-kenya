import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapView, MapViewHandle } from "@/components/navigation/MapView";
import { Header } from "@/components/navigation/Header";
import { LocationSearch } from "@/components/navigation/LocationSearch";
import { NavigationPanel } from "@/components/navigation/NavigationPanel";
import { ReportButton } from "@/components/navigation/ReportButton";
import { OfflineMapsManager } from "@/components/navigation/OfflineMapsManager";
import { RoadConditionAlert } from "@/components/navigation/RoadConditionAlert";
import { SpeedCameraAlert } from "@/components/navigation/SpeedCameraAlert";
import { RoadConditionsList } from "@/components/navigation/RoadConditionsList";
import { FullscreenToggle } from "@/components/navigation/FullscreenToggle";
import { QuickCategories } from "@/components/navigation/QuickCategories";
import { AlternativeRoutes, RouteOption } from "@/components/navigation/AlternativeRoutes";
import { ShareETA } from "@/components/navigation/ShareETA";
import { SpeedLimitIndicator } from "@/components/navigation/SpeedLimitIndicator";
import { TripSummary } from "@/components/navigation/TripSummary";
import { SearchAlongRoute } from "@/components/navigation/SearchAlongRoute";
import { ETAProgressBar } from "@/components/navigation/ETAProgressBar";
import { useOfflineMaps } from "@/hooks/useOfflineMaps";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { WifiOff, Construction } from "lucide-react";

interface Coordinates {
  lat: number;
  lng: number;
}

const Index = () => {
  const [mode, setMode] = useState<"commuter" | "pro">("commuter");
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("Current Location");
  const [showOfflineMaps, setShowOfflineMaps] = useState(false);
  const [showRoadConditions, setShowRoadConditions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(false);
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(42);
  const [currentSpeedLimit, setCurrentSpeedLimit] = useState(50);
  // Coordinate states for map
  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [previewLocation, setPreviewLocation] = useState<Coordinates | null>(null);
  const [routeETA, setRouteETA] = useState<string>("18 min");
  const [routeDistance, setRouteDistance] = useState<string>("7.2 km");
  const [userLocation, setUserLocation] = useState<[number, number]>([-1.2921, 36.8219]);
  
  const { isOnline, downloadedRegions } = useOfflineMaps();

  // Simulate speed changes during navigation
  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setCurrentSpeed(prev => {
        const change = Math.floor(Math.random() * 12) - 5;
        return Math.max(15, Math.min(85, prev + change));
      });
      // Occasionally change speed limit zones
      if (Math.random() < 0.1) {
        setCurrentSpeedLimit(prev => [30, 40, 50, 60, 80][Math.floor(Math.random() * 5)]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isNavigating]);
  
  // Ref to access map methods
  const mapRef = useRef<MapViewHandle>(null);

  const handleModeChange = (newMode: "commuter" | "pro") => {
    setMode(newMode);
    toast.success(
      newMode === "pro" 
        ? "Pro Driver Mode activated - shortcuts enabled" 
        : "Commuter Mode - simple navigation"
    );
  };

  const handleStartNavigation = (
    from: string, 
    to: string, 
    coords: { origin: Coordinates | null; destination: Coordinates }
  ) => {
    setOrigin(from);
    setDestination(to);
    setOriginCoords(coords.origin);
    setDestinationCoords(coords.destination);
    setPreviewLocation(null);
    // Show alternative routes first (Google Maps style)
    setShowAlternativeRoutes(true);
  };

  const handleSelectRoute = (route: RouteOption) => {
    setShowAlternativeRoutes(false);
    setIsNavigating(true);
    const duration = Math.round(route.duration / 60);
    const distance = (route.distance / 1000).toFixed(1);
    setRouteETA(`${duration} min`);
    setRouteDistance(`${distance} km`);
    toast.success(`Navigating to ${destination}`, {
      description: `${duration} min • ${distance} km • Arrive ${new Date(Date.now() + route.duration * 1000).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`,
    });
  };

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; name: string }) => {
    // Preview the selected location on map
    setPreviewLocation({ lat: location.lat, lng: location.lng });
    mapRef.current?.flyTo(location.lat, location.lng, 15);
  }, []);

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setDestination(null);
    setDestinationCoords(null);
    setOriginCoords(null);
    setPreviewLocation(null);
  };

  const handleReport = (type: string) => {
    toast.success(`Reported: ${type}`, {
      description: "Thanks for helping other drivers in Nairobi!",
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-background">
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="fixed top-0 left-0 right-0 bg-warning text-warning-foreground text-center py-2.5 text-sm font-medium z-50 flex items-center justify-center gap-2 shadow-lg"
          >
            <WifiOff className="w-4 h-4" />
            Offline Mode - Using cached maps
            {downloadedRegions.length > 0 && (
              <span className="opacity-75">
                ({downloadedRegions.length} regions available)
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Layer with Error Boundary */}
      <ErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Map unavailable</h3>
              <p className="text-sm text-muted-foreground">Please check your connection</p>
            </div>
          </div>
        }
      >
        <Suspense 
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <LoadingSpinner size="lg" label="Loading map..." />
            </div>
          }
        >
          <MapView 
            ref={mapRef}
            isNavigating={isNavigating} 
            isPro={mode === "pro"} 
            origin={originCoords}
            destination={destinationCoords}
            previewLocation={previewLocation}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Fullscreen Toggle - always visible */}
      <FullscreenToggle 
        isFullscreen={isFullscreen} 
        onToggle={() => setIsFullscreen(prev => !prev)} 
      />

      {/* All overlays hidden when fullscreen */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Road Condition Alert */}
            <RoadConditionAlert />
            
            {/* Speed Camera Alert */}
            <SpeedCameraAlert />

            {/* Header */}
            <Header 
              mode={mode} 
              onModeChange={handleModeChange} 
              isNavigating={isNavigating}
              onOpenOfflineMaps={() => setShowOfflineMaps(true)}
              onOpenRoadConditions={() => setShowRoadConditions(true)}
            />

            {/* Location Search & Quick Categories - Only show when not navigating */}
            <AnimatePresence>
              {!isNavigating && !showAlternativeRoutes && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-14 sm:top-16 left-2 right-2 sm:left-3 sm:right-3 z-20 space-y-2"
                >
                  <LocationSearch 
                    onStartNavigation={handleStartNavigation}
                    onLocationSelect={handleLocationSelect}
                  />
                  {/* Quick Category Chips - Google Maps style */}
                  <QuickCategories onLocationSelect={handleLocationSelect} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Navigation Header - Enhanced with arrival time */}
            <AnimatePresence>
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-0 left-0 right-0 z-30"
                >
                  <div className="bg-card/95 backdrop-blur-sm border-b border-border p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleEndNavigation}
                        className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
                      >
                        ✕ End
                      </button>
                      <div className="text-center flex-1 mx-3">
                        <h1 className="font-display font-semibold text-foreground text-sm sm:text-base truncate">{destination}</h1>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-bold text-success">{routeETA}</span>
                          <span>•</span>
                          <span>{routeDistance}</span>
                          <span>•</span>
                          <span>Arrive {new Date(Date.now() + parseInt(routeETA) * 60 * 1000).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleModeChange(mode === "pro" ? "commuter" : "pro")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          mode === "pro" 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {mode === "pro" ? "PRO" : "STD"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Panel */}
            <NavigationPanel 
              isNavigating={isNavigating} 
              isPro={mode === "pro"}
              onOpenOfflineMaps={() => setShowOfflineMaps(true)}
            />

            {/* Share ETA - During navigation */}
            <ShareETA 
              destination={destination}
              eta={routeETA}
              distance={routeDistance}
              isNavigating={isNavigating}
            />

            {/* Report FAB */}
            <ReportButton onReport={handleReport} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alternative Routes Overlay */}
      <AlternativeRoutes
        origin={originCoords}
        destination={destinationCoords}
        isVisible={showAlternativeRoutes}
        onSelectRoute={handleSelectRoute}
        onClose={() => {
          setShowAlternativeRoutes(false);
          setDestinationCoords(null);
          setDestination(null);
        }}
      />

      {/* Offline Maps Manager */}
      <OfflineMapsManager 
        isOpen={showOfflineMaps} 
        onClose={() => setShowOfflineMaps(false)} 
      />

      {/* Road Conditions List */}
      <RoadConditionsList
        isOpen={showRoadConditions}
        onClose={() => setShowRoadConditions(false)}
      />
    </div>
  );
};

export default Index;

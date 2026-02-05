import { useState, useRef, useCallback, Suspense } from "react";
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
  // Coordinate states for map
  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [previewLocation, setPreviewLocation] = useState<Coordinates | null>(null);
  
  const { isOnline, downloadedRegions } = useOfflineMaps();
  
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
    setIsNavigating(true);
    toast.success(`Navigating to ${to}`, {
      description: `From: ${from}`,
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

      {/* Location Search - Only show when not navigating */}
      <AnimatePresence>
        {!isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 sm:top-24 left-3 right-3 sm:left-4 sm:right-4 z-20"
          >
            <LocationSearch 
              onStartNavigation={handleStartNavigation}
              onLocationSelect={handleLocationSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Navigation Header */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-30"
          >
            <div className="bg-card/95 backdrop-blur-sm border-b border-border p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleEndNavigation}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕ End
                </button>
                <div className="text-center">
                  <h1 className="font-display font-semibold text-foreground">{destination}</h1>
                  <p className="text-xs text-muted-foreground">via fastest route</p>
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

      {/* Report FAB */}
      <ReportButton onReport={handleReport} />

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

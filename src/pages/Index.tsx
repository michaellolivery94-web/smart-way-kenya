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
import { FullscreenToggle } from "@/components/navigation/FullscreenToggle";
import { useOfflineMaps } from "@/hooks/useOfflineMaps";
import { useAIDirections } from "@/hooks/useAIDirections";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { WifiOff } from "lucide-react";

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
  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [previewLocation, setPreviewLocation] = useState<Coordinates | null>(null);
  
  const { isOnline, downloadedRegions } = useOfflineMaps();
  const { directions, summary, isLoading: isLoadingDirections, error: directionsError, fetchDirections, clearDirections } = useAIDirections();
  
  const mapRef = useRef<MapViewHandle>(null);

  // Store nav params for retry
  const lastNavParams = useRef<{ from: string; to: string; coords: { origin: Coordinates | null; destination: Coordinates } } | null>(null);

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

    lastNavParams.current = { from, to, coords };

    // Fetch AI-powered directions
    if (coords.origin) {
      fetchDirections(coords.origin, coords.destination, from, to);
    } else {
      // Use Nairobi CBD as fallback origin
      const fallbackOrigin = { lat: -1.2921, lng: 36.8219 };
      fetchDirections(fallbackOrigin, coords.destination, from, to);
    }

    toast.success(`Navigating to ${to}`, {
      description: `From: ${from}`,
    });
  };

  const handleRetryDirections = () => {
    const params = lastNavParams.current;
    if (params) {
      const originPt = params.coords.origin || { lat: -1.2921, lng: 36.8219 };
      fetchDirections(originPt, params.coords.destination, params.from, params.to);
    }
  };

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; name: string }) => {
    setPreviewLocation({ lat: location.lat, lng: location.lng });
    mapRef.current?.flyTo(location.lat, location.lng, 15);
  }, []);

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setDestination(null);
    setDestinationCoords(null);
    setOriginCoords(null);
    setPreviewLocation(null);
    clearDirections();
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

      {/* Map Layer */}
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

      {/* Fullscreen Toggle */}
      <FullscreenToggle 
        isFullscreen={isFullscreen} 
        onToggle={() => setIsFullscreen(prev => !prev)} 
      />

      {/* Overlays */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <RoadConditionAlert />
            <SpeedCameraAlert />

            <Header 
              mode={mode} 
              onModeChange={handleModeChange} 
              isNavigating={isNavigating}
              onOpenOfflineMaps={() => setShowOfflineMaps(true)}
              onOpenRoadConditions={() => setShowRoadConditions(true)}
            />

            <AnimatePresence>
              {!isNavigating && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-14 sm:top-16 left-2 right-2 sm:left-3 sm:right-3 z-20"
                >
                  <LocationSearch 
                    onStartNavigation={handleStartNavigation}
                    onLocationSelect={handleLocationSelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Navigation Panel with AI directions */}
            <NavigationPanel 
              isNavigating={isNavigating} 
              isPro={mode === "pro"}
              onOpenOfflineMaps={() => setShowOfflineMaps(true)}
              aiDirections={directions}
              aiSummary={summary}
              isLoadingDirections={isLoadingDirections}
              directionsError={directionsError}
              onRetryDirections={handleRetryDirections}
            />

            <ReportButton onReport={handleReport} />
          </motion.div>
        )}
      </AnimatePresence>

      <OfflineMapsManager 
        isOpen={showOfflineMaps} 
        onClose={() => setShowOfflineMaps(false)} 
      />

      <RoadConditionsList
        isOpen={showRoadConditions}
        onClose={() => setShowRoadConditions(false)}
      />
    </div>
  );
};

export default Index;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapView } from "@/components/navigation/MapView";
import { Header } from "@/components/navigation/Header";
import { SearchBar } from "@/components/navigation/SearchBar";
import { NavigationPanel } from "@/components/navigation/NavigationPanel";
import { ReportButton } from "@/components/navigation/ReportButton";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<"commuter" | "pro">("commuter");
  const [isNavigating, setIsNavigating] = useState(true);
  const [destination, setDestination] = useState<string | null>("Westlands, Nairobi");

  const handleModeChange = (newMode: "commuter" | "pro") => {
    setMode(newMode);
    toast.success(
      newMode === "pro" 
        ? "Pro Driver Mode activated - shortcuts enabled" 
        : "Commuter Mode - simple navigation"
    );
  };

  const handleSearch = (query: string) => {
    setDestination(query);
    setIsNavigating(true);
    toast.success(`Navigating to ${query}`);
  };

  const handleReport = (type: string) => {
    toast.success(`Reported: ${type}`, {
      description: "Thanks for helping other drivers in Nairobi!",
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Map Layer */}
      <MapView isNavigating={isNavigating} isPro={mode === "pro"} />

      {/* Header */}
      <Header mode={mode} onModeChange={handleModeChange} isNavigating={isNavigating} />

      {/* Search Bar - Only show when not navigating */}
      <AnimatePresence>
        {!isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 z-20"
          >
            <SearchBar onSearch={handleSearch} />
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
                  onClick={() => setIsNavigating(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕ End
                </button>
                <div className="text-center">
                  <h1 className="font-display font-semibold text-foreground">{destination}</h1>
                  <p className="text-xs text-muted-foreground">via Ring Road Parklands</p>
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
      <NavigationPanel isNavigating={isNavigating} isPro={mode === "pro"} />

      {/* Report FAB */}
      <ReportButton onReport={handleReport} />

      {/* Offline Banner - Demo */}
      {false && (
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 bg-warning text-warning-foreground text-center py-2 text-sm font-medium z-50"
        >
          Offline Mode - Using cached maps for Nairobi
        </motion.div>
      )}
    </div>
  );
};

export default Index;

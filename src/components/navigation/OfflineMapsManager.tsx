import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Trash2,
  HardDrive,
  MapPin,
  Check,
  Loader2,
  WifiOff,
  Wifi,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useOfflineMaps } from "@/hooks/useOfflineMaps";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface OfflineMapsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineMapsManager = ({ isOpen, onClose }: OfflineMapsManagerProps) => {
  const {
    availableRegions,
    downloadedRegions,
    downloadProgress,
    storageUsed,
    storageQuota,
    isOnline,
    downloadRegionById,
    removeRegion,
    clearAllData,
  } = useOfflineMaps();

  const [activeTab, setActiveTab] = useState<"available" | "downloaded">("available");

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1000) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const handleDownload = async (regionId: string, regionName: string) => {
    if (!isOnline) {
      toast.error("You need internet connection to download maps");
      return;
    }
    toast.info(`Downloading ${regionName}...`);
    await downloadRegionById(regionId);
    toast.success(`${regionName} is now available offline!`);
  };

  const handleRemove = async (regionId: string, regionName: string) => {
    await removeRegion(regionId);
    toast.success(`${regionName} removed from offline storage`);
  };

  const handleClearAll = async () => {
    await clearAllData();
    toast.success("All offline maps cleared");
  };

  const groupRegionsByArea = (regions: typeof availableRegions) => {
    return regions.reduce((acc, region) => {
      if (!acc[region.area]) acc[region.area] = [];
      acc[region.area].push(region);
      return acc;
    }, {} as Record<string, typeof availableRegions>);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-3xl bg-card border-t border-border"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <HardDrive className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">Offline Maps</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isOnline ? (
                        <>
                          <Wifi className="w-3 h-3 text-success" />
                          <span>Online - Ready to download</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 text-warning" />
                          <span>Offline Mode</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Storage indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="text-foreground font-medium">
                    {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
                  </span>
                </div>
                <Progress 
                  value={(storageUsed / storageQuota) * 100} 
                  className="h-2"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab("available")}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === "available"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Available ({availableRegions.length})
                </button>
                <button
                  onClick={() => setActiveTab("downloaded")}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === "downloaded"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Downloaded ({downloadedRegions.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-4">
              {activeTab === "available" ? (
                <div className="space-y-6">
                  {Object.entries(groupRegionsByArea(availableRegions)).map(([area, regions]) => (
                    <div key={area}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {area}
                      </h3>
                      <div className="space-y-2">
                        {regions.map((region) => {
                          const progress = downloadProgress[region.id];
                          const isDownloading = progress?.status === "downloading";

                          return (
                            <motion.div
                              key={region.id}
                              layout
                              className="nav-card p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary">
                                  <MapPin className="w-4 h-4 text-foreground" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">{region.name}</h4>
                                  <p className="text-xs text-muted-foreground">{region.size} MB</p>
                                </div>
                              </div>

                              {isDownloading ? (
                                <div className="flex items-center gap-3 min-w-[100px]">
                                  <Progress value={progress.progress} className="h-2 flex-1" />
                                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleDownload(region.id, region.name)}
                                  disabled={!isOnline}
                                  className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {availableRegions.length === 0 && (
                    <div className="text-center py-12">
                      <Check className="w-12 h-12 text-success mx-auto mb-3" />
                      <h3 className="font-medium text-foreground">All regions downloaded!</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You have all Nairobi maps available offline
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {downloadedRegions.map((region) => (
                    <motion.div
                      key={region.id}
                      layout
                      className="nav-card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/20">
                          <Check className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{region.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {region.size} MB • Downloaded{" "}
                            {region.downloadedAt
                              ? new Date(region.downloadedAt).toLocaleDateString()
                              : "recently"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(region.id, region.name)}
                        className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}

                  {downloadedRegions.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium text-foreground">No offline maps</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Download regions to navigate without internet
                      </p>
                    </div>
                  )}

                  {downloadedRegions.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="w-full mt-4 p-4 rounded-xl border border-destructive/30 text-destructive flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All Offline Maps</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick download suggestion */}
            {activeTab === "available" && downloadedRegions.length === 0 && (
              <div className="sticky bottom-0 p-4 bg-gradient-to-t from-card via-card to-transparent">
                <button
                  onClick={() => {
                    handleDownload("westlands", "Westlands");
                    handleDownload("cbd", "CBD & Downtown");
                  }}
                  disabled={!isOnline}
                  className="nav-button-primary w-full py-4 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Nairobi Essentials (27 MB)</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

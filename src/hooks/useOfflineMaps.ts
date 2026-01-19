import { useState, useEffect, useCallback } from 'react';
import {
  getAllOfflineRegions,
  getStorageUsage,
  downloadRegion,
  deleteOfflineRegion,
  clearAllOfflineData,
  NAIROBI_REGIONS,
  OfflineRegion,
  DownloadProgress,
} from '@/lib/offlineStorage';

interface UseOfflineMapsReturn {
  availableRegions: OfflineRegion[];
  downloadedRegions: OfflineRegion[];
  downloadProgress: Record<string, DownloadProgress>;
  storageUsed: number;
  storageQuota: number;
  isOnline: boolean;
  downloadRegionById: (regionId: string) => Promise<void>;
  removeRegion: (regionId: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useOfflineMaps(): UseOfflineMapsReturn {
  const [downloadedRegions, setDownloadedRegions] = useState<OfflineRegion[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({});
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const refreshData = useCallback(async () => {
    const regions = await getAllOfflineRegions();
    setDownloadedRegions(regions);

    const storage = await getStorageUsage();
    setStorageUsed(storage.used);
    setStorageQuota(storage.quota);
  }, []);

  useEffect(() => {
    refreshData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshData]);

  const downloadRegionById = useCallback(async (regionId: string) => {
    setDownloadProgress(prev => ({
      ...prev,
      [regionId]: { regionId, progress: 0, status: 'downloading' },
    }));

    try {
      await downloadRegion(regionId, (progress) => {
        setDownloadProgress(prev => ({
          ...prev,
          [regionId]: { regionId, progress, status: 'downloading' },
        }));
      });

      setDownloadProgress(prev => ({
        ...prev,
        [regionId]: { regionId, progress: 100, status: 'complete' },
      }));

      await refreshData();
    } catch (error) {
      setDownloadProgress(prev => ({
        ...prev,
        [regionId]: { regionId, progress: 0, status: 'error' },
      }));
    }
  }, [refreshData]);

  const removeRegion = useCallback(async (regionId: string) => {
    await deleteOfflineRegion(regionId);
    await refreshData();
  }, [refreshData]);

  const clearAllData = useCallback(async () => {
    await clearAllOfflineData();
    setDownloadProgress({});
    await refreshData();
  }, [refreshData]);

  const availableRegions = NAIROBI_REGIONS.filter(
    region => !downloadedRegions.some(d => d.id === region.id)
  );

  return {
    availableRegions,
    downloadedRegions,
    downloadProgress,
    storageUsed,
    storageQuota,
    isOnline,
    downloadRegionById,
    removeRegion,
    clearAllData,
    refreshData,
  };
}

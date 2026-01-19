import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'wayfinder-offline';
const DB_VERSION = 1;

export interface OfflineRegion {
  id: string;
  name: string;
  area: string;
  size: number; // in MB
  downloadedAt?: Date;
  tiles?: ArrayBuffer[];
  routes?: any[];
  landmarks?: any[];
}

export interface DownloadProgress {
  regionId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'complete' | 'error';
}

let db: IDBPDatabase | null = null;

async function getDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // Store for offline regions
        if (!database.objectStoreNames.contains('regions')) {
          database.createObjectStore('regions', { keyPath: 'id' });
        }
        // Store for cached routes
        if (!database.objectStoreNames.contains('routes')) {
          database.createObjectStore('routes', { keyPath: 'id' });
        }
        // Store for landmarks
        if (!database.objectStoreNames.contains('landmarks')) {
          database.createObjectStore('landmarks', { keyPath: 'id' });
        }
      },
    });
  }
  return db;
}

export async function saveOfflineRegion(region: OfflineRegion): Promise<void> {
  const database = await getDB();
  await database.put('regions', {
    ...region,
    downloadedAt: new Date(),
  });
}

export async function getOfflineRegion(id: string): Promise<OfflineRegion | undefined> {
  const database = await getDB();
  return database.get('regions', id);
}

export async function getAllOfflineRegions(): Promise<OfflineRegion[]> {
  const database = await getDB();
  return database.getAll('regions');
}

export async function deleteOfflineRegion(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('regions', id);
}

export async function getStorageUsage(): Promise<{ used: number; quota: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { used: 0, quota: 0 };
}

export async function clearAllOfflineData(): Promise<void> {
  const database = await getDB();
  await database.clear('regions');
  await database.clear('routes');
  await database.clear('landmarks');
}

// Simulate downloading map tiles for a region
export async function downloadRegion(
  regionId: string,
  onProgress: (progress: number) => void
): Promise<void> {
  const region = NAIROBI_REGIONS.find(r => r.id === regionId);
  if (!region) throw new Error('Region not found');

  // Simulate download with progress
  const totalSteps = 20;
  for (let i = 0; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 150));
    onProgress((i / totalSteps) * 100);
  }

  // Save the region as downloaded
  await saveOfflineRegion({
    ...region,
    downloadedAt: new Date(),
    // In a real app, this would contain actual map tile data
    tiles: [],
    routes: generateMockRoutes(regionId),
    landmarks: generateMockLandmarks(regionId),
  });
}

// Nairobi regions available for offline download
export const NAIROBI_REGIONS: OfflineRegion[] = [
  { id: 'westlands', name: 'Westlands', area: 'Nairobi Central', size: 12 },
  { id: 'cbd', name: 'CBD & Downtown', area: 'Nairobi Central', size: 15 },
  { id: 'upperhill', name: 'Upper Hill', area: 'Nairobi Central', size: 8 },
  { id: 'kilimani', name: 'Kilimani', area: 'Nairobi Central', size: 10 },
  { id: 'lavington', name: 'Lavington', area: 'Nairobi West', size: 9 },
  { id: 'karen', name: 'Karen', area: 'Nairobi West', size: 18 },
  { id: 'langata', name: 'Lang\'ata', area: 'Nairobi West', size: 14 },
  { id: 'rongai', name: 'Rongai', area: 'Greater Nairobi', size: 22 },
  { id: 'kitengela', name: 'Kitengela', area: 'Greater Nairobi', size: 25 },
  { id: 'thika', name: 'Thika Road Corridor', area: 'Greater Nairobi', size: 30 },
  { id: 'ruiru', name: 'Ruiru', area: 'Greater Nairobi', size: 20 },
  { id: 'embakasi', name: 'Embakasi', area: 'Nairobi East', size: 16 },
  { id: 'jkia', name: 'JKIA & Industrial Area', area: 'Nairobi East', size: 12 },
  { id: 'kasarani', name: 'Kasarani', area: 'Nairobi North', size: 14 },
  { id: 'parklands', name: 'Parklands', area: 'Nairobi Central', size: 11 },
];

function generateMockRoutes(regionId: string): any[] {
  // Mock route data for offline navigation
  return [
    { id: `${regionId}-route-1`, name: 'Main Highway', type: 'primary' },
    { id: `${regionId}-route-2`, name: 'Secondary Road', type: 'secondary' },
  ];
}

function generateMockLandmarks(regionId: string): any[] {
  // Mock landmark data for offline navigation
  const landmarksByRegion: Record<string, any[]> = {
    westlands: [
      { id: 'sarit', name: 'Sarit Centre', type: 'mall' },
      { id: 'westgate', name: 'Westgate Mall', type: 'mall' },
      { id: 'total-westlands', name: 'Total Westlands', type: 'fuel' },
    ],
    cbd: [
      { id: 'kenyatta-centre', name: 'Kenyatta International Convention Centre', type: 'landmark' },
      { id: 'hilton', name: 'Hilton Hotel', type: 'hotel' },
      { id: 'archives', name: 'National Archives', type: 'landmark' },
    ],
    jkia: [
      { id: 'jkia-terminal', name: 'JKIA Terminal 1', type: 'airport' },
      { id: 'city-cabanas', name: 'City Cabanas', type: 'restaurant' },
    ],
  };
  return landmarksByRegion[regionId] || [];
}

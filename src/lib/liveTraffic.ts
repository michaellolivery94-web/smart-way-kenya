import { supabase } from "@/integrations/supabase/client";
import {
  CORRIDORS,
  Corridor,
  CorridorStatus,
  TrafficLevel,
  getCorridorStatus,
} from "@/data/corridors";

const SAMPLE_WINDOW_MINUTES = 30;
const MIN_SAMPLES_FOR_LIVE = 3;
const MAX_MATCH_KM = 4;

export interface LiveCorridorReading {
  averageSpeed: number;
  sampleCount: number;
  lastSeen: string;
}

export type LiveReadings = Record<string, LiveCorridorReading>;

export interface CorridorLiveStatus extends CorridorStatus {
  source: "live" | "estimated";
  sampleCount: number;
}

const LEVEL_LABELS: Record<TrafficLevel, string> = {
  free: "Free flowing",
  moderate: "Moderate",
  heavy: "Heavy",
  severe: "Severe jam",
};

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Closest Nairobi corridor to a coordinate, or null when the driver is off-corridor. */
export function nearestCorridor(lat: number, lng: number): Corridor | null {
  let best: Corridor | null = null;
  let bestKm = Infinity;
  for (const c of CORRIDORS) {
    const km = haversineKm(lat, lng, c.lat, c.lng);
    if (km < bestKm) {
      bestKm = km;
      best = c;
    }
  }
  return bestKm <= MAX_MATCH_KM ? best : null;
}

function sessionId() {
  const key = "wayfinder_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/** Contributes one anonymous speed reading for the corridor the driver is on. */
export async function recordSpeedSample(lat: number, lng: number, speedKmh: number) {
  if (!Number.isFinite(speedKmh) || speedKmh < 0 || speedKmh > 200) return;
  const corridor = nearestCorridor(lat, lng);
  if (!corridor) return;
  await supabase.from("corridor_speed_samples").insert({
    corridor_slug: corridor.slug,
    speed_kmh: speedKmh,
    lat,
    lng,
    session_id: sessionId(),
  });
}

/** Averages the last 30 minutes of community speed readings per corridor. */
export async function fetchLiveReadings(): Promise<LiveReadings> {
  const since = new Date(Date.now() - SAMPLE_WINDOW_MINUTES * 60000).toISOString();
  const { data, error } = await supabase
    .from("corridor_speed_samples")
    .select("corridor_slug, speed_kmh, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error || !data) return {};

  const grouped: Record<string, { total: number; count: number; last: string }> = {};
  for (const row of data) {
    const g = (grouped[row.corridor_slug] ??= { total: 0, count: 0, last: row.created_at });
    g.total += Number(row.speed_kmh);
    g.count += 1;
    if (row.created_at > g.last) g.last = row.created_at;
  }

  const readings: LiveReadings = {};
  for (const [slug, g] of Object.entries(grouped)) {
    if (g.count < MIN_SAMPLES_FOR_LIVE) continue;
    readings[slug] = {
      averageSpeed: Math.round(g.total / g.count),
      sampleCount: g.count,
      lastSeen: g.last,
    };
  }
  return readings;
}

/** Uses real driver speeds when enough exist, otherwise the rush-hour model. */
export function resolveStatus(
  corridor: Corridor,
  readings: LiveReadings,
  now: Date = new Date(),
): CorridorLiveStatus {
  const live = readings[corridor.slug];
  if (!live) {
    return { ...getCorridorStatus(corridor, now), source: "estimated", sampleCount: 0 };
  }

  const freeFlowSpeed = corridor.slug === "nairobi-expressway" ? 90 : 60;
  const averageSpeed = Math.max(5, live.averageSpeed);
  const travelMinutes = Math.round((corridor.lengthKm / averageSpeed) * 60);
  const freeMinutes = Math.round((corridor.lengthKm / freeFlowSpeed) * 60);
  const ratio = averageSpeed / freeFlowSpeed;

  const level: TrafficLevel =
    ratio > 0.75 ? "free" : ratio > 0.55 ? "moderate" : ratio > 0.3 ? "heavy" : "severe";

  return {
    level,
    label: LEVEL_LABELS[level],
    averageSpeed,
    travelMinutes,
    delayMinutes: Math.max(0, travelMinutes - freeMinutes),
    source: "live",
    sampleCount: live.sampleCount,
  };
}

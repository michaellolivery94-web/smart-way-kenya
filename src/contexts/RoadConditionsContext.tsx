import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type RoadConditionType = "murram" | "construction" | "pothole" | "flooded";

export interface RoadCondition {
  id: string;
  type: RoadConditionType;
  lat: number;
  lng: number;
  name: string;
  description: string;
  severity: "low" | "medium" | "high";
  reportedAt: Date;
  verified: boolean;
}

interface RoadConditionsContextType {
  conditions: RoadCondition[];
  activeAlert: RoadCondition | null;
  dismissAlert: () => void;
  checkProximity: (userLat: number, userLng: number) => void;
  reportCondition: (condition: Omit<RoadCondition, "id" | "reportedAt" | "verified">) => void;
}

// Sample road conditions data for Nairobi
const INITIAL_CONDITIONS: RoadCondition[] = [
  // Murram Roads
  {
    id: "murram-1",
    type: "murram",
    lat: -1.2450,
    lng: 36.8750,
    name: "Ruaka Road Section",
    description: "Unpaved murram section - 500m stretch, dusty conditions",
    severity: "medium",
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: "murram-2",
    type: "murram",
    lat: -1.3100,
    lng: 36.7500,
    name: "Ngong Forest Edge",
    description: "Murram road near forest entry - slow down advised",
    severity: "low",
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: "murram-3",
    type: "murram",
    lat: -1.2200,
    lng: 36.8900,
    name: "Kahawa West Access",
    description: "Rough murram - suitable for 4x4 vehicles only",
    severity: "high",
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: "murram-4",
    type: "murram",
    lat: -1.3350,
    lng: 36.7800,
    name: "Karen Plains Road",
    description: "Seasonal murram road - passable in dry weather",
    severity: "medium",
    reportedAt: new Date(),
    verified: true,
  },
  // Construction Zones
  {
    id: "construction-1",
    type: "construction",
    lat: -1.2750,
    lng: 36.8100,
    name: "Westlands Flyover Project",
    description: "Major construction - expect 15-20 min delays",
    severity: "high",
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: "construction-2",
    type: "construction",
    lat: -1.2980,
    lng: 36.7850,
    name: "Ngong Road Expansion",
    description: "Road widening in progress - single lane traffic",
    severity: "medium",
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: "construction-3",
    type: "construction",
    lat: -1.2600,
    lng: 36.8400,
    name: "Parklands Drainage Works",
    description: "Drainage installation - partial road closure",
    severity: "medium",
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: "construction-4",
    type: "construction",
    lat: -1.3050,
    lng: 36.8600,
    name: "Industrial Area Upgrade",
    description: "Road resurfacing - heavy machinery present",
    severity: "low",
    reportedAt: new Date(),
    verified: true,
  },
  // Potholes
  {
    id: "pothole-1",
    type: "pothole",
    lat: -1.2850,
    lng: 36.8250,
    name: "Kenyatta Avenue Section",
    description: "Multiple potholes - drive carefully",
    severity: "medium",
    reportedAt: new Date(),
    verified: true,
  },
  // Flooded sections (seasonal)
  {
    id: "flooded-1",
    type: "flooded",
    lat: -1.2700,
    lng: 36.8550,
    name: "Mathare Valley Crossing",
    description: "Floods during heavy rain - check conditions first",
    severity: "high",
    reportedAt: new Date(),
    verified: false,
  },
];

const RoadConditionsContext = createContext<RoadConditionsContextType | undefined>(undefined);

const ALERT_RADIUS_METERS = 500; // Alert when within 500m

function getDistanceFromLatLng(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const RoadConditionsProvider = ({ children }: { children: ReactNode }) => {
  const [conditions, setConditions] = useState<RoadCondition[]>(INITIAL_CONDITIONS);
  const [activeAlert, setActiveAlert] = useState<RoadCondition | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const dismissAlert = useCallback(() => {
    if (activeAlert) {
      setDismissedAlerts((prev) => new Set(prev).add(activeAlert.id));
      setActiveAlert(null);
    }
  }, [activeAlert]);

  const checkProximity = useCallback((userLat: number, userLng: number) => {
    // Find nearest condition that hasn't been dismissed
    let nearestCondition: RoadCondition | null = null;
    let nearestDistance = Infinity;

    for (const condition of conditions) {
      if (dismissedAlerts.has(condition.id)) continue;

      const distance = getDistanceFromLatLng(userLat, userLng, condition.lat, condition.lng);
      
      if (distance < ALERT_RADIUS_METERS && distance < nearestDistance) {
        nearestCondition = condition;
        nearestDistance = distance;
      }
    }

    if (nearestCondition && (!activeAlert || nearestCondition.id !== activeAlert.id)) {
      setActiveAlert(nearestCondition);
    }
  }, [conditions, dismissedAlerts, activeAlert]);

  const reportCondition = useCallback((condition: Omit<RoadCondition, "id" | "reportedAt" | "verified">) => {
    const newCondition: RoadCondition = {
      ...condition,
      id: `user-${Date.now()}`,
      reportedAt: new Date(),
      verified: false,
    };
    setConditions((prev) => [...prev, newCondition]);
  }, []);

  return (
    <RoadConditionsContext.Provider
      value={{ conditions, activeAlert, dismissAlert, checkProximity, reportCondition }}
    >
      {children}
    </RoadConditionsContext.Provider>
  );
};

export const useRoadConditions = () => {
  const context = useContext(RoadConditionsContext);
  if (!context) {
    throw new Error("useRoadConditions must be used within a RoadConditionsProvider");
  }
  return context;
};

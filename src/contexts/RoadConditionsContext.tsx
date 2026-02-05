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

export interface SpeedCamera {
  id: string;
  lat: number;
  lng: number;
  name: string;
  speedLimit: number; // km/h
  type: "fixed" | "mobile" | "average";
  direction?: string;
  active: boolean;
}

interface RoadConditionsContextType {
  conditions: RoadCondition[];
  cameras: SpeedCamera[];
  activeAlert: RoadCondition | null;
  activeCameraAlert: SpeedCamera | null;
  dismissAlert: () => void;
  dismissCameraAlert: () => void;
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

// Speed camera locations in Nairobi
const INITIAL_CAMERAS: SpeedCamera[] = [
  // Mombasa Road
  {
    id: "cam-1",
    lat: -1.3150,
    lng: 36.8500,
    name: "Mombasa Road - Nyayo Stadium",
    speedLimit: 50,
    type: "fixed",
    direction: "Both directions",
    active: true,
  },
  {
    id: "cam-2",
    lat: -1.3080,
    lng: 36.8400,
    name: "Mombasa Road - Bellevue",
    speedLimit: 50,
    type: "fixed",
    direction: "City-bound",
    active: true,
  },
  // Uhuru Highway
  {
    id: "cam-3",
    lat: -1.2920,
    lng: 36.8200,
    name: "Uhuru Highway - Nyayo House",
    speedLimit: 50,
    type: "fixed",
    direction: "Both directions",
    active: true,
  },
  {
    id: "cam-4",
    lat: -1.2850,
    lng: 36.8150,
    name: "Uhuru Highway - Kenyatta Ave",
    speedLimit: 50,
    type: "fixed",
    direction: "Westlands-bound",
    active: true,
  },
  // Thika Road
  {
    id: "cam-5",
    lat: -1.2400,
    lng: 36.8600,
    name: "Thika Road - Muthaiga",
    speedLimit: 80,
    type: "fixed",
    direction: "Both directions",
    active: true,
  },
  {
    id: "cam-6",
    lat: -1.2200,
    lng: 36.8750,
    name: "Thika Road - Kasarani",
    speedLimit: 80,
    type: "average",
    direction: "City-bound",
    active: true,
  },
  {
    id: "cam-7",
    lat: -1.2050,
    lng: 36.8850,
    name: "Thika Road - Roysambu",
    speedLimit: 80,
    type: "fixed",
    direction: "Both directions",
    active: true,
  },
  // Waiyaki Way
  {
    id: "cam-8",
    lat: -1.2650,
    lng: 36.8000,
    name: "Waiyaki Way - Westlands",
    speedLimit: 50,
    type: "fixed",
    direction: "City-bound",
    active: true,
  },
  {
    id: "cam-9",
    lat: -1.2580,
    lng: 36.7850,
    name: "Waiyaki Way - ABC Place",
    speedLimit: 50,
    type: "mobile",
    direction: "Variable",
    active: true,
  },
  // Ngong Road
  {
    id: "cam-10",
    lat: -1.2970,
    lng: 36.7950,
    name: "Ngong Road - Prestige Plaza",
    speedLimit: 50,
    type: "fixed",
    direction: "Both directions",
    active: true,
  },
  {
    id: "cam-11",
    lat: -1.3050,
    lng: 36.7800,
    name: "Ngong Road - Junction Mall",
    speedLimit: 50,
    type: "fixed",
    direction: "Karen-bound",
    active: true,
  },
  // Langata Road
  {
    id: "cam-12",
    lat: -1.3100,
    lng: 36.8050,
    name: "Langata Road - Carnivore",
    speedLimit: 50,
    type: "fixed",
    direction: "Both directions",
    active: true,
  },
  // Nairobi Expressway
  {
    id: "cam-13",
    lat: -1.3000,
    lng: 36.8300,
    name: "Expressway - Haile Selassie",
    speedLimit: 100,
    type: "average",
    direction: "Both directions",
    active: true,
  },
  {
    id: "cam-14",
    lat: -1.2750,
    lng: 36.7950,
    name: "Expressway - Westlands Exit",
    speedLimit: 80,
    type: "fixed",
    direction: "Exit ramp",
    active: true,
  },
  // Outer Ring Road
  {
    id: "cam-15",
    lat: -1.2550,
    lng: 36.8700,
    name: "Outer Ring - Allsops",
    speedLimit: 50,
    type: "mobile",
    direction: "Variable",
    active: true,
  },
];

const RoadConditionsContext = createContext<RoadConditionsContextType | undefined>(undefined);

const ALERT_RADIUS_METERS = 500; // Alert when within 500m
const CAMERA_ALERT_RADIUS_METERS = 300; // Camera alert at 300m

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
  const [cameras] = useState<SpeedCamera[]>(INITIAL_CAMERAS);
  const [activeAlert, setActiveAlert] = useState<RoadCondition | null>(null);
  const [activeCameraAlert, setActiveCameraAlert] = useState<SpeedCamera | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [dismissedCameraAlerts, setDismissedCameraAlerts] = useState<Set<string>>(new Set());

  const dismissAlert = useCallback(() => {
    if (activeAlert) {
      setDismissedAlerts((prev) => new Set(prev).add(activeAlert.id));
      setActiveAlert(null);
    }
  }, [activeAlert]);

  const dismissCameraAlert = useCallback(() => {
    if (activeCameraAlert) {
      setDismissedCameraAlerts((prev) => new Set(prev).add(activeCameraAlert.id));
      setActiveCameraAlert(null);
    }
  }, [activeCameraAlert]);

  const checkProximity = useCallback((userLat: number, userLng: number) => {
    // Check road conditions
    let nearestCondition: RoadCondition | null = null;
    let nearestConditionDistance = Infinity;

    for (const condition of conditions) {
      if (dismissedAlerts.has(condition.id)) continue;

      const distance = getDistanceFromLatLng(userLat, userLng, condition.lat, condition.lng);
      
      if (distance < ALERT_RADIUS_METERS && distance < nearestConditionDistance) {
        nearestCondition = condition;
        nearestConditionDistance = distance;
      }
    }

    if (nearestCondition && (!activeAlert || nearestCondition.id !== activeAlert.id)) {
      setActiveAlert(nearestCondition);
    }

    // Check speed cameras
    let nearestCamera: SpeedCamera | null = null;
    let nearestCameraDistance = Infinity;

    for (const camera of cameras) {
      if (dismissedCameraAlerts.has(camera.id) || !camera.active) continue;

      const distance = getDistanceFromLatLng(userLat, userLng, camera.lat, camera.lng);
      
      if (distance < CAMERA_ALERT_RADIUS_METERS && distance < nearestCameraDistance) {
        nearestCamera = camera;
        nearestCameraDistance = distance;
      }
    }

    if (nearestCamera && (!activeCameraAlert || nearestCamera.id !== activeCameraAlert.id)) {
      setActiveCameraAlert(nearestCamera);
    }
  }, [conditions, cameras, dismissedAlerts, dismissedCameraAlerts, activeAlert, activeCameraAlert]);

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
      value={{ 
        conditions, 
        cameras,
        activeAlert, 
        activeCameraAlert,
        dismissAlert, 
        dismissCameraAlert,
        checkProximity, 
        reportCondition 
      }}
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

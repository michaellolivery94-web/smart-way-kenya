export interface Corridor {
  slug: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  zoom: number;
  from: string;
  to: string;
  lengthKm: number;
  description: string;
  landmarks: string[];
  /** Hours (0-23, Nairobi time) that typically jam on this corridor */
  peakHours: number[];
  baseCongestion: number; // 0-1 baseline outside peaks
}

export const CORRIDORS: Corridor[] = [
  {
    slug: "mombasa-road",
    name: "Mombasa Road",
    shortName: "Mombasa Rd",
    lat: -1.3227,
    lng: 36.8535,
    zoom: 13,
    from: "Nyayo Stadium Roundabout",
    to: "Jomo Kenyatta International Airport",
    lengthKm: 15,
    description:
      "The main southern artery linking the CBD to JKIA, Syokimau and the Athi River corridor. Runs beside the Nairobi Expressway for most of its length, so surface traffic spikes whenever the toll road backs up at Mlolongo.",
    landmarks: ["Nyayo Stadium", "Bellevue", "Cabanas", "General Motors", "JKIA Turnoff"],
    peakHours: [6, 7, 8, 16, 17, 18, 19],
    baseCongestion: 0.45,
  },
  {
    slug: "thika-road",
    name: "Thika Superhighway",
    shortName: "Thika Rd",
    lat: -1.2299,
    lng: 36.8756,
    zoom: 12,
    from: "Museum Hill Interchange",
    to: "Ruiru / Thika",
    lengthKm: 25,
    description:
      "Eight-lane superhighway serving Kasarani, Roysambu, Githurai and Ruiru. Free-flowing off-peak, but service lanes and the Roysambu underpass are the usual choke points during evening rush.",
    landmarks: ["Museum Hill", "Pangani", "Muthaiga", "Allsops", "Roysambu", "Kasarani"],
    peakHours: [6, 7, 8, 17, 18, 19, 20],
    baseCongestion: 0.3,
  },
  {
    slug: "waiyaki-way",
    name: "Waiyaki Way",
    shortName: "Waiyaki Way",
    lat: -1.2648,
    lng: 36.7907,
    zoom: 13,
    from: "Westlands Roundabout",
    to: "Kikuyu / Naivasha Road",
    lengthKm: 12,
    description:
      "The western gateway through Westlands, ABC Place, Kangemi and Uthiru. Heavy morning inbound flow from Kikuyu and Kinoo, with the Westlands junction and James Gichuru roundabout dictating overall speed.",
    landmarks: ["Westlands", "Safaricom House", "ABC Place", "Kangemi", "Uthiru"],
    peakHours: [6, 7, 8, 9, 16, 17, 18, 19],
    baseCongestion: 0.5,
  },
  {
    slug: "ngong-road",
    name: "Ngong Road",
    shortName: "Ngong Rd",
    lat: -1.3006,
    lng: 36.7838,
    zoom: 13,
    from: "Kenyatta National Hospital",
    to: "Karen / Ngong Town",
    lengthKm: 11,
    description:
      "Dual carriageway serving Kilimani, Adams Arcade, Junction Mall and Karen. Popular with commuters avoiding Uhuru Highway, so it absorbs overflow traffic whenever the CBD is jammed.",
    landmarks: ["KNH", "Kilimani", "Prestige Plaza", "Adams Arcade", "Junction Mall", "Karen"],
    peakHours: [7, 8, 17, 18, 19],
    baseCongestion: 0.4,
  },
  {
    slug: "jogoo-road",
    name: "Jogoo Road",
    shortName: "Jogoo Rd",
    lat: -1.2882,
    lng: 36.8544,
    zoom: 13,
    from: "Muthurwa / Landhies Road",
    to: "Donholm / Outer Ring Junction",
    lengthKm: 8,
    description:
      "The eastlands lifeline connecting the CBD to Buruburu, Umoja and Donholm. Dense matatu and boda activity around Muthurwa and City Stadium means stop-start traffic even outside rush hours.",
    landmarks: ["Muthurwa", "City Stadium", "Makadara", "Buruburu", "Donholm"],
    peakHours: [6, 7, 8, 16, 17, 18, 19],
    baseCongestion: 0.55,
  },
  {
    slug: "outer-ring-road",
    name: "Outer Ring Road",
    shortName: "Outer Ring",
    lat: -1.2568,
    lng: 36.8874,
    zoom: 13,
    from: "Taj Mall / Airport North Road",
    to: "Thika Road (Allsops)",
    lengthKm: 13,
    description:
      "Orbital route linking Eastlands estates to Thika Road without entering the CBD. Interchanges at Allsops, Kangundo Road and Taj Mall carry most of the load, with heavy freight in the Industrial Area direction.",
    landmarks: ["Taj Mall", "Donholm", "Kangundo Road", "Allsops", "Roasters"],
    peakHours: [6, 7, 8, 17, 18, 19],
    baseCongestion: 0.42,
  },
  {
    slug: "nairobi-expressway",
    name: "Nairobi Expressway",
    shortName: "Expressway",
    lat: -1.3049,
    lng: 36.8298,
    zoom: 13,
    from: "Mlolongo Toll Station",
    to: "James Gichuru Road",
    lengthKm: 27,
    description:
      "Elevated toll road running above Mombasa Road and Uhuru Highway. Typically the fastest way across the city, though the Westlands and Haile Selassie exit ramps queue during peak periods.",
    landmarks: ["Mlolongo", "JKIA", "Haile Selassie Exit", "Museum Hill", "Westlands Exit"],
    peakHours: [7, 8, 17, 18],
    baseCongestion: 0.2,
  },
  {
    slug: "uhuru-highway",
    name: "Uhuru Highway",
    shortName: "Uhuru Hwy",
    lat: -1.2938,
    lng: 36.8207,
    zoom: 14,
    from: "Nyayo Stadium Roundabout",
    to: "Museum Hill Interchange",
    lengthKm: 6,
    description:
      "The CBD spine and the busiest stretch in Nairobi, including the Haile Selassie Interchange flyover. Every major corridor eventually feeds into it, so congestion here ripples across the whole city.",
    landmarks: [
      "Nyayo Stadium",
      "Haile Selassie Interchange (Uhuru Highway Flyover)",
      "Kenyatta Avenue",
      "University Way",
      "Museum Hill",
    ],
    peakHours: [7, 8, 9, 16, 17, 18, 19],
    baseCongestion: 0.6,
  },
];

export type TrafficLevel = "free" | "moderate" | "heavy" | "severe";

export interface CorridorStatus {
  level: TrafficLevel;
  label: string;
  averageSpeed: number; // km/h
  delayMinutes: number;
  travelMinutes: number;
}

const LEVEL_LABELS: Record<TrafficLevel, string> = {
  free: "Free flowing",
  moderate: "Moderate",
  heavy: "Heavy",
  severe: "Severe jam",
};

/**
 * Derives a live-feel status for a corridor from Nairobi local time,
 * the corridor's peak profile and its baseline congestion.
 */
export function getCorridorStatus(corridor: Corridor, now: Date = new Date()): CorridorStatus {
  // Nairobi is UTC+3
  const nairobi = new Date(now.getTime() + (3 * 60 + now.getTimezoneOffset()) * 60000);
  const hour = nairobi.getHours();
  const day = nairobi.getDay();
  const isWeekend = day === 0 || day === 6;

  let congestion = corridor.baseCongestion;
  if (corridor.peakHours.includes(hour)) congestion += 0.35;
  if (isWeekend) congestion -= 0.25;
  if (hour >= 22 || hour <= 5) congestion -= 0.35;
  congestion = Math.max(0.05, Math.min(0.95, congestion));

  const freeFlowSpeed = corridor.slug === "nairobi-expressway" ? 90 : 60;
  const averageSpeed = Math.max(8, Math.round(freeFlowSpeed * (1 - congestion * 0.85)));
  const travelMinutes = Math.round((corridor.lengthKm / averageSpeed) * 60);
  const freeMinutes = Math.round((corridor.lengthKm / freeFlowSpeed) * 60);

  const level: TrafficLevel =
    congestion < 0.3 ? "free" : congestion < 0.5 ? "moderate" : congestion < 0.72 ? "heavy" : "severe";

  return {
    level,
    label: LEVEL_LABELS[level],
    averageSpeed,
    delayMinutes: Math.max(0, travelMinutes - freeMinutes),
    travelMinutes,
  };
}

export const LEVEL_CLASSES: Record<TrafficLevel, { dot: string; text: string; bg: string }> = {
  free: { dot: "bg-success", text: "text-success", bg: "bg-success/10 border-success/30" },
  moderate: { dot: "bg-warning", text: "text-warning", bg: "bg-warning/10 border-warning/30" },
  heavy: { dot: "bg-orange-500", text: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
  severe: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

export function getCorridor(slug?: string) {
  return CORRIDORS.find((c) => c.slug === slug);
}

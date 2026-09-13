import type { Corridor } from "@/data/corridors";
import type { CorridorLiveStatus } from "@/lib/liveTraffic";

export type NavMode = "commuter" | "pro";

export interface ModeIndicator {
  mode: NavMode;
  title: string;
  /** Short verdict shown as the indicator headline */
  verdict: string;
  /** One-line routing guidance tuned to the mode */
  guidance: string;
  /** Two compact metrics the mode cares about */
  metrics: { label: string; value: string }[];
  /** Colour intent for the indicator, mapped to semantic tokens by the UI */
  tone: "good" | "watch" | "bad";
}

const FUEL_PRICE_PER_LITRE = 195; // Ksh, Nairobi
const LITRES_PER_KM = 0.1;
/** Pro drivers price their time: rough Nairobi ride-hail earnings per minute */
const PRO_EARNINGS_PER_MIN = 9; // Ksh

const toneFor = (level: CorridorLiveStatus["level"]): ModeIndicator["tone"] =>
  level === "free" ? "good" : level === "moderate" ? "watch" : "bad";

function fuelCost(corridor: Corridor, status: CorridorLiveStatus) {
  // Stop-start traffic burns more per km
  const penalty = status.level === "severe" ? 1.35 : status.level === "heavy" ? 1.2 : 1;
  return Math.round(corridor.lengthKm * LITRES_PER_KM * FUEL_PRICE_PER_LITRE * penalty);
}

/**
 * Commuter Mode keeps it calm and simple: one clear call on whether to drive now.
 * Pro Driver Mode exposes the numbers a working driver optimises against.
 */
export function getModeIndicator(
  corridor: Corridor,
  status: CorridorLiveStatus,
  mode: NavMode,
): ModeIndicator {
  const tone = toneFor(status.level);
  const cost = fuelCost(corridor, status);
  const chokePoint = corridor.landmarks[Math.floor(corridor.landmarks.length / 2)] ?? corridor.to;

  if (mode === "commuter") {
    const verdict =
      status.level === "free"
        ? "Good to go"
        : status.level === "moderate"
          ? "Slightly slow"
          : status.level === "heavy"
            ? "Expect delays"
            : "Avoid for now";

    const guidance =
      status.level === "free"
        ? `Clear run on ${corridor.shortName}. Smart-Way will keep you on the main road.`
        : status.level === "moderate"
          ? `Still the easiest route. Expect a slow patch around ${chokePoint}.`
          : status.level === "heavy"
            ? `Leaving in about 30 minutes should save you time, or take the quieter side route.`
            : `Heavy jam. Wait it out or let Smart-Way route you around ${chokePoint}.`;

    return {
      mode,
      title: "Commuter Mode",
      verdict,
      guidance,
      metrics: [
        { label: "Arrive in", value: `${status.travelMinutes} min` },
        { label: "Fuel", value: `Ksh ${cost}` },
      ],
      tone,
    };
  }

  const timeCost = Math.round(status.delayMinutes * PRO_EARNINGS_PER_MIN);
  const verdict =
    status.level === "free"
      ? "High yield"
      : status.level === "moderate"
        ? "Workable"
        : status.level === "heavy"
          ? "Low yield"
          : "Deadhead risk";

  const guidance =
    status.level === "free"
      ? `Run ${corridor.shortName} end to end — ${status.averageSpeed} km/h holds, no detour needed.`
      : status.level === "moderate"
        ? `Hold the outer lane through ${chokePoint}; detour only if delay passes 10 min.`
        : status.level === "heavy"
          ? `Cut off before ${chokePoint} and rejoin later — the delay is costing more than the extra km.`
          : `Reroute now. Queue past ${chokePoint} wipes out the trip margin.`;

  return {
    mode,
    title: "Pro Driver Mode",
    verdict,
    guidance,
    metrics: [
      { label: "Delay cost", value: `Ksh ${timeCost}` },
      { label: "Fuel + time", value: `Ksh ${cost + timeCost}` },
    ],
    tone,
  };
}

export function getBothIndicators(corridor: Corridor, status: CorridorLiveStatus) {
  return [
    getModeIndicator(corridor, status, "commuter"),
    getModeIndicator(corridor, status, "pro"),
  ];
}

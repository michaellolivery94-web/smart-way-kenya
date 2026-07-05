import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function humanize(step: {
  name?: string;
  distance: number;
  maneuver?: { type?: string; modifier?: string; exit?: number };
}): string {
  const road = step.name?.trim();
  const type = step.maneuver?.type ?? "continue";
  const modifier = step.maneuver?.modifier;
  const dist = formatDistance(step.distance);

  const onRoad = road ? ` onto ${road}` : "";
  const along = road ? ` along ${road}` : "";

  switch (type) {
    case "depart":
      return `Head out${along} for ${dist}.`;
    case "arrive":
      return `Arrive at your destination${road ? ` on ${road}` : ""}.`;
    case "turn":
      return `Turn ${modifier ?? ""}${onRoad}, continue for ${dist}.`.replace(/\s+/g, " ");
    case "merge":
      return `Merge ${modifier ?? ""}${onRoad}, continue for ${dist}.`.replace(/\s+/g, " ");
    case "on ramp":
      return `Take the on-ramp${onRoad}, continue for ${dist}.`;
    case "off ramp":
      return `Take the off-ramp${onRoad}, continue for ${dist}.`;
    case "fork":
      return `Keep ${modifier ?? "straight"}${onRoad}, continue for ${dist}.`;
    case "roundabout":
    case "rotary": {
      const exit = step.maneuver?.exit ? `, take exit ${step.maneuver.exit}` : "";
      return `Enter the roundabout${exit}${onRoad}, continue for ${dist}.`;
    }
    case "continue":
      return `Continue ${modifier ?? "straight"}${along} for ${dist}.`;
    case "new name":
      return `Continue${along} for ${dist}.`;
    default:
      return `${type[0].toUpperCase()}${type.slice(1)}${modifier ? ` ${modifier}` : ""}${onRoad || along} for ${dist}.`;
  }
}

export default defineTool({
  name: "get_turn_by_turn",
  title: "Turn-by-turn directions",
  description:
    "Get human-readable turn-by-turn driving directions between two coordinates in/around Nairobi. Returns an ordered list of instructions (e.g. 'Turn right onto Uhuru Highway, continue for 1.2 km'), plus total distance and duration. Use search_place first if you only have place names.",
  inputSchema: {
    originLat: z.number().describe("Origin latitude."),
    originLng: z.number().describe("Origin longitude."),
    destinationLat: z.number().describe("Destination latitude."),
    destinationLng: z.number().describe("Destination longitude."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ originLat, originLng, destinationLat, destinationLng }) => {
    const coords = `${originLng},${originLat};${destinationLng},${destinationLat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false&steps=true`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `OSRM error: ${res.status}` }], isError: true };
    }
    const data = (await res.json()) as {
      routes?: Array<{
        distance: number;
        duration: number;
        legs: Array<{
          steps: Array<{
            name?: string;
            distance: number;
            duration: number;
            maneuver?: { type?: string; modifier?: string; exit?: number };
          }>;
        }>;
      }>;
    };
    const route = data.routes?.[0];
    if (!route) {
      return { content: [{ type: "text", text: "No route found." }], isError: true };
    }

    const rawSteps = route.legs.flatMap((l) => l.steps);
    const steps = rawSteps.map((s, i) => ({
      step: i + 1,
      instruction: humanize(s),
      road: s.name || null,
      maneuver: s.maneuver?.type ?? "continue",
      modifier: s.maneuver?.modifier ?? null,
      distanceMeters: s.distance,
      durationSeconds: s.duration,
    }));

    const totalKm = +(route.distance / 1000).toFixed(2);
    const totalMin = +(route.duration / 60).toFixed(1);

    const text =
      `Route: ${totalKm} km, ~${totalMin} min\n\n` +
      steps.map((s) => `${s.step}. ${s.instruction}`).join("\n");

    return {
      content: [{ type: "text", text }],
      structuredContent: {
        totalDistanceKm: totalKm,
        totalDurationMinutes: totalMin,
        steps,
      },
    };
  },
});

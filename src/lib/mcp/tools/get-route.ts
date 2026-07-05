import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_route",
  title: "Get driving route",
  description:
    "Compute a driving route between two coordinates in/around Nairobi using OSRM. Returns distance (meters), duration (seconds), and turn-by-turn steps.",
  inputSchema: {
    originLat: z.number().describe("Origin latitude."),
    originLng: z.number().describe("Origin longitude."),
    destinationLat: z.number().describe("Destination latitude."),
    destinationLng: z.number().describe("Destination longitude."),
    alternatives: z.boolean().optional().describe("Include alternative routes (up to 3). Default false."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ originLat, originLng, destinationLat, destinationLng, alternatives }) => {
    const coords = `${originLng},${originLat};${destinationLng},${destinationLat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false&steps=true&alternatives=${alternatives ? "true" : "false"}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `OSRM error: ${res.status}` }], isError: true };
    }
    const data = (await res.json()) as {
      routes?: Array<{
        distance: number;
        duration: number;
        legs: Array<{ steps: Array<{ name?: string; distance: number; duration: number; maneuver?: { type?: string; modifier?: string } }> }>;
      }>;
    };
    if (!data.routes?.length) {
      return { content: [{ type: "text", text: "No route found." }], isError: true };
    }
    const routes = data.routes.map((r) => ({
      distanceMeters: r.distance,
      distanceKm: +(r.distance / 1000).toFixed(2),
      durationSeconds: r.duration,
      durationMinutes: +(r.duration / 60).toFixed(1),
      steps: r.legs.flatMap((l) => l.steps).map((s) => ({
        road: s.name || "",
        distance: s.distance,
        duration: s.duration,
        maneuver: s.maneuver?.type,
        modifier: s.maneuver?.modifier,
      })),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(routes, null, 2) }],
      structuredContent: { routes },
    };
  },
});

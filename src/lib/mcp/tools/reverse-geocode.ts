import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "reverse_geocode",
  title: "Reverse geocode",
  description: "Convert latitude/longitude coordinates into a human-readable Nairobi/Kenya address or place name.",
  inputSchema: {
    lat: z.number().describe("Latitude."),
    lng: z.number().describe("Longitude."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ lat, lng }) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "wayfinder-africa-mcp/0.1 (nairobi navigation)" },
    });
    if (!res.ok) {
      return { content: [{ type: "text", text: `Nominatim error: ${res.status}` }], isError: true };
    }
    const data = (await res.json()) as { display_name?: string; address?: Record<string, string> };
    return {
      content: [{ type: "text", text: data.display_name ?? "Unknown location" }],
      structuredContent: { name: data.display_name, address: data.address, lat, lng },
    };
  },
});

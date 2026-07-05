import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Nairobi viewbox (west, north, east, south)
const NAIROBI_VIEWBOX = "36.6509,-1.1638,37.1035,-1.4442";

export default defineTool({
  name: "search_place",
  title: "Search Nairobi place",
  description:
    "Search for a place, address, or landmark in Nairobi, Kenya. Returns matching locations with coordinates. Use this to resolve a place name to lat/lng.",
  inputSchema: {
    query: z.string().min(1).describe("Place name, address, or landmark in Nairobi (e.g. 'Westgate Mall', 'JKIA')."),
    limit: z.number().int().min(1).max(10).optional().describe("Max results, default 5."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("viewbox", NAIROBI_VIEWBOX);
    url.searchParams.set("bounded", "1");
    url.searchParams.set("limit", String(limit ?? 5));
    url.searchParams.set("countrycodes", "ke");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "wayfinder-africa-mcp/0.1 (nairobi navigation)" },
    });
    if (!res.ok) {
      return { content: [{ type: "text", text: `Nominatim error: ${res.status}` }], isError: true };
    }
    const raw = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      type?: string;
    }>;
    const results = raw.map((r) => ({
      name: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      type: r.type,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { results },
    };
  },
});

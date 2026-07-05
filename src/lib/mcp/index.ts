import { defineMcp } from "@lovable.dev/mcp-js";
import searchPlaceTool from "./tools/search-place";
import getRouteTool from "./tools/get-route";
import getTurnByTurnTool from "./tools/get-turn-by-turn";
import estimateFuelCostTool from "./tools/estimate-fuel-cost";
import reverseGeocodeTool from "./tools/reverse-geocode";

export default defineMcp({
  name: "wayfinder-africa-mcp",
  title: "Wayfinder Africa",
  version: "0.2.0",
  instructions:
    "Nairobi-focused navigation tools: search Kenyan places (search_place), compute driving routes with OSRM (get_route), get human-readable turn-by-turn directions (get_turn_by_turn), reverse-geocode coordinates (reverse_geocode), and estimate fuel costs in Ksh (estimate_fuel_cost). Use search_place first to turn a place name into coordinates, then pass those to get_turn_by_turn or get_route.",
  tools: [searchPlaceTool, getRouteTool, getTurnByTurnTool, reverseGeocodeTool, estimateFuelCostTool],
});

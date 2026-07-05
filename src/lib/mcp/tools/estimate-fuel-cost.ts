import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const FUEL_PRICE_KSH_PER_L = 195;
const CONSUMPTION_L_PER_KM = 0.1;

export default defineTool({
  name: "estimate_fuel_cost",
  title: "Estimate fuel cost",
  description:
    "Estimate fuel cost in Kenyan Shillings (Ksh) for a given driving distance in kilometers, using Nairobi average fuel price and consumption (~10 km/L, Ksh 195/L).",
  inputSchema: {
    distanceKm: z.number().positive().describe("Trip distance in kilometers."),
    consumptionLPer100Km: z
      .number()
      .positive()
      .optional()
      .describe("Optional vehicle consumption in L/100km. Defaults to 10 L/100km."),
    fuelPriceKshPerL: z
      .number()
      .positive()
      .optional()
      .describe("Optional fuel price in Ksh per litre. Defaults to 195."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ distanceKm, consumptionLPer100Km, fuelPriceKshPerL }) => {
    const consumption = consumptionLPer100Km ? consumptionLPer100Km / 100 : CONSUMPTION_L_PER_KM;
    const price = fuelPriceKshPerL ?? FUEL_PRICE_KSH_PER_L;
    const litres = +(distanceKm * consumption).toFixed(2);
    const costKsh = Math.round(litres * price);
    return {
      content: [
        {
          type: "text",
          text: `Estimated ${litres} L, ~Ksh ${costKsh} for ${distanceKm} km at Ksh ${price}/L.`,
        },
      ],
      structuredContent: { distanceKm, litres, costKsh, fuelPriceKshPerL: price },
    };
  },
});

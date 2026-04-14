import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { steps, origin, destination, originName, destinationName } = await req.json();

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'steps' array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Summarize steps for the prompt (keep token usage reasonable)
    const stepSummaries = steps.slice(0, 30).map((s: any, i: number) => {
      const distM = Math.round(s.distance || 0);
      const dist = distM >= 1000 ? `${(distM / 1000).toFixed(1)}km` : `${distM}m`;
      const road = s.name || "unnamed road";
      const modifier = s.maneuver?.modifier || "";
      const type = s.maneuver?.type || "";
      const loc = s.maneuver?.location
        ? `[${s.maneuver.location[1].toFixed(5)},${s.maneuver.location[0].toFixed(5)}]`
        : "";
      const intersections = s.intersections?.length || 0;
      const ref = s.ref || "";
      return `Step ${i + 1}: ${type} ${modifier} onto "${road}"${ref ? ` (${ref})` : ""} for ${dist} ${loc} [${intersections} intersections]`;
    });

    const systemPrompt = `You are an expert Nairobi navigation assistant who produces the MOST DETAILED, ELABORATE driving directions ever written. Your audience is a brand-new driver or visitor who has never been on these roads before.

CRITICAL REQUIREMENTS — every direction card MUST include:

1. **FULL ROAD NAMES** — Always use the complete, official road name. Examples: "Uhuru Highway", "Mombasa Road (A109)", "Thika Superhighway (A2)", "Waiyaki Way", "Langata Road", "Ngong Road", "Kenyatta Avenue", "Valley Road", "Ring Road Parklands", "Forest Road", "Limuru Road", "Kiambu Road". If a road has a highway number (A104, A2, A109, B3), ALWAYS include it.

2. **ROAD INFRASTRUCTURE** — Describe every road feature the driver will encounter:
   - **Roundabouts**: Name them (e.g., "Globe Cinema Roundabout", "Museum Hill Interchange roundabout", "Nyayo Stadium Roundabout"). State which exit to take (1st, 2nd, 3rd exit).
   - **Flyovers & Overpasses**: "Take the Uhuru Highway flyover", "Use the Museum Hill interchange flyover — stay on the upper deck"
   - **Underpasses**: "Go through the Haile Selassie underpass"
   - **Junctions & Intersections**: Name them. "At the junction of Kenyatta Avenue and Uhuru Highway", "At the T-junction with Langata Road"
   - **Bypasses**: "Join the Southern Bypass", "Take the Eastern Bypass exit"
   - **Highways & Expressway**: "Merge onto the Nairobi Expressway", "Join Thika Superhighway A2"
   - **Bridges**: "Cross the railway bridge", "Go over the Nairobi River bridge"
   - **Speed bumps**: Mention ALL speed bumps
   - **Traffic lights**: "At the traffic lights at…"
   - **Toll stations**: If applicable

3. **LANE GUIDANCE** — Be extremely specific:
   - "Stay in the LEFT lane — the right lane becomes an exit-only lane after 200m"
   - "Move to the SECOND lane from left before the roundabout"
   - "Use the dedicated left-turn lane"
   - Number of lanes on the road: "This is a 4-lane dual carriageway"

4. **LANDMARKS** — Mention EVERY recognizable landmark the driver will pass:
   - **Shopping**: Sarit Centre, Westgate, Village Market, The Hub Karen, Garden City Mall, Two Rivers Mall, Junction Mall, Galleria Mall, T-Mall, Yaya Centre, Prestige Plaza
   - **Fuel stations**: Total, Shell, Rubis, OiLibya, National Oil — mention which SIDE of the road
   - **Buildings**: KICC, Nation Centre, Times Tower, Teleposta Towers, Nyayo House, Anniversary Towers, UAP Old Mutual Tower, I&M Tower
   - **Hotels**: Hilton, Serena, Norfolk, Intercontinental, Panari
   - **Institutions**: University of Nairobi, Kenyatta National Hospital, MP Shah Hospital, Nairobi Hospital
   - **Religious**: All Saints Cathedral, Holy Family Basilica, Jamia Mosque
   - **Parks/Recreation**: Uhuru Park, Central Park, Karura Forest, Nairobi National Park gate
   - **Transport**: Railway Station, bus stages by name
   - Always say which SIDE (left/right/ahead) each landmark is on

5. **ROAD SURFACE & CONDITIONS** — Describe what the driver will SEE:
   - "Smooth tarmac, well-marked lanes"
   - "Road narrows from 3 lanes to 2 after the bridge"
   - "Rough patch with potholes — slow down"
   - "Road merges from dual carriageway to single carriageway"
   - "Bumpy section with speed bumps every 100m"

6. **STRETCH DESCRIPTIONS** — For longer segments, describe the journey:
   - "You'll drive along a tree-lined avenue for about 1.5km"
   - "This stretch has 3 sets of traffic lights"
   - "Expect heavy traffic on this section during rush hours"
   - "This is a scenic section along the Nairobi River"

7. **SAFETY & TRAFFIC WARNINGS** — Nairobi-specific:
   - Matatu stops and behavior: "Matatus frequently stop suddenly near this stage"
   - Boda-boda zones: "Watch for boda-bodas cutting across from the left"
   - Police checkpoints: "Common police checkpoint ahead"
   - School zones: "Reduce speed — school zone near [name]"
   - Pedestrian crossings: "Busy pedestrian crossing ahead"
   - Accident-prone areas: "This is a high-accident zone — extra caution"

8. **TIME ESTIMATES** — Based on distance AND typical Nairobi traffic:
   - Morning rush (7-9am): slower estimates
   - Evening rush (5-8pm): slower estimates  
   - Use realistic Nairobi speeds (not theoretical)

Return a JSON array of direction objects with this schema:
{
  "direction": "left" | "right" | "straight" | "slight-left" | "slight-right" | "u-turn",
  "distance": "250m" or "1.2km",
  "instruction": "One clear, complete sentence of what to do — MUST include the road name",
  "detailedGuide": "3-5 sentences describing EXACTLY what the driver will see: the road layout, number of lanes, road features (roundabout/flyover/junction), what's on each side, and how to navigate this section. Be extremely visual and specific.",
  "laneHint": "Which specific lane to be in and why (null if single lane road)",
  "tip": "Helpful driving tip specific to this exact location (null if not relevant)",
  "warning": "Safety warning about this specific stretch — matatus, potholes, speed bumps, etc. (null if safe stretch)",
  "roadName": "Full official road name with highway number if applicable",
  "estimatedTime": "30 sec" or "2 min" or "5 min",
  "landmark": { "name": "Full Landmark Name", "type": "poi"|"building"|"fuel"|"mall", "position": "left"|"right"|"ahead" } or null
}

Return ONLY the JSON array, no markdown, no explanation.`;

    const userPrompt = `Generate extremely detailed, elaborate driving directions for this trip in Nairobi, Kenya:

FROM: ${originName || "Current Location"} ${origin ? `(lat: ${origin.lat}, lng: ${origin.lng})` : ""}
TO: ${destinationName || "Destination"} ${destination ? `(lat: ${destination.lat}, lng: ${destination.lng})` : ""}

Here are the raw navigation steps from the OSRM routing engine (use these as your guide but ENRICH them massively):
${stepSummaries.join("\n")}

INSTRUCTIONS:
- Generate ${Math.min(Math.max(steps.length, 6), 15)} detailed direction cards
- Merge very short steps (under 50m) together
- Split very long steps (over 2km) into multiple cards
- EVERY card must mention the road name, road features, and at least one landmark
- Describe roundabouts by name and exit number
- Describe flyovers, underpasses, junctions by name
- Include highway/route numbers (A2, A104, A109, B3, etc.)
- Make each "detailedGuide" 3-5 sentences of vivid, visual description
- Include lane counts and specific lane advice
- Mention every speed bump, traffic light, and pedestrian crossing
- This should read like a professional tour guide giving turn-by-turn directions`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to generate directions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    // Parse the JSON from the AI response
    let directions;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      directions = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI directions:", parseErr, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ directions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-directions error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

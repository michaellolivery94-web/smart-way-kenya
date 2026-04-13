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
    const stepSummaries = steps.slice(0, 25).map((s: any, i: number) => {
      const distM = Math.round(s.distance || 0);
      const dist = distM >= 1000 ? `${(distM / 1000).toFixed(1)}km` : `${distM}m`;
      const road = s.name || "unnamed road";
      const modifier = s.maneuver?.modifier || "";
      const type = s.maneuver?.type || "";
      const loc = s.maneuver?.location
        ? `[${s.maneuver.location[1].toFixed(5)},${s.maneuver.location[0].toFixed(5)}]`
        : "";
      return `Step ${i + 1}: ${type} ${modifier} onto "${road}" for ${dist} ${loc}`;
    });

    const systemPrompt = `You are a Nairobi navigation assistant who gives extremely detailed, beginner-friendly driving directions. Your audience includes new drivers, visitors, and people who struggle with street names.

RULES:
- Write each direction as a rich JSON object (see schema below)
- Use Nairobi landmarks everyone knows: malls (Sarit Centre, Westgate, Village Market), petrol stations (Total, Shell, Rubis), buildings (KICC, Nation Centre), restaurants, schools, churches, mosques
- Describe what the driver will SEE: road surface, lane count, road dividers, overhead signs, roundabouts
- Give lane advice: which lane to be in and when to move over
- Include safety tips relevant to Nairobi: matatu behavior, boda-boda zones, speed bumps, police checkpoints
- Include warnings about tricky spots
- Keep language simple — imagine explaining to someone who just got their license yesterday
- Estimate time for each step based on distance and Nairobi traffic
- For the direction field, use ONLY these values: "straight", "slight-right", "slight-left", "right", "left", "u-turn"

Return a JSON array of direction objects with this schema:
{
  "direction": "left" | "right" | "straight" | "slight-left" | "slight-right" | "u-turn",
  "distance": "250m" or "1.2km",
  "instruction": "One clear sentence of what to do",
  "detailedGuide": "2-3 sentences describing exactly what the driver will see and how to navigate this part",
  "laneHint": "Which lane to be in (optional, null if not relevant)",
  "tip": "Helpful driving tip (optional, null if not relevant)",
  "warning": "Safety warning (optional, null if not relevant)",
  "roadName": "Name of the road",
  "estimatedTime": "30 sec" or "2 min",
  "landmark": { "name": "Landmark Name", "type": "poi"|"building"|"fuel"|"mall", "position": "left"|"right"|"ahead" } or null
}

Return ONLY the JSON array, no markdown, no explanation.`;

    const userPrompt = `Generate detailed driving directions for a trip in Nairobi:
FROM: ${originName || "Current Location"} ${origin ? `(${origin.lat}, ${origin.lng})` : ""}
TO: ${destinationName || "Destination"} ${destination ? `(${destination.lat}, ${destination.lng})` : ""}

Here are the raw navigation steps from the routing engine:
${stepSummaries.join("\n")}

Generate ${Math.min(steps.length, 12)} detailed direction cards. Merge very short steps together. Make every direction incredibly detailed and helpful for a nervous new driver in Nairobi.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
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

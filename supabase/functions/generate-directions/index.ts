import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OSRMStep {
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
    bearing_before: number;
    bearing_after: number;
  };
  name: string;
  distance: number;
  duration: number;
  driving_side: string;
  intersections?: Array<{
    lanes?: Array<{
      valid: boolean;
      indications: string[];
    }>;
  }>;
}

interface OSRMRoute {
  distance: number;
  duration: number;
  legs: Array<{
    steps: OSRMStep[];
    distance: number;
    duration: number;
  }>;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function mapManeuverToDirection(type: string, modifier?: string): string {
  if (type === "turn" || type === "new name" || type === "end of road") {
    if (modifier === "left") return "left";
    if (modifier === "right") return "right";
    if (modifier === "slight left") return "slight-left";
    if (modifier === "slight right") return "slight-right";
    if (modifier === "sharp left") return "left";
    if (modifier === "sharp right") return "right";
    if (modifier === "uturn") return "u-turn";
    return "straight";
  }
  if (type === "fork") {
    if (modifier?.includes("left")) return "slight-left";
    if (modifier?.includes("right")) return "slight-right";
    return "straight";
  }
  if (type === "roundabout" || type === "rotary") return "right";
  if (type === "merge") return modifier?.includes("left") ? "slight-left" : "slight-right";
  if (type === "depart" || type === "arrive") return "straight";
  return "straight";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originLat, originLng, destLat, destLng, originName, destName } = await req.json();

    if (!originLat || !originLng || !destLat || !destLng) {
      return new Response(JSON.stringify({ error: "Missing coordinates" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch route from OSRM
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&steps=true&annotations=true&geometries=geojson`;

    const osrmResp = await fetch(osrmUrl);
    if (!osrmResp.ok) {
      const errText = await osrmResp.text();
      console.error("OSRM error:", osrmResp.status, errText);
      return new Response(JSON.stringify({ error: "Could not calculate route" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const osrmData = await osrmResp.json();
    if (osrmData.code !== "Ok" || !osrmData.routes?.length) {
      return new Response(JSON.stringify({ error: "No route found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const route: OSRMRoute = osrmData.routes[0];
    const steps = route.legs[0].steps.filter(
      (s) => s.maneuver.type !== "depart" && s.maneuver.type !== "arrive" && s.distance > 20
    );

    // Build a compact summary for AI
    const stepsSummary = steps.map((s, i) => ({
      i: i + 1,
      type: s.maneuver.type,
      modifier: s.maneuver.modifier || "",
      road: s.name || "unnamed road",
      dist: formatDistance(s.distance),
      dur: formatDuration(s.duration),
      lanes: s.intersections?.[0]?.lanes?.map((l) => ({
        valid: l.valid,
        dir: l.indications.join("/"),
      })),
    }));

    const totalDist = formatDistance(route.distance);
    const totalDur = formatDuration(route.duration);
    const arrivalTime = new Date(Date.now() + route.duration * 1000).toLocaleTimeString("en-KE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // 2. Use AI to generate beginner-friendly directions
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Fallback: return basic directions without AI enrichment
      const basicDirections = steps.map((s, i) => ({
        direction: mapManeuverToDirection(s.maneuver.type, s.maneuver.modifier),
        distance: formatDistance(s.distance),
        instruction: `${s.maneuver.modifier ? s.maneuver.modifier.charAt(0).toUpperCase() + s.maneuver.modifier.slice(1) : "Continue"} onto ${s.name || "the road"}`,
        roadName: s.name || undefined,
        estimatedTime: formatDuration(s.duration),
      }));

      return new Response(JSON.stringify({
        directions: basicDirections,
        summary: { totalDistance: totalDist, totalDuration: totalDur, arrivalTime },
        routeGeometry: osrmData.routes[0].geometry,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiPrompt = `You are a Kenyan navigation assistant for Smart Way Kenya. Generate VERY detailed, beginner-friendly driving directions for someone who may be a new driver or unfamiliar with the area.

Route: ${originName || "Starting point"} → ${destName || "Destination"}
Total: ${totalDist}, ~${totalDur}

OSRM route steps:
${JSON.stringify(stepsSummary, null, 1)}

For EACH step, return a JSON array of direction objects. Each object MUST have these fields:
- "direction": one of "straight", "slight-right", "slight-left", "right", "left", "u-turn"
- "distance": the distance string (e.g. "250m", "1.2km")
- "instruction": A clear 1-sentence instruction (e.g. "Turn LEFT onto Waiyaki Way at the traffic lights.")
- "detailedGuide": 2-3 sentences explaining EXACTLY what the driver will see and should do, as if explaining to someone who has never driven before. Mention visual cues like lane markings, road splits, signs, buildings.
- "tip": A helpful driving tip specific to this maneuver (optional but encouraged)
- "warning": Any safety warning about this stretch — mention matatus, boda-bodas, pedestrians, potholes, or speed bumps if likely on Kenyan roads (optional)
- "laneHint": Which lane to be in, if relevant (optional)
- "roadName": The road name (optional)
- "estimatedTime": Time for this segment (e.g. "2 min")
- "landmark": An object with "name" (string), "type" ("poi"|"building"|"fuel"|"mall"), "position" ("left"|"right"|"ahead") — only if you can reasonably guess a landmark based on Nairobi knowledge (optional)

Keep language simple, warm, and encouraging. Use Kenyan English. Mention local context like matatus, roundabouts, and road conditions.

Return ONLY a valid JSON array. No markdown, no explanation.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a navigation AI. Return only valid JSON arrays. No markdown fences." },
          { role: "user", content: aiPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const errText = await aiResp.text();
      console.error("AI error:", status, errText);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fallback to basic directions
      const basicDirections = steps.map((s) => ({
        direction: mapManeuverToDirection(s.maneuver.type, s.maneuver.modifier),
        distance: formatDistance(s.distance),
        instruction: `${s.maneuver.modifier ? s.maneuver.modifier.charAt(0).toUpperCase() + s.maneuver.modifier.slice(1) : "Continue"} onto ${s.name || "the road"}`,
        roadName: s.name || undefined,
        estimatedTime: formatDuration(s.duration),
      }));

      return new Response(JSON.stringify({
        directions: basicDirections,
        summary: { totalDistance: totalDist, totalDuration: totalDur, arrivalTime },
        routeGeometry: osrmData.routes[0].geometry,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    let aiContent = aiData.choices?.[0]?.message?.content || "";

    // Clean markdown fences if present
    aiContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let directions;
    try {
      directions = JSON.parse(aiContent);
    } catch {
      console.error("Failed to parse AI response:", aiContent.substring(0, 500));
      // Fallback
      directions = steps.map((s) => ({
        direction: mapManeuverToDirection(s.maneuver.type, s.maneuver.modifier),
        distance: formatDistance(s.distance),
        instruction: `${s.maneuver.modifier ? s.maneuver.modifier.charAt(0).toUpperCase() + s.maneuver.modifier.slice(1) : "Continue"} onto ${s.name || "the road"}`,
        roadName: s.name || undefined,
        estimatedTime: formatDuration(s.duration),
      }));
    }

    return new Response(JSON.stringify({
      directions,
      summary: { totalDistance: totalDist, totalDuration: totalDur, arrivalTime },
      routeGeometry: osrmData.routes[0].geometry,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-directions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

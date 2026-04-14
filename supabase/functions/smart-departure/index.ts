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
    const { originName, destinationName, origin, destination, desiredArrivalTime } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    const prompt = `You are a Nairobi traffic expert. A driver wants to travel:
FROM: ${originName || "their current location"} ${origin ? `(${origin.lat}, ${origin.lng})` : ""}
TO: ${destinationName || "their destination"} ${destination ? `(${destination.lat}, ${destination.lng})` : ""}
${desiredArrivalTime ? `They want to arrive by: ${desiredArrivalTime}` : ""}

Current time: ${now.toLocaleTimeString('en-KE')} on ${dayOfWeek}

Based on your deep knowledge of Nairobi traffic patterns, provide smart departure recommendations. Consider:
- Morning rush: 6:30-9:30 AM (worst on Thika Road, Mombasa Road, Waiyaki Way)
- Evening rush: 4:30-8:00 PM (CBD exits, Uhuru Highway, Langata Road)
- School run times: 6:30-8:00 AM and 3:00-5:00 PM
- Weekend patterns: lighter but Safari Rally/football match events cause surges
- Rain multiplier: Nairobi traffic doubles in rain
- Known bottlenecks on this route

Return JSON with this exact schema:
{
  "bestDepartureTime": "HH:MM",
  "estimatedDuration": "X min",
  "trafficLevel": "light" | "moderate" | "heavy" | "severe",
  "confidence": "high" | "medium" | "low",
  "alternatives": [
    { "departAt": "HH:MM", "duration": "X min", "trafficLevel": "light"|"moderate"|"heavy"|"severe", "note": "Why this time" }
  ],
  "tips": ["tip1", "tip2"],
  "avoidRoads": ["road1 — reason"],
  "bestRoute": "Brief description of recommended route"
}

Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a Nairobi traffic patterns expert. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to analyze traffic" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    let recommendation;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      recommendation = JSON.parse(cleaned);
    } catch {
      console.error("Parse error:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ recommendation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("smart-departure error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

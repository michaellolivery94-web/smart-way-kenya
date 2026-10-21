const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const { lat, lng } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number" || lat < -5 || lat > 5.5 || lng < 33.5 || lng > 42.5) {
      return json({ error: "Coordinates must be within Kenya" }, 400);
    }
    const token = Deno.env.get("MAPILLARY_TOKEN");
    if (!token) return json({ error: "not_configured" }, 200);

    // Search progressively wider boxes (~150m, ~400m, ~1km), preferring 360° panoramas
    for (const d of [0.0015, 0.004, 0.01]) {
      const bbox = [lng - d, lat - d, lng + d, lat + d].join(",");
      const url = `https://graph.mapillary.com/images?access_token=${token}&fields=id,is_pano,geometry,captured_at&bbox=${bbox}&limit=50`;
      const r = await fetch(url);
      if (!r.ok) return json({ error: "lookup_failed" }, 200);
      const { data = [] } = await r.json();
      if (!data.length) continue;
      const dist = (i: any) => {
        const [x, y] = i.geometry.coordinates;
        return (x - lng) ** 2 + (y - lat) ** 2;
      };
      data.sort((a: any, b: any) => (Number(b.is_pano) - Number(a.is_pano)) || dist(a) - dist(b));
      const best = data[0];
      const [bx, by] = best.geometry.coordinates;
      const meters = Math.round(Math.sqrt((bx - lng) ** 2 + (by - lat) ** 2) * 111_000);
      return json({ id: best.id, isPano: !!best.is_pano, capturedAt: best.captured_at, meters });
    }
    return json({ error: "no_coverage" }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

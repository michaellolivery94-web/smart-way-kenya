import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, Box, Camera, RotateCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Coordinates } from "@/types/navigation";

type Tab = "street" | "3d";
type StreetResult = { id?: string; isPano?: boolean; capturedAt?: number; meters?: number; error?: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  destination: Coordinates;
  destinationName?: string;
}

function ThreeDView({ destination }: { destination: Coordinates }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [spinning, setSpinning] = useState(true);
  const spinRef = useRef(true);
  spinRef.current = spinning;

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [destination.lng, destination.lat],
      zoom: 17,
      pitch: 60,
      bearing: 0,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    new maplibregl.Marker({ color: "#22c55e" }).setLngLat([destination.lng, destination.lat]).addTo(map);

    let raf = 0;
    const spin = () => {
      if (spinRef.current && !map.isMoving()) map.setBearing((map.getBearing() + 0.15) % 360);
      raf = requestAnimationFrame(spin);
    };
    map.on("load", () => (raf = requestAnimationFrame(spin)));
    map.on("mousedown", () => setSpinning(false));
    map.on("touchstart", () => setSpinning(false));
    return () => {
      cancelAnimationFrame(raf);
      map.remove();
    };
  }, [destination.lat, destination.lng]);

  return (
    <div className="relative w-full h-full">
      <div ref={ref} className="absolute inset-0" aria-label="3D view around the destination" />
      <button
        onClick={() => setSpinning((s) => !s)}
        className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card/90 border border-border text-xs font-semibold text-foreground"
      >
        <RotateCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
        {spinning ? "Stop rotating" : "Rotate 360°"}
      </button>
    </div>
  );
}

function StreetView({ destination }: { destination: Coordinates }) {
  const [state, setState] = useState<StreetResult | null>(null);

  useEffect(() => {
    let alive = true;
    setState(null);
    supabase.functions
      .invoke("street-view", { body: { lat: destination.lat, lng: destination.lng } })
      .then(({ data, error }) => alive && setState(error ? { error: "lookup_failed" } : data));
    return () => {
      alive = false;
    };
  }, [destination.lat, destination.lng]);

  if (!state)
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Finding street photos nearby…
      </div>
    );

  if (state.error || !state.id) {
    const msg =
      state.error === "no_coverage"
        ? "No street photos have been captured near this place yet. Try the 3D view instead."
        : state.error === "not_configured"
          ? "Street photos aren't switched on yet. Use the 3D view for now."
          : "Couldn't load street photos right now. Try the 3D view instead.";
    return <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">{msg}</div>;
  }

  return (
    <div className="relative w-full h-full">
      <iframe
        title="Street-level 360° view"
        src={`https://www.mapillary.com/embed?image_key=${state.id}&style=photo`}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
      />
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-card/90 border border-border text-[11px] text-foreground">
        {state.isPano ? "360° photo" : "Street photo"} · {state.meters ?? 0} m away
        {state.capturedAt ? ` · ${new Date(state.capturedAt).getFullYear()}` : ""}
      </div>
    </div>
  );
}

export function DestinationPreview360({ isOpen, onClose, destination, destinationName }: Props) {
  const [tab, setTab] = useState<Tab>("3d");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="360° destination preview">
      <div className="w-full sm:max-w-3xl h-[85vh] sm:h-[75vh] flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 p-3 border-b border-border">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-primary font-bold">360° preview</p>
            <h2 className="font-display font-semibold text-foreground truncate">{destinationName || "Destination"}</h2>
          </div>
          <button onClick={onClose} aria-label="Close preview" className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-1 p-2 border-b border-border" role="tablist">
          {([
            ["3d", "3D view", Box],
            ["street", "Street photos", Camera],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 bg-muted">
          {tab === "3d" ? <ThreeDView destination={destination} /> : <StreetView destination={destination} />}
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DirectionCardProps } from "@/components/navigation/DirectionCard";

export interface AIDirection {
  direction: "straight" | "slight-right" | "slight-left" | "right" | "left" | "u-turn";
  distance: string;
  instruction: string;
  detailedGuide?: string;
  laneHint?: string;
  tip?: string;
  warning?: string;
  roadName?: string;
  estimatedTime?: string;
  landmark?: {
    name: string;
    type: "poi" | "building" | "fuel" | "mall";
    position: "left" | "right" | "ahead";
  } | null;
}


export const useAIDirections = () => {
  const [directions, setDirections] = useState<AIDirection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDirections = useCallback(async (params: {
    steps: any[];
    origin?: { lat: number; lng: number } | null;
    destination?: { lat: number; lng: number } | null;
    originName?: string;
    destinationName?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setDirections([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-directions", {
        body: {
          steps: params.steps,
          origin: params.origin,
          destination: params.destination,
          originName: params.originName,
          destinationName: params.destinationName,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to generate directions");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.directions && Array.isArray(data.directions)) {
        // Validate and clean directions
        const cleaned: AIDirection[] = data.directions.map((d: any) => ({
          direction: ["straight", "slight-right", "slight-left", "right", "left", "u-turn"].includes(d.direction) 
            ? d.direction 
            : "straight",
          distance: d.distance || "---",
          instruction: d.instruction || "Continue driving",
          detailedGuide: d.detailedGuide || undefined,
          laneHint: d.laneHint || undefined,
          tip: d.tip || undefined,
          warning: d.warning || undefined,
          roadName: d.roadName || undefined,
          estimatedTime: d.estimatedTime || undefined,
          landmark: d.landmark && d.landmark.name ? {
            name: d.landmark.name,
            type: ["poi", "building", "fuel", "mall"].includes(d.landmark.type) ? d.landmark.type : "poi",
            position: ["left", "right", "ahead"].includes(d.landmark.position) ? d.landmark.position : "ahead",
          } : undefined,
        }));
        setDirections(cleaned);
        return cleaned;
      }

      throw new Error("No directions received");
    } catch (err: any) {
      const msg = err.message || "Could not generate AI directions";
      setError(msg);
      toast.error("AI Directions failed", { description: msg });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDirections = useCallback(() => {
    setDirections([]);
    setError(null);
  }, []);

  return { directions, isLoading, error, generateDirections, clearDirections };
};

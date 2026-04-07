import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DirectionCardProps } from "@/components/navigation/DirectionCard";

interface RouteSummary {
  totalDistance: string;
  totalDuration: string;
  arrivalTime: string;
}

interface AIDirectionsResult {
  directions: Omit<DirectionCardProps, "isNext">[];
  summary: RouteSummary;
  routeGeometry?: any;
}

export const useAIDirections = () => {
  const [directions, setDirections] = useState<Omit<DirectionCardProps, "isNext">[]>([]);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDirections = useCallback(
    async (
      origin: { lat: number; lng: number },
      destination: { lat: number; lng: number },
      originName?: string,
      destName?: string
    ) => {
      setIsLoading(true);
      setError(null);
      setDirections([]);
      setSummary(null);
      setRouteGeometry(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "generate-directions",
          {
            body: {
              originLat: origin.lat,
              originLng: origin.lng,
              destLat: destination.lat,
              destLng: destination.lng,
              originName,
              destName,
            },
          }
        );

        if (fnError) {
          throw new Error(fnError.message || "Failed to generate directions");
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        const result = data as AIDirectionsResult;

        // Validate direction values
        const validDirections = [
          "straight",
          "slight-right",
          "slight-left",
          "right",
          "left",
          "u-turn",
        ];

        const sanitized = (result.directions || []).map((d) => ({
          ...d,
          direction: validDirections.includes(d.direction)
            ? d.direction
            : ("straight" as const),
        }));

        setDirections(sanitized);
        setSummary(result.summary || null);
        setRouteGeometry(result.routeGeometry || null);
      } catch (err: any) {
        console.error("AI Directions error:", err);
        setError(err.message || "Failed to get directions");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearDirections = useCallback(() => {
    setDirections([]);
    setSummary(null);
    setRouteGeometry(null);
    setError(null);
  }, []);

  return {
    directions,
    summary,
    routeGeometry,
    isLoading,
    error,
    fetchDirections,
    clearDirections,
  };
};

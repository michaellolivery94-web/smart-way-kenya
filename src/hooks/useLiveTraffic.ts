import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LiveReadings, fetchLiveReadings } from "@/lib/liveTraffic";

/**
 * Live corridor speeds contributed by drivers using the app.
 * Refreshes on a timer and immediately when a new reading lands.
 */
export function useLiveTraffic(refreshMs = 60000) {
  const [readings, setReadings] = useState<LiveReadings>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await fetchLiveReadings();
    setReadings(next);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, refreshMs);

    const channel = supabase
      .channel("corridor-speed-samples")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "corridor_speed_samples" },
        () => refresh(),
      )
      .subscribe();

    return () => {
      window.clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, [refresh, refreshMs]);

  const liveCount = Object.keys(readings).length;
  return { readings, isLoading, liveCount, refresh };
}

import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Clock, ArrowRight, Loader2, X, 
  AlertTriangle, Route, Lightbulb, ShieldAlert
} from "lucide-react";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DepartureRecommendation {
  bestDepartureTime: string;
  estimatedDuration: string;
  trafficLevel: "light" | "moderate" | "heavy" | "severe";
  confidence: "high" | "medium" | "low";
  alternatives: { departAt: string; duration: string; trafficLevel: string; note: string }[];
  tips: string[];
  avoidRoads: string[];
  bestRoute: string;
}

interface SmartDepartureProps {
  originName?: string;
  destinationName?: string;
  origin?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
  isVisible: boolean;
  onClose: () => void;
  onSelectTime?: (time: string) => void;
}

const trafficColors: Record<string, { bg: string; text: string; label: string }> = {
  light: { bg: "bg-success/15", text: "text-success", label: "🟢 Light" },
  moderate: { bg: "bg-warning/15", text: "text-warning", label: "🟡 Moderate" },
  heavy: { bg: "bg-destructive/15", text: "text-destructive", label: "🔴 Heavy" },
  severe: { bg: "bg-destructive/20", text: "text-destructive", label: "🔴 Severe" },
};

export const SmartDeparture = ({
  originName, destinationName, origin, destination,
  isVisible, onClose, onSelectTime,
}: SmartDepartureProps) => {
  const [recommendation, setRecommendation] = useState<DepartureRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyze = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("smart-departure", {
        body: { originName, destinationName, origin, destination },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.recommendation) setRecommendation(data.recommendation);
    } catch (err: any) {
      toast.error("Could not analyze traffic", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [originName, destinationName, origin, destination]);

  // Auto-analyze when visible
  useState(() => {
    if (isVisible && !recommendation && !isLoading) {
      analyze();
    }
  });

  if (!isVisible) return null;

  const tc = recommendation ? (trafficColors[recommendation.trafficLevel] || trafficColors.moderate) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="fixed bottom-0 left-0 right-0 z-50 nav-card rounded-t-2xl max-h-[75vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Smart Departure</h3>
              <p className="text-[10px] text-muted-foreground">AI-powered traffic analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-10 h-10 text-primary" />
              </motion.div>
              <p className="text-sm font-medium text-foreground">Analyzing Nairobi traffic patterns…</p>
              <p className="text-xs text-muted-foreground">Checking rush hours, bottlenecks & weather</p>
            </div>
          )}

          {/* Recommendation */}
          {recommendation && tc && (
            <div className="space-y-4">
              {/* Best Time Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                  <Brain className="w-3 h-3" /> Recommended
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-foreground">{recommendation.bestDepartureTime}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ~{recommendation.estimatedDuration} journey
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${tc.bg} ${tc.text}`}>
                      {tc.label}
                    </span>
                  </div>
                </div>
                {recommendation.bestRoute && (
                  <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/30">
                    <Route className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-foreground/70">{recommendation.bestRoute}</p>
                  </div>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onSelectTime?.(recommendation.bestDepartureTime);
                    onClose();
                    toast.success(`Departure set for ${recommendation.bestDepartureTime}`);
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl nav-button-primary text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5" /> Set Departure Time
                </motion.button>
              </div>

              {/* Alternatives */}
              {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Other Options
                  </p>
                  <div className="space-y-1.5">
                    {recommendation.alternatives.map((alt, i) => {
                      const atc = trafficColors[alt.trafficLevel] || trafficColors.moderate;
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onSelectTime?.(alt.departAt);
                            onClose();
                            toast.success(`Departure set for ${alt.departAt}`);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30 text-left hover:bg-secondary/50 transition-colors"
                        >
                          <div className="text-center min-w-[50px]">
                            <p className="text-sm font-bold text-foreground">{alt.departAt}</p>
                            <p className="text-[9px] text-muted-foreground">~{alt.duration}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-foreground/70 truncate">{alt.note}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${atc.bg} ${atc.text} flex-shrink-0`}>
                            {atc.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tips */}
              {recommendation.tips && recommendation.tips.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Traffic Tips
                  </p>
                  <div className="space-y-1.5">
                    {recommendation.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                        <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-foreground/70">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avoid Roads */}
              {recommendation.avoidRoads && recommendation.avoidRoads.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Roads to Avoid
                  </p>
                  <div className="space-y-1.5">
                    {recommendation.avoidRoads.map((road, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/5 border border-destructive/10">
                        <ShieldAlert className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-foreground/70">{road}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

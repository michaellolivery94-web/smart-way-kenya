import { motion, AnimatePresence } from "framer-motion";
import {
  X, AlertTriangle, Construction, Droplets, MapPin,
  CheckCircle2, Clock, Camera, Gauge, Navigation, ThumbsUp, ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RoadCondition, SpeedCamera } from "@/contexts/RoadConditionsContext";

export type HazardDetail =
  | { kind: "condition"; data: RoadCondition }
  | { kind: "camera"; data: SpeedCamera };

interface HazardDetailModalProps {
  hazard: HazardDetail | null;
  onClose: () => void;
  onNavigateAround?: () => void;
}

const conditionMeta: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string; border: string; tip: string }> = {
  murram: {
    label: "Murram (Unpaved) Road",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    tip: "Reduce speed. Expect dust, loose gravel and uneven surface. 4x4 recommended for high-severity stretches.",
  },
  construction: {
    label: "Construction Zone",
    icon: Construction,
    color: "text-orange-500",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    tip: "Expect lane closures, flagmen and machinery. Slow down and follow the posted detour signs.",
  },
  pothole: {
    label: "Pothole Hazard",
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    tip: "Drive cautiously. Move to a clear lane if safe. Avoid hard braking near the pothole.",
  },
  flooded: {
    label: "Flooded Section",
    icon: Droplets,
    color: "text-blue-500",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    tip: "Do not drive through deep water. If unavoidable, proceed slowly in low gear without stopping.",
  },
};

export const HazardDetailModal = ({ hazard, onClose, onNavigateAround }: HazardDetailModalProps) => {
  return (
    <AnimatePresence>
      {hazard && (
        <motion.div
          key="hazard-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: 60, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-[420px] z-[61]"
          >
            {hazard.kind === "condition" ? (
              <ConditionContent condition={hazard.data} onClose={onClose} onNavigateAround={onNavigateAround} />
            ) : (
              <CameraContent camera={hazard.data} onClose={onClose} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConditionContent = ({
  condition,
  onClose,
  onNavigateAround,
}: {
  condition: RoadCondition;
  onClose: () => void;
  onNavigateAround?: () => void;
}) => {
  const meta = conditionMeta[condition.type];
  const Icon = meta.icon;
  const severityClasses = {
    high: "bg-destructive/20 text-destructive border-destructive/30",
    medium: "bg-warning/20 text-warning border-warning/30",
    low: "bg-success/20 text-success border-success/30",
  } as const;

  return (
    <div className={`nav-card rounded-2xl overflow-hidden border ${meta.border} shadow-2xl`}>
      <div className={`h-1 w-full ${
        condition.severity === "high" ? "bg-destructive" :
        condition.severity === "medium" ? "bg-warning" : "bg-success"
      }`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 border ${meta.border}`}
          >
            <Icon className={`w-6 h-6 ${meta.color}`} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">{meta.label}</h3>
              {condition.verified && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/20 text-success">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {condition.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary/80 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Severity & meta */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${severityClasses[condition.severity]}`}>
            {condition.severity.toUpperCase()} SEVERITY
          </span>
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(condition.reportedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Description */}
        <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
          <p className="text-sm text-foreground leading-relaxed">{condition.description}</p>
        </div>

        {/* Driver tip */}
        <div className={`mt-3 p-3 rounded-xl ${meta.bg} border ${meta.border}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1 text-foreground/80">Driver Tip</p>
          <p className="text-xs text-foreground/90 leading-relaxed">{meta.tip}</p>
        </div>

        {/* Feedback */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => { toast.success("Thanks! Report confirmed."); onClose(); }}
          >
            <ThumbsUp className="w-4 h-4" /> Still here
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => { toast("Marked as cleared", { description: "Thanks for the update." }); onClose(); }}
          >
            <ThumbsDown className="w-4 h-4" /> Not there
          </Button>
        </div>

        {onNavigateAround && (
          <Button
            size="sm"
            className="w-full mt-2 gap-1.5"
            onClick={onNavigateAround}
          >
            <Navigation className="w-4 h-4" /> Find route around
          </Button>
        )}
      </div>
    </div>
  );
};

const CameraContent = ({ camera, onClose }: { camera: SpeedCamera; onClose: () => void }) => {
  const typeLabel = { fixed: "Fixed Camera", mobile: "Mobile Camera", average: "Average Speed Camera" }[camera.type];

  return (
    <div className="nav-card rounded-2xl overflow-hidden border border-destructive/30 shadow-2xl">
      <div className="h-1 w-full bg-destructive" />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center flex-shrink-0 border border-destructive/30"
          >
            <Camera className="w-6 h-6 text-destructive" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground">{typeLabel}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {camera.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary/80 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Speed Limit Big Display */}
        <div className="mt-4 flex items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white border-[6px] border-destructive flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-destructive">{camera.speedLimit}</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Speed Limit</p>
            <p className="text-2xl font-bold text-foreground">{camera.speedLimit} <span className="text-sm text-muted-foreground font-medium">km/h</span></p>
            {camera.direction && (
              <p className="text-xs text-muted-foreground mt-1">Direction: {camera.direction}</p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <Gauge className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-destructive mb-1">Driver Alert</p>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {camera.type === "average"
                  ? "Average speed enforced over a stretch. Maintain steady speed under the limit for the full zone."
                  : camera.type === "mobile"
                  ? "Mobile cameras may move locations. Adhere to the posted limit at all times."
                  : "Fixed enforcement camera. Reduce speed well in advance and stay below the limit."}
              </p>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
            camera.active
              ? "bg-destructive/20 text-destructive border-destructive/30"
              : "bg-muted text-muted-foreground border-border"
          }`}>
            {camera.active ? "● ACTIVE" : "○ INACTIVE"}
          </span>
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
            {typeLabel}
          </span>
        </div>

        <Button size="sm" className="w-full mt-4" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  );
};

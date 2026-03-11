import { motion } from "framer-motion";
import { 
  ArrowUp, 
  ArrowUpRight, 
  ArrowUpLeft, 
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  MapPin,
  Building2,
  Fuel,
  ShoppingBag,
  AlertTriangle,
  Info,
  Eye,
  Navigation
} from "lucide-react";

type Direction = "straight" | "slight-right" | "slight-left" | "right" | "left" | "u-turn";
type LandmarkType = "poi" | "building" | "fuel" | "mall";

export interface DirectionCardProps {
  direction: Direction;
  distance: string;
  instruction: string;
  detailedGuide?: string;
  tip?: string;
  warning?: string;
  laneHint?: string;
  landmark?: {
    name: string;
    type: LandmarkType;
    position: "left" | "right" | "ahead";
  };
  roadName?: string;
  estimatedTime?: string;
  isNext?: boolean;
}

const directionIcons: Record<Direction, typeof ArrowUp> = {
  straight: ArrowUp,
  "slight-right": ArrowUpRight,
  "slight-left": ArrowUpLeft,
  right: ArrowRight,
  left: ArrowLeft,
  "u-turn": RotateCcw,
};

const directionLabels: Record<Direction, string> = {
  straight: "Go Straight",
  "slight-right": "Bear Right",
  "slight-left": "Bear Left",
  right: "Turn Right",
  left: "Turn Left",
  "u-turn": "Make a U-Turn",
};

const landmarkIcons: Record<LandmarkType, typeof MapPin> = {
  poi: MapPin,
  building: Building2,
  fuel: Fuel,
  mall: ShoppingBag,
};

export const DirectionCard = ({ 
  direction, 
  distance, 
  instruction, 
  detailedGuide,
  tip,
  warning,
  laneHint,
  landmark,
  roadName,
  estimatedTime,
  isNext = false 
}: DirectionCardProps) => {
  const DirectionIcon = directionIcons[direction];
  const LandmarkIcon = landmark ? landmarkIcons[landmark.type] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${
        isNext 
          ? "border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/10" 
          : "border-border/50 bg-card/80"
      }`}
    >
      {/* Main Direction Row */}
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Direction Icon - Large & Clear */}
        <div className={`
          flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center relative
          ${isNext 
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" 
            : "bg-secondary text-secondary-foreground"
          }
        `}>
          <DirectionIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          {isNext && (
            <motion.div 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Navigation className="w-3 h-3 text-success-foreground" />
            </motion.div>
          )}
        </div>
        
        {/* Direction Details */}
        <div className="flex-1 min-w-0">
          {/* Distance + Label */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              isNext ? "text-primary" : "text-foreground"
            }`}>
              {distance}
            </span>
            {isNext && (
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest">
                Next
              </span>
            )}
            {estimatedTime && (
              <span className="text-xs text-muted-foreground">~{estimatedTime}</span>
            )}
          </div>

          {/* Direction Label */}
          <p className={`text-sm font-bold mt-0.5 ${isNext ? "text-primary" : "text-foreground"}`}>
            {directionLabels[direction]}
          </p>

          {/* Main Instruction */}
          <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{instruction}</p>
          
          {/* Road Name */}
          {roadName && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold border border-border/50">
                {roadName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Guide - The "explain like I'm 3" section */}
      {detailedGuide && (
        <div className="mx-3 sm:mx-4 mb-2 p-3 rounded-xl bg-info/8 border border-info/20">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Eye className="w-3.5 h-3.5 text-info" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-info uppercase tracking-wider mb-0.5">What to look for</p>
              <p className="text-xs text-foreground/70 leading-relaxed">{detailedGuide}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lane Hint */}
      {laneHint && (
        <div className="mx-3 sm:mx-4 mb-2 p-2.5 rounded-xl bg-accent/50 border border-accent-foreground/10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-foreground/10 flex items-center justify-center flex-shrink-0">
              <ArrowUp className="w-3 h-3 text-foreground/60" />
            </div>
            <p className="text-xs text-foreground/70 font-medium">
              <span className="font-bold text-foreground/90">Lane: </span>{laneHint}
            </p>
          </div>
        </div>
      )}

      {/* Landmark */}
      {landmark && LandmarkIcon && (
        <div className="mx-3 sm:mx-4 mb-2 p-2.5 rounded-xl bg-success/8 border border-success/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
              <LandmarkIcon className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="text-xs text-foreground/70">
              <span className="font-bold text-success">Look {landmark.position}:</span>{" "}
              You'll see <span className="font-semibold text-foreground/90">{landmark.name}</span>
            </p>
          </div>
        </div>
      )}

      {/* Tip */}
      {tip && (
        <div className="mx-3 sm:mx-4 mb-2 p-2.5 rounded-xl bg-primary/8 border border-primary/20">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">
              <span className="font-bold text-primary">Tip: </span>{tip}
            </p>
          </div>
        </div>
      )}

      {/* Warning */}
      {warning && (
        <div className="mx-3 sm:mx-4 mb-3 p-2.5 rounded-xl bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-md bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-3 h-3 text-warning" />
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">
              <span className="font-bold text-warning">Heads up: </span>{warning}
            </p>
          </div>
        </div>
      )}

      {/* Bottom spacer if no extras */}
      {!detailedGuide && !tip && !warning && !laneHint && !landmark && (
        <div className="h-1" />
      )}
    </motion.div>
  );
};

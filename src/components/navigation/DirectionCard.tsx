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
  ShoppingBag
} from "lucide-react";

type Direction = "straight" | "slight-right" | "slight-left" | "right" | "left" | "u-turn";
type LandmarkType = "poi" | "building" | "fuel" | "mall";

interface DirectionCardProps {
  direction: Direction;
  distance: string;
  instruction: string;
  landmark?: {
    name: string;
    type: LandmarkType;
    position: "left" | "right" | "ahead";
  };
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
  landmark,
  isNext = false 
}: DirectionCardProps) => {
  const DirectionIcon = directionIcons[direction];
  const LandmarkIcon = landmark ? landmarkIcons[landmark.type] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`direction-card ${isNext ? "glow-effect" : ""}`}
    >
      <div className={`
        flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
        ${isNext ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
      `}>
        <DirectionIcon className="w-7 h-7" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-bold ${isNext ? "text-primary" : "text-foreground"}`}>
            {distance}
          </span>
          {isNext && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              next turn
            </span>
          )}
        </div>
        <p className="text-sm text-foreground/90 truncate">{instruction}</p>
        
        {landmark && LandmarkIcon && (
          <div className="landmark-badge mt-2">
            <LandmarkIcon className="w-3 h-3" />
            <span>
              {landmark.name} on {landmark.position}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

import { motion } from "framer-motion";

interface LaneGuidanceProps {
  lanes: Array<{
    id: number;
    active: boolean;
    isExit?: boolean;
    direction?: "left" | "straight" | "right";
  }>;
  currentLane?: number;
}

export const LaneGuidance = ({ lanes, currentLane = 1 }: LaneGuidanceProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Stay in lane
      </span>
      <div className="flex gap-1.5">
        {lanes.map((lane, index) => (
          <motion.div
            key={lane.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              lane-indicator w-8 h-12 flex items-end justify-center pb-1
              ${lane.active ? (lane.isExit ? "lane-exit" : "lane-active") : "lane-inactive"}
            `}
          >
            {lane.active && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold text-primary-foreground"
              >
                {lane.direction === "left" && "↖"}
                {lane.direction === "straight" && "↑"}
                {lane.direction === "right" && "↗"}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        Lane {currentLane} of {lanes.length}
      </span>
    </div>
  );
};

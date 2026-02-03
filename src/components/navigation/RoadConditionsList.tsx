import { motion } from "framer-motion";
import { Construction, CircleDot, AlertTriangle, Waves, ChevronRight, X } from "lucide-react";
import { useRoadConditions, RoadConditionType, RoadCondition } from "@/contexts/RoadConditionsContext";
import { useState } from "react";

const conditionIcons: Record<RoadConditionType, typeof Construction> = {
  murram: CircleDot,
  construction: Construction,
  pothole: AlertTriangle,
  flooded: Waves,
};

const conditionColors: Record<RoadConditionType, string> = {
  murram: "bg-amber-500",
  construction: "bg-orange-500",
  pothole: "bg-yellow-500",
  flooded: "bg-blue-500",
};

const conditionLabels: Record<RoadConditionType, string> = {
  murram: "Murram Road",
  construction: "Construction",
  pothole: "Potholes",
  flooded: "Flooded",
};

interface RoadConditionsListProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoadConditionsList = ({ isOpen, onClose }: RoadConditionsListProps) => {
  const { conditions } = useRoadConditions();
  const [filter, setFilter] = useState<RoadConditionType | "all">("all");

  const filteredConditions = filter === "all" 
    ? conditions 
    : conditions.filter((c) => c.type === filter);

  // Group by type for summary
  const summary = conditions.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<RoadConditionType, number>);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50"
    >
      <div className="h-full flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Road Conditions</h2>
            <p className="text-sm text-muted-foreground">Nearby alerts and warnings</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Filter Pills */}
        <div className="p-4 flex gap-2 overflow-x-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "all" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            All ({conditions.length})
          </motion.button>
          {(Object.keys(conditionLabels) as RoadConditionType[]).map((type) => {
            const Icon = conditionIcons[type];
            const count = summary[type] || 0;
            if (count === 0) return null;
            
            return (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                  filter === type 
                    ? `${conditionColors[type]} text-white` 
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {conditionLabels[type]} ({count})
              </motion.button>
            );
          })}
        </div>

        {/* Conditions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredConditions.map((condition) => (
            <ConditionCard key={condition.id} condition={condition} />
          ))}
          
          {filteredConditions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No conditions reported in this category</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground text-center">
            🟢 Verified by community • 🟡 User reported • Tap for details
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const ConditionCard = ({ condition }: { condition: RoadCondition }) => {
  const Icon = conditionIcons[condition.type];
  const color = conditionColors[condition.type];
  
  const severityBadge = {
    low: "bg-success/15 text-success",
    medium: "bg-warning/15 text-warning",
    high: "bg-destructive/15 text-destructive",
  }[condition.severity];

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="nav-card p-4 flex items-center gap-4 cursor-pointer"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground truncate">{condition.name}</h4>
          {condition.verified && (
            <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{condition.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityBadge}`}>
            {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            {conditionLabels[condition.type]}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </motion.div>
  );
};

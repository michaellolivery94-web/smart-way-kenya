import { motion } from "framer-motion";
import { Car, Briefcase } from "lucide-react";

interface ModeToggleProps {
  mode: "commuter" | "pro";
  onModeChange: (mode: "commuter" | "pro") => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="mode-toggle flex relative">
      <motion.div
        className="absolute inset-y-1 rounded-full bg-primary"
        initial={false}
        animate={{
          x: mode === "commuter" ? 4 : "calc(100% - 4px)",
          width: mode === "commuter" ? 110 : 90,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
      <button
        onClick={() => onModeChange("commuter")}
        className={`mode-toggle-option flex items-center gap-2 ${mode === "commuter" ? "active" : ""}`}
      >
        <Car className="w-4 h-4" />
        <span>Commuter</span>
      </button>
      <button
        onClick={() => onModeChange("pro")}
        className={`mode-toggle-option flex items-center gap-2 ${mode === "pro" ? "active" : ""}`}
      >
        <Briefcase className="w-4 h-4" />
        <span>Pro</span>
      </button>
    </div>
  );
};

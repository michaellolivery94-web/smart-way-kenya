import { motion } from "framer-motion";
import { Car, Zap, User, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModeToggleProps {
  mode: "commuter" | "pro";
  onModeChange: (mode: "commuter" | "pro") => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <TooltipProvider>
      <div className="flex relative nav-card p-1 rounded-xl shadow-md">
        {/* Background slider */}
        <motion.div
          className="absolute inset-y-1 rounded-lg"
          initial={false}
          animate={{
            x: mode === "commuter" ? 4 : "calc(100% - 4px)",
            width: mode === "commuter" ? "calc(50% - 4px)" : "calc(50% - 4px)",
            background: mode === "commuter" 
              ? "linear-gradient(135deg, hsl(var(--info)), hsl(var(--info) / 0.8))" 
              : "linear-gradient(135deg, hsl(280, 80%, 50%), hsl(320, 80%, 50%))",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        
        {/* Commuter Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => onModeChange("commuter")}
              whileTap={{ scale: 0.95 }}
              className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors ${
                mode === "commuter" ? "text-info-foreground" : "text-muted-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="font-semibold text-xs hidden sm:block">Simple</span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-card border-border">
            <div className="text-xs">
              <p className="font-bold flex items-center gap-1.5"><User className="w-3 h-3 text-info" /> Simple Mode</p>
            </div>
          </TooltipContent>
        </Tooltip>
        
        {/* Pro Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => onModeChange("pro")}
              whileTap={{ scale: 0.95 }}
              className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors ${
                mode === "pro" ? "text-white" : "text-muted-foreground"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="font-semibold text-xs hidden sm:block">Pro</span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-card border-border">
            <div className="text-xs">
              <p className="font-bold flex items-center gap-1.5"><Zap className="w-3 h-3 text-purple-500" /> Pro Driver</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

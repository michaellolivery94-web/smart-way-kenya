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
      <div className="flex relative nav-card p-1.5 rounded-2xl shadow-lg">
        {/* Background slider */}
        <motion.div
          className="absolute inset-y-1.5 rounded-xl"
          initial={false}
          animate={{
            x: mode === "commuter" ? 6 : "calc(100% - 6px)",
            width: mode === "commuter" ? "calc(50% - 6px)" : "calc(50% - 6px)",
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
              className={`relative z-10 flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-colors ${
                mode === "commuter" ? "text-info-foreground" : "text-muted-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === "commuter" ? "bg-white/20" : "bg-transparent"
              }`}>
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-semibold text-sm sm:text-base hidden sm:block">Simple</span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-card border-border">
            <div className="text-sm">
              <p className="font-bold flex items-center gap-2"><User className="w-4 h-4 text-info" /> Simple Mode</p>
              <p className="text-muted-foreground text-xs mt-1">Easy navigation for everyone</p>
            </div>
          </TooltipContent>
        </Tooltip>
        
        {/* Pro Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => onModeChange("pro")}
              whileTap={{ scale: 0.95 }}
              className={`relative z-10 flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-colors ${
                mode === "pro" ? "text-white" : "text-muted-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === "pro" ? "bg-white/20" : "bg-transparent"
              }`}>
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-semibold text-sm sm:text-base hidden sm:block">Pro</span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-card border-border">
            <div className="text-sm">
              <p className="font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500" /> Pro Driver</p>
              <p className="text-muted-foreground text-xs mt-1">Shortcuts & traffic data</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

import { motion } from "framer-motion";
import { Menu, Bell, Settings, Download, User, MapPin, Construction } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  mode: "commuter" | "pro";
  onModeChange: (mode: "commuter" | "pro") => void;
  isNavigating?: boolean;
  onOpenOfflineMaps?: () => void;
  onOpenRoadConditions?: () => void;
}

export const Header = ({ mode, onModeChange, isNavigating = false, onOpenOfflineMaps, onOpenRoadConditions }: HeaderProps) => {
  if (isNavigating) {
    return null; // Hide header during active navigation
  }

  return (
    <TooltipProvider>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-30 p-2 sm:p-3"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Menu Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="relative w-9 h-9 sm:w-10 sm:h-10 nav-card rounded-xl flex items-center justify-center shadow-md"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-card border-border">
              <p className="flex items-center gap-2 text-xs font-medium">
                <Menu className="w-3 h-3" /> Menu
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Mode Toggle - Enhanced */}
          <ModeToggle mode={mode} onModeChange={onModeChange} />

          {/* Right Actions - Enhanced with tooltips and larger touch targets */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Offline Maps */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  onClick={onOpenOfflineMaps}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 nav-card rounded-xl flex items-center justify-center shadow-md"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Download className="w-3 h-3" /> Offline Maps
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Road Conditions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  onClick={onOpenRoadConditions}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 nav-card rounded-xl flex items-center justify-center shadow-md"
                >
                  <Construction className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-warning rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-[6px] font-bold text-warning-foreground">!</span>
                  </motion.div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Construction className="w-3 h-3" /> Road Conditions
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 nav-card rounded-xl flex items-center justify-center shadow-md"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <span className="text-[8px] font-bold text-destructive-foreground">3</span>
                  </motion.div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Bell className="w-3 h-3" /> Alerts
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = "/settings"}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 nav-card rounded-xl flex items-center justify-center shadow-md"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Settings className="w-3 h-3" /> Settings
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.header>
    </TooltipProvider>
  );
};

import { motion } from "framer-motion";
import { Menu, Bell, Settings, Download, User, MapPin } from "lucide-react";
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
}

export const Header = ({ mode, onModeChange, isNavigating = false, onOpenOfflineMaps }: HeaderProps) => {
  if (isNavigating) {
    return null; // Hide header during active navigation
  }

  return (
    <TooltipProvider>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Menu Button - Enhanced */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="relative w-12 h-12 sm:w-14 sm:h-14 nav-card rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Menu className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" />
                {/* Visual indicator dot */}
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-card border-border">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Menu className="w-4 h-4" /> Menu
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Mode Toggle - Enhanced */}
          <ModeToggle mode={mode} onModeChange={onModeChange} />

          {/* Right Actions - Enhanced with tooltips and larger touch targets */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline Maps */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  onClick={onOpenOfflineMaps}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-12 sm:w-14 sm:h-14 nav-card rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Download className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Download className="w-4 h-4" /> Save Maps Offline
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-12 sm:w-14 sm:h-14 nav-card rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" />
                  {/* Notification badge - more visible */}
                  <motion.div 
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <span className="text-[10px] font-bold text-destructive-foreground">3</span>
                  </motion.div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Bell className="w-4 h-4" /> Alerts
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = "/settings"}
                  className="relative w-12 h-12 sm:w-14 sm:h-14 nav-card rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Settings className="w-4 h-4" /> Settings
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.header>
    </TooltipProvider>
  );
};

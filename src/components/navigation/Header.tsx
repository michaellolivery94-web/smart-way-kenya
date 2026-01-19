import { motion } from "framer-motion";
import { Menu, Bell, Settings } from "lucide-react";
import { ModeToggle } from "./ModeToggle";

interface HeaderProps {
  mode: "commuter" | "pro";
  onModeChange: (mode: "commuter" | "pro") => void;
  isNavigating?: boolean;
}

export const Header = ({ mode, onModeChange, isNavigating = false }: HeaderProps) => {
  if (isNavigating) {
    return null; // Hide header during active navigation
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-0 left-0 right-0 z-30 p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <button className="p-3 nav-card rounded-xl">
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <ModeToggle mode={mode} onModeChange={onModeChange} />

        <div className="flex items-center gap-2">
          <button className="p-3 nav-card rounded-xl relative">
            <Bell className="w-5 h-5 text-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button className="p-3 nav-card rounded-xl">
            <Settings className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

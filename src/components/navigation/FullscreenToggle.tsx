import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export const FullscreenToggle = ({ isFullscreen, onToggle }: FullscreenToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="absolute bottom-24 right-2 sm:right-3 z-20 w-10 h-10 nav-card rounded-xl flex items-center justify-center shadow-lg border border-border/50 backdrop-blur-sm"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-foreground" />
            ) : (
              <Maximize2 className="w-4 h-4 text-foreground" />
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card border-border">
          <p className="text-xs font-medium">
            {isFullscreen ? "Show controls" : "Fullscreen map"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

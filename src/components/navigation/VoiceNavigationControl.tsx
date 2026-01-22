import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Volume1, ChevronUp, ChevronDown, Navigation } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import type { NavigationInstruction } from "@/hooks/useVoiceNavigation";

interface VoiceNavigationControlProps {
  isEnabled: boolean;
  isSpeaking: boolean;
  volume: number;
  currentInstruction: NavigationInstruction | null;
  upcomingInstructions: NavigationInstruction[];
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onAnnounce: (instruction: NavigationInstruction) => void;
}

const getDirectionIcon = (type: string, modifier?: string) => {
  if (type === 'arrive') return '🏁';
  if (type === 'depart') return '🚗';
  if (type === 'roundabout') return '🔄';
  
  switch (modifier) {
    case 'left':
    case 'sharp left':
      return '⬅️';
    case 'slight left':
      return '↖️';
    case 'right':
    case 'sharp right':
      return '➡️';
    case 'slight right':
      return '↗️';
    case 'uturn':
      return '↩️';
    case 'straight':
    default:
      return '⬆️';
  }
};

export const VoiceNavigationControl = ({
  isEnabled,
  isSpeaking,
  volume,
  currentInstruction,
  upcomingInstructions,
  onToggle,
  onVolumeChange,
  onAnnounce,
}: VoiceNavigationControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        className="absolute left-2 sm:left-4 bottom-36 sm:bottom-48 z-20 flex flex-col items-start gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Current Instruction Card */}
        <AnimatePresence>
          {currentInstruction && isEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="nav-card p-3 sm:p-4 rounded-xl shadow-lg max-w-[280px] sm:max-w-[320px]"
            >
              {/* Main direction display */}
              <div className="flex items-start gap-3">
                <div className={`
                  w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl
                  ${isSpeaking ? 'bg-primary/20 animate-pulse' : 'bg-muted'}
                `}>
                  {getDirectionIcon(currentInstruction.type, currentInstruction.modifier)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                    {currentInstruction.type === 'turn' 
                      ? `Turn ${currentInstruction.modifier}`
                      : currentInstruction.type === 'arrive'
                        ? 'Arriving'
                        : currentInstruction.type === 'continue'
                          ? 'Continue straight'
                          : currentInstruction.type.charAt(0).toUpperCase() + currentInstruction.type.slice(1)
                    }
                  </p>
                  {currentInstruction.roadName && (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      onto {currentInstruction.roadName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentInstruction.distance < 1000 
                      ? `${Math.round(currentInstruction.distance)} m`
                      : `${(currentInstruction.distance / 1000).toFixed(1)} km`
                    }
                  </p>
                </div>
                {/* Repeat button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onAnnounce(currentInstruction)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSpeaking 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Repeat instruction</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Upcoming instructions (expandable) */}
              <AnimatePresence>
                {isExpanded && upcomingInstructions.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-border space-y-2"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Upcoming
                    </p>
                    {upcomingInstructions.slice(1).map((instruction, idx) => (
                      <motion.div
                        key={instruction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span className="text-base">{getDirectionIcon(instruction.type, instruction.modifier)}</span>
                        <span className="truncate flex-1">
                          {instruction.type === 'turn' 
                            ? `Turn ${instruction.modifier}` 
                            : instruction.type.charAt(0).toUpperCase() + instruction.type.slice(1)
                          }
                          {instruction.roadName && ` - ${instruction.roadName}`}
                        </span>
                        <span className="text-[10px] opacity-70">
                          {instruction.distance < 1000 
                            ? `${Math.round(instruction.distance)}m`
                            : `${(instruction.distance / 1000).toFixed(1)}km`
                          }
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expand/collapse button */}
              {upcomingInstructions.length > 1 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mt-2 pt-2 border-t border-border flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      {upcomingInstructions.length - 1} more steps
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Voice toggle button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={onToggle}
                className={`p-3 sm:p-4 rounded-full shadow-lg transition-all ${
                  isEnabled
                    ? isSpeaking 
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 animate-pulse'
                      : 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground border border-border'
                }`}
              >
                {isEnabled ? (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2 px-3 py-2">
              <VolumeIcon className="w-4 h-4 text-primary" />
              <div>
                <p className="font-semibold">{isEnabled ? 'Voice On' : 'Voice Off'}</p>
                <p className="text-xs text-muted-foreground">
                  {isEnabled ? 'Click to mute navigation' : 'Click to enable voice'}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Volume slider (appears on hover/click) */}
          <AnimatePresence>
            {isEnabled && showVolumeSlider && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 100 }}
                exit={{ opacity: 0, width: 0 }}
                className="nav-card px-3 py-2 rounded-full shadow-lg overflow-hidden"
              >
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={10}
                  onValueChange={(value) => onVolumeChange(value[0] / 100)}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Volume adjust button */}
          {isEnabled && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  className="p-2 nav-card rounded-lg shadow-lg hover:bg-muted/50 transition-colors"
                >
                  <VolumeIcon className="w-4 h-4 text-foreground" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Adjust volume</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

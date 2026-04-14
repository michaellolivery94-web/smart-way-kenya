import { motion, AnimatePresence } from "framer-motion";
import { Users, X } from "lucide-react";
import { useState, useEffect } from "react";

const moods = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "rush", emoji: "🏎️", label: "In a Rush" },
  { id: "chill", emoji: "😎", label: "Chill" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "singing", emoji: "🎶", label: "Singing" },
  { id: "coffee", emoji: "☕", label: "Need Coffee" },
  { id: "road-trip", emoji: "🛣️", label: "Road Trip" },
  { id: "new-driver", emoji: "🔰", label: "New Driver" },
];

interface DriverMoodProps {
  isNavigating: boolean;
}

export const DriverMood = ({ isNavigating }: DriverMoodProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState(0);

  // Simulate nearby driver count
  useEffect(() => {
    if (!isNavigating) return;
    setNearbyDrivers(Math.floor(Math.random() * 30) + 15);
    const interval = setInterval(() => {
      setNearbyDrivers(prev => {
        const change = Math.floor(Math.random() * 6) - 2;
        return Math.max(8, Math.min(60, prev + change));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [isNavigating]);

  if (!isNavigating) return null;

  const currentMood = moods.find(m => m.id === selectedMood);

  return (
    <>
      {/* Compact mood + nearby drivers badge */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPicker(true)}
        className="absolute right-2 top-[52px] z-20 flex items-center gap-1.5 px-2.5 py-1.5 nav-card rounded-full shadow-md border border-border/30"
      >
        <span className="text-base">{currentMood?.emoji || "😊"}</span>
        <div className="w-px h-3 bg-border/50" />
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold text-foreground">{nearbyDrivers}</span>
        </div>
      </motion.button>

      {/* Mood Picker */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 nav-card rounded-2xl p-4 w-[280px] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">How are you feeling?</h3>
                <button onClick={() => setShowPicker(false)} className="p-1 rounded-lg hover:bg-secondary">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedMood(mood.id);
                      setShowPicker(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                      selectedMood === mood.id
                        ? "bg-primary/15 border-2 border-primary/40 shadow-sm"
                        : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-[9px] font-medium text-muted-foreground leading-tight text-center">{mood.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{nearbyDrivers}</span> drivers nearby
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, Star, Navigation, ArrowDownUp, X, Locate, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";

interface LocationSearchProps {
  onStartNavigation?: (from: string, to: string) => void;
}

const SUGGESTIONS = [
  { icon: Star, text: "Home - Kilimani", type: "favorite" as const },
  { icon: Star, text: "Work - Westlands", type: "favorite" as const },
  { icon: Clock, text: "JKIA Airport", type: "recent" as const },
  { icon: Clock, text: "Sarit Centre", type: "recent" as const },
  { icon: Clock, text: "Two Rivers Mall", type: "recent" as const },
  { icon: MapPin, text: "Upper Hill", type: "nearby" as const },
  { icon: MapPin, text: "CBD Nairobi", type: "nearby" as const },
  { icon: MapPin, text: "Village Market", type: "nearby" as const },
];

export const LocationSearch = ({ onStartNavigation }: LocationSearchProps) => {
  const [fromLocation, setFromLocation] = useState("Current Location");
  const [toLocation, setToLocation] = useState("");
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceTargetField, setVoiceTargetField] = useState<"from" | "to" | null>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const { 
    isListening, 
    isSupported, 
    interimTranscript,
    startListening, 
    stopListening 
  } = useVoiceInput({
    onResult: (transcript) => {
      if (voiceTargetField === "from") {
        setFromLocation(transcript);
      } else if (voiceTargetField === "to") {
        setToLocation(transcript);
      }
      setVoiceTargetField(null);
      toast.success(`Got it: "${transcript}"`);
    },
    onError: (error) => {
      toast.error(error);
      setVoiceTargetField(null);
    },
  });

  // Update the field with interim transcript while speaking
  useEffect(() => {
    if (isListening && interimTranscript && voiceTargetField) {
      if (voiceTargetField === "from") {
        setFromLocation(interimTranscript);
      } else if (voiceTargetField === "to") {
        setToLocation(interimTranscript);
      }
    }
  }, [interimTranscript, isListening, voiceTargetField]);

  const handleVoiceInput = (field: "from" | "to") => {
    if (isListening && voiceTargetField === field) {
      stopListening();
      setVoiceTargetField(null);
    } else {
      if (isListening) {
        stopListening();
      }
      setVoiceTargetField(field);
      setActiveField(null); // Close suggestions when using voice
      startListening();
      toast.info("Listening... Speak your location", {
        duration: 2000,
      });
    }
  };

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation || "Current Location");
    setToLocation(temp === "Current Location" ? "" : temp);
  };

  const handleSelectSuggestion = (text: string) => {
    if (activeField === "from") {
      setFromLocation(text);
    } else {
      setToLocation(text);
    }
    setActiveField(null);
  };

  const handleUseCurrentLocation = () => {
    setFromLocation("Current Location");
    setActiveField(null);
  };

  const handleStartNavigation = () => {
    if (toLocation && fromLocation) {
      onStartNavigation?.(fromLocation, toLocation);
      setIsExpanded(false);
      setActiveField(null);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => toInputRef.current?.focus(), 100);
  };

  const filteredSuggestions = SUGGESTIONS.filter(s => {
    const query = activeField === "from" ? fromLocation : toLocation;
    if (!query || query === "Current Location") return true;
    return s.text.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="relative w-full">
      {/* Collapsed View - Simple tap to expand */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={handleExpand}
            className="w-full nav-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg font-semibold text-foreground">Where to?</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Search destination</p>
            </div>
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded View - Full search interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="nav-card overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Plan Route</h3>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setActiveField(null);
                }}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Location Inputs */}
            <div className="p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                {/* Route indicators */}
                <div className="flex flex-col items-center py-3 gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-info border-2 border-info-foreground" />
                  <div className="flex-1 w-0.5 bg-border" />
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-success border-2 border-success-foreground" />
                </div>

                {/* Input fields */}
                <div className="flex-1 flex flex-col gap-2">
                  {/* From field */}
                  <div
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-colors cursor-text ${
                      activeField === "from" 
                        ? "bg-secondary ring-2 ring-primary" 
                        : isListening && voiceTargetField === "from"
                        ? "bg-secondary ring-2 ring-success animate-pulse"
                        : "bg-secondary/50 hover:bg-secondary/80"
                    }`}
                    onClick={() => setActiveField("from")}
                  >
                    <Locate className="w-4 h-4 sm:w-5 sm:h-5 text-info flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="From: Current location"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      onFocus={() => setActiveField("from")}
                      className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                    {fromLocation && fromLocation !== "Current Location" && !isListening && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFromLocation("Current Location");
                        }}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                        aria-label="Clear"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    {/* Voice input button for From field */}
                    {isSupported && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoiceInput("from");
                        }}
                        className={`p-2 rounded-full transition-all ${
                          isListening && voiceTargetField === "from"
                            ? "bg-success text-success-foreground animate-pulse"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                        aria-label={isListening && voiceTargetField === "from" ? "Stop listening" : "Voice input"}
                      >
                        {isListening && voiceTargetField === "from" ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* To field */}
                  <div
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-colors cursor-text ${
                      activeField === "to" 
                        ? "bg-secondary ring-2 ring-primary" 
                        : isListening && voiceTargetField === "to"
                        ? "bg-secondary ring-2 ring-success animate-pulse"
                        : "bg-secondary/50 hover:bg-secondary/80"
                    }`}
                    onClick={() => setActiveField("to")}
                  >
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <input
                      ref={toInputRef}
                      type="text"
                      placeholder="To: Where are you going?"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      onFocus={() => setActiveField("to")}
                      className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                    {toLocation && !isListening && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setToLocation("");
                        }}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                        aria-label="Clear"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    {/* Voice input button for To field */}
                    {isSupported && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoiceInput("to");
                        }}
                        className={`p-2 rounded-full transition-all ${
                          isListening && voiceTargetField === "to"
                            ? "bg-success text-success-foreground animate-pulse"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                        aria-label={isListening && voiceTargetField === "to" ? "Stop listening" : "Voice input"}
                      >
                        {isListening && voiceTargetField === "to" ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Swap button */}
                <button
                  onClick={handleSwapLocations}
                  className="self-center p-2 sm:p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  aria-label="Swap locations"
                >
                  <ArrowDownUp className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {activeField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border/50 max-h-[40vh] overflow-y-auto"
                >
                  {/* Current location option for "from" field */}
                  {activeField === "from" && (
                    <button
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 hover:bg-secondary/50 transition-colors text-left border-b border-border/30"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-info/20 flex items-center justify-center">
                        <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium text-foreground">Current Location</p>
                        <p className="text-xs text-muted-foreground">Use GPS location</p>
                      </div>
                    </button>
                  )}

                  {/* Suggestion categories */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {activeField === "to" ? "Suggestions" : "Recent & Favorites"}
                    </p>
                  </div>

                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion.text)}
                      className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 hover:bg-secondary/50 active:bg-secondary transition-colors text-left"
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        suggestion.type === "favorite" 
                          ? "bg-warning/20" 
                          : suggestion.type === "recent"
                          ? "bg-muted"
                          : "bg-success/20"
                      }`}>
                        <suggestion.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          suggestion.type === "favorite" 
                            ? "text-warning" 
                            : suggestion.type === "recent"
                            ? "text-muted-foreground"
                            : "text-success"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-foreground truncate">{suggestion.text}</p>
                        <p className="text-xs text-muted-foreground capitalize">{suggestion.type}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Navigation Button */}
            {!activeField && toLocation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:p-4 border-t border-border/50"
              >
                <button
                  onClick={handleStartNavigation}
                  className="w-full py-4 sm:py-5 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-3"
                >
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  <span className="text-base sm:text-lg font-semibold text-primary-foreground">
                    Start Navigation
                  </span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
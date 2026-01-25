import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Clock, Star, Navigation, ArrowDownUp, X, 
  Locate, Mic, MicOff, Loader2, Building2, MapPinned, Globe 
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useGeocoding, getCurrentPosition, GeocodingResult } from "@/hooks/useGeocoding";
import { toast } from "sonner";

interface LocationSearchProps {
  onStartNavigation?: (from: string, to: string, coords: { 
    origin: { lat: number; lng: number } | null;
    destination: { lat: number; lng: number };
  }) => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
}

interface SavedLocation {
  icon: typeof Star | typeof Clock | typeof MapPin;
  text: string;
  type: "favorite" | "recent" | "nearby";
  lat?: number;
  lng?: number;
}

const SUGGESTIONS: SavedLocation[] = [
  { icon: Star, text: "Sarit Centre, Westlands", type: "favorite", lat: -1.2647, lng: 36.8027 },
  { icon: Star, text: "JKIA Airport", type: "favorite", lat: -1.3192, lng: 36.9258 },
  { icon: Clock, text: "Two Rivers Mall", type: "recent", lat: -1.2112, lng: 36.8058 },
  { icon: Clock, text: "Westgate Mall", type: "recent", lat: -1.2634, lng: 36.8048 },
  { icon: MapPin, text: "KICC, CBD Nairobi", type: "nearby", lat: -1.2864, lng: 36.8172 },
  { icon: MapPin, text: "Village Market", type: "nearby", lat: -1.2289, lng: 36.8031 },
];

export const LocationSearch = ({ onStartNavigation, onLocationSelect }: LocationSearchProps) => {
  const [fromLocation, setFromLocation] = useState("Current Location");
  const [toLocation, setToLocation] = useState("");
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceTargetField, setVoiceTargetField] = useState<"from" | "to" | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Coordinates state
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const toInputRef = useRef<HTMLInputElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);

  // Geocoding hooks for both fields
  const fromGeocoding = useGeocoding({ debounceMs: 250, limit: 6 });
  const toGeocoding = useGeocoding({ debounceMs: 250, limit: 6 });

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
        fromGeocoding.search(transcript);
      } else if (voiceTargetField === "to") {
        setToLocation(transcript);
        toGeocoding.search(transcript);
      }
      setVoiceTargetField(null);
      toast.success(`Searching: "${transcript}"`);
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

  // Search as user types
  const handleFromChange = useCallback((value: string) => {
    setFromLocation(value);
    setOriginCoords(null);
    if (value !== "Current Location") {
      fromGeocoding.search(value);
    } else {
      fromGeocoding.clearResults();
    }
  }, [fromGeocoding]);

  const handleToChange = useCallback((value: string) => {
    setToLocation(value);
    setDestinationCoords(null);
    toGeocoding.search(value);
  }, [toGeocoding]);

  const handleVoiceInput = (field: "from" | "to") => {
    if (isListening && voiceTargetField === field) {
      stopListening();
      setVoiceTargetField(null);
    } else {
      if (isListening) {
        stopListening();
      }
      setVoiceTargetField(field);
      setActiveField(field);
      startListening();
      toast.info("Listening... Speak your location", { duration: 2000 });
    }
  };

  const handleSwapLocations = () => {
    const tempLocation = fromLocation;
    const tempCoords = originCoords;
    
    setFromLocation(toLocation || "Current Location");
    setOriginCoords(toLocation ? destinationCoords : null);
    
    setToLocation(tempLocation === "Current Location" ? "" : tempLocation);
    setDestinationCoords(tempLocation === "Current Location" ? null : tempCoords);
    
    fromGeocoding.clearResults();
    toGeocoding.clearResults();
  };

  const handleSelectGeocodingResult = (result: GeocodingResult, field: "from" | "to") => {
    const coords = { lat: result.lat, lng: result.lng };
    
    if (field === "from") {
      setFromLocation(result.shortName);
      setOriginCoords(coords);
      fromGeocoding.clearResults();
    } else {
      setToLocation(result.shortName);
      setDestinationCoords(coords);
      toGeocoding.clearResults();
      
      // Preview location on map
      onLocationSelect?.({ ...coords, name: result.shortName });
    }
    
    setActiveField(null);
    toast.success(`Selected: ${result.shortName}`);
  };

  const handleSelectSuggestion = (suggestion: SavedLocation, field: "from" | "to") => {
    if (suggestion.lat && suggestion.lng) {
      const coords = { lat: suggestion.lat, lng: suggestion.lng };
      
      if (field === "from") {
        setFromLocation(suggestion.text);
        setOriginCoords(coords);
        fromGeocoding.clearResults();
      } else {
        setToLocation(suggestion.text);
        setDestinationCoords(coords);
        toGeocoding.clearResults();
        
        // Preview on map
        onLocationSelect?.({ ...coords, name: suggestion.text });
      }
      
      setActiveField(null);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentPosition();
      setOriginCoords(position);
      setFromLocation("Current Location");
      fromGeocoding.clearResults();
      setActiveField(null);
      toast.success("Location found!");
    } catch (error) {
      toast.error("Could not get your location. Please enable GPS.");
      console.error("Geolocation error:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleStartNavigation = async () => {
    if (!toLocation || !destinationCoords) {
      toast.error("Please select a destination");
      return;
    }

    let finalOriginCoords = originCoords;

    // Get current location if using "Current Location"
    if (fromLocation === "Current Location" && !originCoords) {
      setIsGettingLocation(true);
      try {
        finalOriginCoords = await getCurrentPosition();
        setOriginCoords(finalOriginCoords);
      } catch (error) {
        toast.error("Could not get your location. Please enable GPS or enter a starting point.");
        setIsGettingLocation(false);
        return;
      }
      setIsGettingLocation(false);
    }

    onStartNavigation?.(fromLocation, toLocation, {
      origin: finalOriginCoords,
      destination: destinationCoords,
    });
    
    setIsExpanded(false);
    setActiveField(null);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => toInputRef.current?.focus(), 100);
  };

  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case "amenity":
      case "shop":
      case "building":
        return Building2;
      case "highway":
      case "road":
        return MapPinned;
      default:
        return MapPin;
    }
  };

  // Determine which results to show
  const currentResults = activeField === "from" ? fromGeocoding.results : toGeocoding.results;
  const isSearching = activeField === "from" ? fromGeocoding.isLoading : toGeocoding.isLoading;
  const currentQuery = activeField === "from" ? fromLocation : toLocation;

  // Filter saved suggestions based on query
  const filteredSuggestions = SUGGESTIONS.filter(s => {
    if (!currentQuery || currentQuery === "Current Location") return true;
    return s.text.toLowerCase().includes(currentQuery.toLowerCase());
  });

  return (
    <div className="relative w-full">
      {/* Collapsed View */}
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
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Search any location</p>
            </div>
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded View */}
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
                  fromGeocoding.clearResults();
                  toGeocoding.clearResults();
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
                    onClick={() => {
                      setActiveField("from");
                      fromInputRef.current?.focus();
                    }}
                  >
                    {originCoords ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-info flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <Locate className="w-4 h-4 sm:w-5 sm:h-5 text-info flex-shrink-0" />
                    )}
                    <input
                      ref={fromInputRef}
                      type="text"
                      placeholder="From: Current location"
                      value={fromLocation}
                      onChange={(e) => handleFromChange(e.target.value)}
                      onFocus={() => setActiveField("from")}
                      className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                    {fromGeocoding.isLoading && (
                      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                    {fromLocation && fromLocation !== "Current Location" && !isListening && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFromLocation("Current Location");
                          setOriginCoords(null);
                          fromGeocoding.clearResults();
                        }}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                        aria-label="Clear"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
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
                    onClick={() => {
                      setActiveField("to");
                      toInputRef.current?.focus();
                    }}
                  >
                    {destinationCoords ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    )}
                    <input
                      ref={toInputRef}
                      type="text"
                      placeholder="To: Where are you going?"
                      value={toLocation}
                      onChange={(e) => handleToChange(e.target.value)}
                      onFocus={() => setActiveField("to")}
                      className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                    {toGeocoding.isLoading && (
                      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                    {toLocation && !isListening && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setToLocation("");
                          setDestinationCoords(null);
                          toGeocoding.clearResults();
                        }}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                        aria-label="Clear"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
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

            {/* Search Results & Suggestions */}
            <AnimatePresence>
              {activeField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border/50 max-h-[45vh] overflow-y-auto"
                >
                  {/* Current location option for "from" field */}
                  {activeField === "from" && (
                    <button
                      onClick={handleUseCurrentLocation}
                      disabled={isGettingLocation}
                      className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 hover:bg-secondary/50 transition-colors text-left border-b border-border/30 disabled:opacity-50"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-info/20 flex items-center justify-center">
                        {isGettingLocation ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-info animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium text-foreground">
                          {isGettingLocation ? "Getting location..." : "Current Location"}
                        </p>
                        <p className="text-xs text-muted-foreground">Use GPS location</p>
                      </div>
                    </button>
                  )}

                  {/* Live Search Results */}
                  {currentResults.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-secondary/30">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          Search Results
                        </p>
                      </div>
                      {currentResults.map((result) => {
                        const ResultIcon = getResultIcon(result.type);
                        return (
                          <motion.button
                            key={result.placeId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleSelectGeocodingResult(result, activeField)}
                            className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 hover:bg-primary/10 active:bg-primary/20 transition-colors text-left"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <ResultIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base text-foreground font-medium truncate">
                                {result.shortName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {result.displayName}
                              </p>
                            </div>
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </motion.button>
                        );
                      })}
                    </>
                  )}

                  {/* Loading State */}
                  {isSearching && currentQuery && currentQuery !== "Current Location" && currentQuery.length >= 2 && (
                    <div className="px-4 py-8 flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Searching locations...</p>
                    </div>
                  )}

                  {/* No Results */}
                  {!isSearching && currentResults.length === 0 && currentQuery && currentQuery !== "Current Location" && currentQuery.length >= 2 && (
                    <div className="px-4 py-6 text-center">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No locations found for "{currentQuery}"</p>
                      <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                  )}

                  {/* Saved Suggestions */}
                  {(!currentQuery || currentQuery === "Current Location" || currentResults.length === 0) && filteredSuggestions.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-secondary/30">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {activeField === "to" ? "Popular Destinations" : "Saved Places"}
                        </p>
                      </div>
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion, activeField)}
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
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Navigation Button */}
            {!activeField && toLocation && destinationCoords && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:p-4 border-t border-border/50"
              >
                <motion.button
                  onClick={handleStartNavigation}
                  disabled={isGettingLocation}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17,
                    mass: 0.8
                  }}
                  className="relative w-full py-4 sm:py-5 rounded-xl bg-primary overflow-hidden shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none group"
                >
                  {/* Ripple/Glow Effect on Tap */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/20 to-primary-foreground/0"
                    initial={{ x: "-100%", opacity: 0 }}
                    whileTap={{ 
                      x: "100%", 
                      opacity: 1,
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                  />
                  
                  {/* Pulse Ring Effect */}
                  <span className="absolute inset-0 rounded-xl ring-2 ring-primary-foreground/0 group-active:ring-primary-foreground/30 transition-all duration-150" />
                  
                  {/* Button Content */}
                  <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground animate-spin" />
                        <span className="text-base sm:text-lg font-semibold text-primary-foreground">
                          Getting Location...
                        </span>
                      </>
                    ) : (
                      <>
                        <motion.span
                          animate={{ 
                            rotate: [0, -10, 10, -5, 0],
                          }}
                          transition={{ 
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        >
                          <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                        </motion.span>
                        <span className="text-base sm:text-lg font-semibold text-primary-foreground">
                          Start Navigation
                        </span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* Hint when destination not selected */}
            {!activeField && toLocation && !destinationCoords && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border-t border-border/50 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Tap the destination field to search and select a location
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

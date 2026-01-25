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
      {/* Collapsed View - Enhanced for accessibility */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={handleExpand}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            className="w-full nav-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 text-left shadow-lg"
          >
            {/* Large, color-coded search icon */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/40">
              <Search className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              {/* Pulsing indicator */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary/50"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg sm:text-xl font-bold text-foreground">Where to?</p>
              <p className="text-sm sm:text-base text-muted-foreground truncate flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Tap to search
              </p>
            </div>
            {/* Visual arrow indicator */}
            <motion.div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
            </motion.div>
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
            {/* Header - Enhanced with visual guide */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">Plan Your Trip</h3>
                  <p className="text-xs text-muted-foreground">Set start & destination</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setActiveField(null);
                  fromGeocoding.clearResults();
                  toGeocoding.clearResults();
                }}
                className="w-10 h-10 rounded-xl bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-destructive" />
              </button>
            </div>

            {/* Location Inputs - Enhanced with larger touch targets */}
            <div className="p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4">
                {/* Route indicators - Larger and more visible */}
                <div className="flex flex-col items-center py-4 gap-1">
                  {/* Blue circle for START */}
                  <div className="relative">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-info border-3 border-info shadow-lg shadow-info/30" />
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-info"
                      animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  {/* Dashed connector line */}
                  <div className="flex-1 w-1 bg-gradient-to-b from-info via-muted to-success rounded-full" />
                  {/* Green circle for END */}
                  <div className="relative">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success border-3 border-success shadow-lg shadow-success/30" />
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-success"
                      animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Input fields - Enhanced with larger touch targets */}
                <div className="flex-1 flex flex-col gap-3">
                  {/* From field - Enhanced */}
                  <div
                    className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all cursor-text border-2 ${
                      activeField === "from" 
                        ? "bg-info/10 border-info ring-2 ring-info/30" 
                        : isListening && voiceTargetField === "from"
                        ? "bg-success/10 border-success ring-2 ring-success/30 animate-pulse"
                        : "bg-secondary/50 border-transparent hover:bg-secondary/80 hover:border-info/30"
                    }`}
                    onClick={() => {
                      setActiveField("from");
                      fromInputRef.current?.focus();
                    }}
                  >
                    {/* Visual icon indicator */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      originCoords ? "bg-info" : "bg-info/20"
                    }`}>
                      {originCoords ? (
                        <div className="w-3 h-3 rounded-full bg-white shadow-lg" />
                      ) : (
                        <Locate className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-info font-semibold uppercase tracking-wide mb-1">Start From</p>
                      <input
                        ref={fromInputRef}
                        type="text"
                        placeholder="Your location"
                        value={fromLocation}
                        onChange={(e) => handleFromChange(e.target.value)}
                        onFocus={() => setActiveField("from")}
                        className="w-full bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
                      />
                    </div>
                    {fromGeocoding.isLoading && (
                      <Loader2 className="w-5 h-5 text-info animate-spin" />
                    )}
                    {fromLocation && fromLocation !== "Current Location" && !isListening && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFromLocation("Current Location");
                          setOriginCoords(null);
                          fromGeocoding.clearResults();
                        }}
                        className="w-9 h-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                        aria-label="Clear"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                    {isSupported && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoiceInput("from");
                        }}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
                          isListening && voiceTargetField === "from"
                            ? "bg-success text-success-foreground animate-pulse shadow-lg shadow-success/30"
                            : "bg-primary/20 hover:bg-primary/30 text-primary"
                        }`}
                        aria-label={isListening && voiceTargetField === "from" ? "Stop listening" : "Voice input"}
                      >
                        {isListening && voiceTargetField === "from" ? (
                          <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* To field - Enhanced */}
                  <div
                    className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all cursor-text border-2 ${
                      activeField === "to" 
                        ? "bg-success/10 border-success ring-2 ring-success/30" 
                        : isListening && voiceTargetField === "to"
                        ? "bg-success/10 border-success ring-2 ring-success/30 animate-pulse"
                        : "bg-secondary/50 border-transparent hover:bg-secondary/80 hover:border-success/30"
                    }`}
                    onClick={() => {
                      setActiveField("to");
                      toInputRef.current?.focus();
                    }}
                  >
                    {/* Visual icon indicator */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      destinationCoords ? "bg-success" : "bg-success/20"
                    }`}>
                      {destinationCoords ? (
                        <div className="w-3 h-3 rounded-full bg-white shadow-lg" />
                      ) : (
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-success font-semibold uppercase tracking-wide mb-1">Going To</p>
                      <input
                        ref={toInputRef}
                        type="text"
                        placeholder="Where are you going?"
                        value={toLocation}
                        onChange={(e) => handleToChange(e.target.value)}
                        onFocus={() => setActiveField("to")}
                        className="w-full bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
                      />
                    </div>
                    {toGeocoding.isLoading && (
                      <Loader2 className="w-5 h-5 text-success animate-spin" />
                    )}
                    {toLocation && !isListening && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setToLocation("");
                          setDestinationCoords(null);
                          toGeocoding.clearResults();
                        }}
                        className="w-9 h-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                        aria-label="Clear"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                    {isSupported && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoiceInput("to");
                        }}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
                          isListening && voiceTargetField === "to"
                            ? "bg-success text-success-foreground animate-pulse shadow-lg shadow-success/30"
                            : "bg-primary/20 hover:bg-primary/30 text-primary"
                        }`}
                        aria-label={isListening && voiceTargetField === "to" ? "Stop listening" : "Voice input"}
                      >
                        {isListening && voiceTargetField === "to" ? (
                          <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Swap button - Enhanced */}
                <motion.button
                  onClick={handleSwapLocations}
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  whileHover={{ scale: 1.1 }}
                  className="self-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary hover:bg-primary/20 border-2 border-border hover:border-primary/50 flex items-center justify-center transition-colors shadow-lg"
                  aria-label="Swap locations"
                >
                  <ArrowDownUp className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Search Results & Suggestions - Enhanced */}
            <AnimatePresence>
              {activeField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border/50 max-h-[50vh] overflow-y-auto"
                >
                  {/* Current location option for "from" field - Enhanced */}
                  {activeField === "from" && (
                    <motion.button
                      onClick={handleUseCurrentLocation}
                      disabled={isGettingLocation}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-4 px-5 py-5 hover:bg-info/10 active:bg-info/15 transition-colors text-left border-b border-border/30 disabled:opacity-50"
                    >
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-info/30 to-info/10 flex items-center justify-center border-2 border-info/30">
                        {isGettingLocation ? (
                          <Loader2 className="w-7 h-7 text-info animate-spin" />
                        ) : (
                          <Navigation className="w-7 h-7 text-info" />
                        )}
                        {!isGettingLocation && (
                          <motion.div 
                            className="absolute inset-0 rounded-2xl border-2 border-info/50"
                            animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-foreground">
                          {isGettingLocation ? "Finding you..." : "Use My Location"}
                        </p>
                        <p className="text-sm text-info flex items-center gap-2 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-info animate-pulse" />
                          GPS location
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                        <Locate className="w-6 h-6 text-info" />
                      </div>
                    </motion.button>
                  )}

                  {/* Live Search Results - Enhanced */}
                  {currentResults.length > 0 && (
                    <>
                      <div className="px-5 py-3 bg-gradient-to-r from-primary/10 to-transparent">
                        <p className="text-sm font-semibold text-primary flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Found {currentResults.length} places
                        </p>
                      </div>
                      {currentResults.map((result, index) => {
                        const ResultIcon = getResultIcon(result.type);
                        return (
                          <motion.button
                            key={result.placeId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSelectGeocodingResult(result, activeField)}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-primary/10 active:bg-primary/20 transition-colors text-left border-b border-border/20"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
                              <ResultIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base sm:text-lg text-foreground font-semibold truncate">
                                {result.shortName}
                              </p>
                              <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {result.displayName}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-success" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </>
                  )}

                  {/* Loading State - Enhanced */}
                  {isSearching && currentQuery && currentQuery !== "Current Location" && currentQuery.length >= 2 && (
                    <div className="px-5 py-10 flex flex-col items-center gap-3">
                      <div className="relative">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <motion.div 
                          className="absolute inset-0 rounded-full border-4 border-primary/20"
                          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                      <p className="text-base text-muted-foreground font-medium">Searching...</p>
                    </div>
                  )}

                  {/* No Results - Enhanced */}
                  {!isSearching && currentResults.length === 0 && currentQuery && currentQuery !== "Current Location" && currentQuery.length >= 2 && (
                    <div className="px-5 py-10 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-base text-foreground font-medium">No places found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try different words</p>
                    </div>
                  )}

                  {/* Saved Suggestions - Enhanced */}
                  {(!currentQuery || currentQuery === "Current Location" || currentResults.length === 0) && filteredSuggestions.length > 0 && (
                    <>
                      <div className="px-5 py-3 bg-gradient-to-r from-warning/10 to-transparent">
                        <p className="text-sm font-semibold text-warning flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {activeField === "to" ? "Popular Places" : "Your Places"}
                        </p>
                      </div>
                      {filteredSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion, activeField)}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/50 active:bg-secondary transition-colors text-left border-b border-border/20"
                        >
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border-2 ${
                            suggestion.type === "favorite" 
                              ? "bg-gradient-to-br from-warning/20 to-warning/5 border-warning/30" 
                              : suggestion.type === "recent"
                              ? "bg-gradient-to-br from-muted to-muted/50 border-border"
                              : "bg-gradient-to-br from-success/20 to-success/5 border-success/30"
                          }`}>
                            <suggestion.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${
                              suggestion.type === "favorite" 
                                ? "text-warning" 
                                : suggestion.type === "recent"
                                ? "text-muted-foreground"
                                : "text-success"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base sm:text-lg text-foreground font-medium truncate">{suggestion.text}</p>
                            <p className={`text-sm capitalize mt-0.5 ${
                              suggestion.type === "favorite" ? "text-warning" : 
                              suggestion.type === "recent" ? "text-muted-foreground" : "text-success"
                            }`}>
                              {suggestion.type === "favorite" ? "⭐ Favorite" : 
                               suggestion.type === "recent" ? "🕐 Recent" : "📍 Nearby"}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Navigation Button - Enhanced for accessibility */}
            {!activeField && toLocation && destinationCoords && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 border-t border-border/50 bg-gradient-to-t from-success/5 to-transparent"
              >
                {/* Route summary before button */}
                <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-info" />
                    <span className="text-muted-foreground truncate max-w-[100px]">{fromLocation}</span>
                  </div>
                  <motion.div 
                    className="flex items-center gap-1 text-primary"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <span>→</span>
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-success" />
                    <span className="text-foreground font-medium truncate max-w-[100px]">{toLocation}</span>
                  </div>
                </div>
                
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
                  className="relative w-full py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-primary via-primary to-warning/80 overflow-hidden shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 disabled:opacity-50 disabled:shadow-none group"
                >
                  {/* Animated background shimmer */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  
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
                  <motion.span 
                    className="absolute inset-0 rounded-2xl border-4 border-primary-foreground/30"
                    animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Button Content */}
                  <span className="relative flex items-center justify-center gap-3 sm:gap-4">
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground animate-spin" />
                        <span className="text-lg sm:text-xl font-bold text-primary-foreground">
                          Finding you...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                          <motion.div
                            animate={{ 
                              rotate: [0, -10, 10, -5, 0],
                            }}
                            transition={{ 
                              duration: 0.5,
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                          >
                            <Navigation className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                          </motion.div>
                        </div>
                        <div className="text-left">
                          <span className="block text-lg sm:text-xl font-bold text-primary-foreground">
                            GO NOW
                          </span>
                          <span className="block text-xs sm:text-sm text-primary-foreground/80 font-medium">
                            Start Navigation
                          </span>
                        </div>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* Hint when destination not selected - Enhanced */}
            {!activeField && toLocation && !destinationCoords && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 border-t border-border/50 text-center bg-warning/5"
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <MapPin className="w-6 h-6 text-warning" />
                  </motion.div>
                  <p className="text-base text-foreground font-medium">
                    Tap destination to select
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

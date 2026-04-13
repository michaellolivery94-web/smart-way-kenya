import { motion, AnimatePresence } from "framer-motion";
import { 
  Fuel, Coffee, ShoppingBag, Banknote, Hospital, 
  ParkingCircle, X, Search, Loader2, MapPin 
} from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface NearbyPlace {
  name: string;
  type: string;
  distance: string;
  lat: number;
  lng: number;
}

interface SearchAlongRouteProps {
  isNavigating: boolean;
  userLocation: [number, number] | null;
  onSelectPlace?: (place: { lat: number; lng: number; name: string }) => void;
}

const categories = [
  { id: "fuel", icon: Fuel, label: "Fuel", color: "bg-warning/15", iconColor: "text-warning", query: "fuel station" },
  { id: "food", icon: Coffee, label: "Food", color: "bg-success/15", iconColor: "text-success", query: "restaurant" },
  { id: "atm", icon: Banknote, label: "ATM", color: "bg-info/15", iconColor: "text-info", query: "atm" },
  { id: "parking", icon: ParkingCircle, label: "Parking", color: "bg-primary/15", iconColor: "text-primary", query: "parking" },
  { id: "pharmacy", icon: Hospital, label: "Pharmacy", color: "bg-destructive/15", iconColor: "text-destructive", query: "pharmacy" },
  { id: "shop", icon: ShoppingBag, label: "Shop", color: "bg-secondary", iconColor: "text-foreground", query: "supermarket" },
];

// Simulated nearby places for Nairobi
const SIMULATED_PLACES: Record<string, NearbyPlace[]> = {
  fuel: [
    { name: "Shell Westlands", type: "fuel", distance: "350m", lat: -1.2689, lng: 36.8092 },
    { name: "Total Ngong Road", type: "fuel", distance: "1.2km", lat: -1.3012, lng: 36.7892 },
    { name: "Rubis Parklands", type: "fuel", distance: "800m", lat: -1.2620, lng: 36.8150 },
  ],
  food: [
    { name: "Java House Westlands", type: "food", distance: "200m", lat: -1.2670, lng: 36.8050 },
    { name: "Artcaffé Westgate", type: "food", distance: "450m", lat: -1.2634, lng: 36.8048 },
    { name: "KFC Sarit Centre", type: "food", distance: "600m", lat: -1.2647, lng: 36.8027 },
  ],
  atm: [
    { name: "KCB Westlands", type: "atm", distance: "150m", lat: -1.2665, lng: 36.8040 },
    { name: "Equity Bank Parklands", type: "atm", distance: "400m", lat: -1.2610, lng: 36.8120 },
    { name: "Co-op ATM Sarit", type: "atm", distance: "650m", lat: -1.2647, lng: 36.8030 },
  ],
  parking: [
    { name: "Sarit Centre Parking", type: "parking", distance: "500m", lat: -1.2647, lng: 36.8025 },
    { name: "Westgate Parking", type: "parking", distance: "750m", lat: -1.2634, lng: 36.8050 },
  ],
  pharmacy: [
    { name: "Pharmaplus Westlands", type: "pharmacy", distance: "300m", lat: -1.2660, lng: 36.8035 },
    { name: "Goodlife Pharmacy", type: "pharmacy", distance: "550m", lat: -1.2640, lng: 36.8060 },
  ],
  shop: [
    { name: "Naivas Westlands", type: "shop", distance: "250m", lat: -1.2670, lng: 36.8060 },
    { name: "Carrefour Sarit", type: "shop", distance: "600m", lat: -1.2647, lng: 36.8027 },
  ],
};

export const SearchAlongRoute = ({ isNavigating, userLocation, onSelectPlace }: SearchAlongRouteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorySelect = useCallback(async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setPlaces(SIMULATED_PLACES[categoryId] || []);
    setIsLoading(false);
  }, []);

  const handlePlaceSelect = (place: NearbyPlace) => {
    onSelectPlace?.({ lat: place.lat, lng: place.lng, name: place.name });
    toast.success(`Adding stop: ${place.name}`, {
      description: `${place.distance} from your route`,
    });
    setIsOpen(false);
    setSelectedCategory(null);
  };

  if (!isNavigating) return null;

  return (
    <>
      {/* Trigger Button - small pill above navigation panel */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed right-4 bottom-[340px] sm:bottom-[400px] z-20 nav-card px-3 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-muted/50 transition-colors"
          >
            <Search className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Along Route</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40"
              onClick={() => { setIsOpen(false); setSelectedCategory(null); }}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-4 left-4 right-4 z-50 nav-card rounded-2xl p-4 shadow-2xl max-h-[70vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-base font-semibold text-foreground">Search Along Route</h3>
                </div>
                <button
                  onClick={() => { setIsOpen(false); setSelectedCategory(null); }}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      selectedCategory === cat.id
                        ? "bg-primary/15 ring-2 ring-primary"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${cat.color} flex items-center justify-center`}>
                      <cat.icon className={`w-4.5 h-4.5 ${cat.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{cat.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Results */}
              {selectedCategory && (
                <div className="border-t border-border/50 pt-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground ml-2">Finding nearby places...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                      {places.map((place, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handlePlaceSelect(place)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{place.name}</p>
                            <p className="text-xs text-muted-foreground">{place.distance} away</p>
                          </div>
                          <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10">
                            Go
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

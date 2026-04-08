import { motion } from "framer-motion";
import { Hospital, Fuel, UtensilsCrossed, Landmark, ShoppingBag, Car } from "lucide-react";
import { useGeocoding } from "@/hooks/useGeocoding";
import { toast } from "sonner";

interface QuickCategoriesProps {
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
  onStartNavigation?: (from: string, to: string, coords: {
    origin: { lat: number; lng: number } | null;
    destination: { lat: number; lng: number };
  }) => void;
}

const CATEGORIES = [
  { icon: Hospital, label: "Hospital", query: "hospital Nairobi", color: "text-destructive", bg: "bg-destructive/15 border-destructive/30" },
  { icon: Fuel, label: "Fuel", query: "petrol station Nairobi", color: "text-warning", bg: "bg-warning/15 border-warning/30" },
  { icon: UtensilsCrossed, label: "Food", query: "restaurant Nairobi", color: "text-primary", bg: "bg-primary/15 border-primary/30" },
  { icon: Landmark, label: "ATM", query: "ATM bank Nairobi", color: "text-info", bg: "bg-info/15 border-info/30" },
  { icon: ShoppingBag, label: "Mall", query: "shopping mall Nairobi", color: "text-success", bg: "bg-success/15 border-success/30" },
  { icon: Car, label: "Parking", query: "parking Nairobi", color: "text-muted-foreground", bg: "bg-secondary border-border" },
];

export const QuickCategories = ({ onLocationSelect }: QuickCategoriesProps) => {
  const geocoding = useGeocoding({ debounceMs: 0, limit: 5 });

  const handleCategoryTap = async (category: typeof CATEGORIES[0]) => {
    toast.info(`Searching nearby ${category.label}...`, { duration: 1500 });
    
    try {
      // Use Nominatim directly for category search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(category.query)}&viewbox=36.65,-1.45,37.10,-1.15&bounded=1&limit=1`
      );
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name.split(',')[0],
        };
        onLocationSelect?.(location);
        toast.success(`Found: ${location.name}`);
      } else {
        toast.error(`No ${category.label.toLowerCase()} found nearby`);
      }
    } catch {
      toast.error("Search failed. Check your connection.");
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat, i) => (
        <motion.button
          key={cat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => handleCategoryTap(cat)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all hover:scale-105 ${cat.bg}`}
        >
          <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
          <span className="text-foreground">{cat.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

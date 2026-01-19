import { motion } from "framer-motion";
import { Search, MapPin, Clock, Star } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  recentSearches?: string[];
}

export const SearchBar = ({ onSearch, recentSearches = [] }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  const suggestions = [
    { icon: Star, text: "Westlands, Nairobi", type: "favorite" },
    { icon: Clock, text: "JKIA Airport", type: "recent" },
    { icon: Clock, text: "Sarit Centre", type: "recent" },
    { icon: MapPin, text: "Upper Hill", type: "nearby" },
  ];

  return (
    <div className="relative w-full">
      <motion.div
        className="nav-card overflow-hidden"
        animate={{ 
          boxShadow: isFocused 
            ? "0 8px 32px -8px hsl(32 95% 55% / 0.3)" 
            : "0 8px 32px -8px hsl(0 0% 0% / 0.5)" 
        }}
      >
        <div className="flex items-center gap-3 p-4">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Where to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-lg font-medium focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion.text);
                  onSearch?.(suggestion.text);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <suggestion.icon className={`w-4 h-4 ${
                  suggestion.type === "favorite" ? "text-warning" : "text-muted-foreground"
                }`} />
                <span className="text-sm text-foreground">{suggestion.text}</span>
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

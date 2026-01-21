import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, Plus, Minus, Navigation2, Layers, MapPin, 
  Building2, Fuel, ShoppingBag, Trees, Locate, Satellite,
  Map as MapIcon, TrafficCone, Mountain, Moon
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  isNavigating?: boolean;
  isPro?: boolean;
  origin?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
}

// Nairobi coordinates
const NAIROBI_CENTER: [number, number] = [-1.2921, 36.8219];

// POI locations in Nairobi
const NAIROBI_POIS = [
  { name: "Sarit Centre", lat: -1.2647, lng: 36.8027, icon: ShoppingBag, color: "warning" },
  { name: "Westgate Mall", lat: -1.2634, lng: 36.8048, icon: ShoppingBag, color: "warning" },
  { name: "The Hub Karen", lat: -1.3273, lng: 36.7127, icon: ShoppingBag, color: "warning" },
  { name: "KICC", lat: -1.2864, lng: 36.8172, icon: Building2, color: "muted-foreground" },
  { name: "Nation Centre", lat: -1.2844, lng: 36.8234, icon: Building2, color: "muted-foreground" },
  { name: "Shell Westlands", lat: -1.2689, lng: 36.8092, icon: Fuel, color: "warning" },
  { name: "Total Ngong Rd", lat: -1.3012, lng: 36.7892, icon: Fuel, color: "warning" },
  { name: "Uhuru Park", lat: -1.2891, lng: 36.8126, icon: Trees, color: "success" },
  { name: "Central Park", lat: -1.2755, lng: 36.8182, icon: Trees, color: "success" },
  { name: "Karura Forest", lat: -1.2355, lng: 36.8327, icon: Trees, color: "success" },
];

// Map tile providers
const MAP_TILES = {
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: "Streets"
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
    name: "Satellite"
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    name: "Dark"
  },
  terrain: {
    url: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
    attribution: '&copy; Stamen Design',
    name: "Terrain"
  }
};

type MapTileType = keyof typeof MAP_TILES;

export const MapView = ({ 
  isNavigating = false, 
  isPro = false,
  origin = null,
  destination = null 
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  const [mapTileType, setMapTileType] = useState<MapTileType>("dark");
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(45);
  const [userLocation, setUserLocation] = useState<[number, number]>(NAIROBI_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: NAIROBI_CENTER,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add tile layer
    const tileLayer = L.tileLayer(MAP_TILES[mapTileType].url, {
      attribution: MAP_TILES[mapTileType].attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    
    // Create layer groups for routes and markers
    routeLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);

    // Add attribution
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    mapInstanceRef.current = map;

    // Add current location marker
    addCurrentLocationMarker(map, userLocation);

    // Add POI markers
    addPOIMarkers(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when type changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.setUrl(MAP_TILES[mapTileType].url);
  }, [mapTileType]);

  // Handle navigation route
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    if (isNavigating) {
      // Demo route in Nairobi (Westlands to CBD)
      const startPoint: [number, number] = origin 
        ? [origin.lat, origin.lng] 
        : [-1.2689, 36.8092]; // Westlands
      const endPoint: [number, number] = destination 
        ? [destination.lat, destination.lng] 
        : [-1.2864, 36.8172]; // KICC

      // Fetch route from OSRM
      fetchRoute(startPoint, endPoint);
    }
  }, [isNavigating, origin, destination]);

  // Simulate speed changes in Pro mode
  useEffect(() => {
    if (!isPro || !isNavigating) return;

    const interval = setInterval(() => {
      setCurrentSpeed(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(20, Math.min(80, prev + change));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPro, isNavigating]);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0 && routeLayerRef.current) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        // Add route polyline with gradient effect
        const routeLine = L.polyline(coordinates, {
          color: '#10B981',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        });

        // Add glow effect
        const glowLine = L.polyline(coordinates, {
          color: '#10B981',
          weight: 14,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round',
        });

        routeLayerRef.current.addLayer(glowLine);
        routeLayerRef.current.addLayer(routeLine);

        // Add destination marker
        const destIcon = L.divIcon({
          html: `<div class="relative">
            <div class="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>`,
          className: 'custom-destination-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        L.marker(coordinates[coordinates.length - 1], { icon: destIcon })
          .addTo(routeLayerRef.current);

        // Calculate and set route info
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.round(route.duration / 60);
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${durationMins} min`
        });

        // Fit map to route bounds
        if (mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(routeLine.getBounds(), { 
            padding: [50, 50],
            maxZoom: 15
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
      // Fallback: draw straight line
      if (routeLayerRef.current) {
        const fallbackLine = L.polyline([start, end], {
          color: '#10B981',
          weight: 5,
          opacity: 0.8,
          dashArray: '10, 10',
        });
        routeLayerRef.current.addLayer(fallbackLine);
      }
    }
  };

  const addCurrentLocationMarker = (map: L.Map, location: [number, number]) => {
    const locationIcon = L.divIcon({
      html: `<div class="relative">
        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" style="width: 32px; height: 32px; margin: -8px;"></div>
        <div class="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      </div>`,
      className: 'custom-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker(location, { icon: locationIcon, zIndexOffset: 1000 }).addTo(map);
  };

  const addPOIMarkers = (map: L.Map) => {
    if (!markerLayerRef.current) return;

    NAIROBI_POIS.forEach((poi) => {
      const colorClass = poi.color === 'success' ? '#10B981' 
        : poi.color === 'warning' ? '#F59E0B' 
        : '#6B7280';

      const poiIcon = L.divIcon({
        html: `<div class="bg-card/90 backdrop-blur px-2 py-1.5 rounded-lg shadow-lg border border-border flex items-center gap-1.5 whitespace-nowrap">
          <div class="w-3 h-3" style="color: ${colorClass}">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
              ${poi.icon === ShoppingBag ? '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>' 
                : poi.icon === Building2 ? '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'
                : poi.icon === Fuel ? '<path d="M3 22V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14"/><path d="M15 13h1a2 2 0 0 1 2 2v4a1 1 0 0 0 1 1 1 1 0 0 0 1-1v-9a2 2 0 0 0-.59-1.42l-2.83-2.83a2 2 0 0 0-1.42-.59H15"/><path d="M3 22h12"/><path d="M6 10h6"/>'
                : '<path d="M12 2 8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-4-4Z"/><path d="m6 14 3 3 5-5 4 4"/>'}
            </svg>
          </div>
          <span class="text-xs font-medium text-foreground">${poi.name}</span>
        </div>`,
        className: 'custom-poi-marker',
        iconSize: [100, 30],
        iconAnchor: [50, 15],
      });

      L.marker([poi.lat, poi.lng], { icon: poiIcon })
        .addTo(markerLayerRef.current!);
    });
  };

  const handleZoomIn = useCallback(() => {
    mapInstanceRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapInstanceRef.current?.zoomOut();
  }, []);

  const handleLocate = useCallback(() => {
    if (!mapInstanceRef.current) return;
    
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          mapInstanceRef.current?.setView([latitude, longitude], 16);
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          mapInstanceRef.current?.setView(NAIROBI_CENTER, 14);
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      mapInstanceRef.current.setView(NAIROBI_CENTER, 14);
      setIsLocating(false);
    }
  }, []);

  const handleResetNorth = useCallback(() => {
    if (!mapInstanceRef.current) return;
    // Reset rotation if any (standard Leaflet doesn't rotate, but this resets view)
    mapInstanceRef.current.setView(mapInstanceRef.current.getCenter(), mapInstanceRef.current.getZoom());
  }, []);

  return (
    <div className="map-container relative w-full h-full min-h-[400px] overflow-hidden">
      {/* Leaflet Map Container */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0"
        style={{ background: 'hsl(var(--background))' }}
      />

      {/* Route Info Overlay */}
      <AnimatePresence>
        {isNavigating && routeInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="nav-card px-4 py-2 flex items-center gap-4 shadow-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{routeInfo.duration}</p>
                <p className="text-xs text-muted-foreground">ETA</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{routeInfo.distance}</p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls with Tooltips */}
      <TooltipProvider delayDuration={300}>
        <div className="absolute right-2 sm:right-4 top-1/4 sm:top-1/3 flex flex-col gap-1.5 sm:gap-2 z-10">
          {/* Compass Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleResetNorth}
                className="p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg hover:bg-muted/50 transition-colors group"
                aria-label="Reset north"
              >
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left" className="flex items-center gap-2 px-3 py-2">
              <Compass className="w-4 h-4 text-primary" />
              <div>
                <p className="font-semibold">Reset North</p>
                <p className="text-xs text-muted-foreground">Align map to north direction</p>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Zoom In Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleZoomIn}
                className="p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg hover:bg-muted/50 transition-colors group"
                aria-label="Zoom in"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left" className="flex items-center gap-2 px-3 py-2">
              <Plus className="w-4 h-4 text-primary" />
              <div>
                <p className="font-semibold">Zoom In</p>
                <p className="text-xs text-muted-foreground">Get a closer view of the map</p>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Zoom Out Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleZoomOut}
                className="p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg hover:bg-muted/50 transition-colors group"
                aria-label="Zoom out"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left" className="flex items-center gap-2 px-3 py-2">
              <Minus className="w-4 h-4 text-primary" />
              <div>
                <p className="font-semibold">Zoom Out</p>
                <p className="text-xs text-muted-foreground">See more of Nairobi</p>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Layers Button */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowLayerPicker(!showLayerPicker)}
                  className={`p-2 sm:p-3 nav-card rounded-lg sm:rounded-xl shadow-lg hover:bg-muted/50 transition-colors group ${
                    showLayerPicker ? 'ring-2 ring-primary' : ''
                  }`}
                  aria-label="Map layers"
                >
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="left" className="flex items-center gap-2 px-3 py-2">
                <Layers className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-semibold">Map Layers</p>
                  <p className="text-xs text-muted-foreground">Switch between map styles</p>
                </div>
              </TooltipContent>
            </Tooltip>
            
            {/* Layer Picker Dropdown */}
            <AnimatePresence>
              {showLayerPicker && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-full mr-2 top-0 nav-card rounded-xl shadow-xl p-2 min-w-[160px] border border-border"
                >
                  <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Map Style
                  </p>
                  {(Object.keys(MAP_TILES) as MapTileType[]).map((type) => {
                    const LayerIcon = type === 'satellite' ? Satellite 
                      : type === 'terrain' ? Mountain 
                      : type === 'dark' ? Moon 
                      : MapIcon;
                    
                    const description = type === 'satellite' ? 'Aerial imagery view'
                      : type === 'terrain' ? 'Elevation & terrain'
                      : type === 'dark' ? 'Night driving mode'
                      : 'Standard road map';

                    return (
                      <Tooltip key={type}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setMapTileType(type);
                              setShowLayerPicker(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-all ${
                              mapTileType === type 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : 'hover:bg-muted text-foreground'
                            }`}
                          >
                            <LayerIcon className="w-4 h-4" />
                            <div className="flex-1">
                              <p className="font-medium">{MAP_TILES[type].name}</p>
                              <p className={`text-[10px] ${mapTileType === type ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {description}
                              </p>
                            </div>
                            {mapTileType === type && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 rounded-full bg-primary-foreground"
                              />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="hidden sm:block">
                          <p>{description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </TooltipProvider>

      {/* Re-center button with Tooltip */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleLocate}
              disabled={isLocating}
              className={`absolute right-2 sm:right-4 bottom-36 sm:bottom-48 p-3 sm:p-4 bg-primary rounded-full shadow-lg z-10 hover:shadow-xl transition-shadow ${
                isLocating ? 'animate-pulse' : ''
              }`}
              aria-label="Find my location"
            >
              <Locate className={`w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground ${isLocating ? 'animate-spin' : ''}`} />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left" className="flex items-center gap-2 px-3 py-2">
            <Locate className="w-4 h-4 text-primary" />
            <div>
              <p className="font-semibold">Find My Location</p>
              <p className="text-xs text-muted-foreground">Center map on your current position</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Pro Mode Traffic Overlay */}
      <AnimatePresence>
        {isPro && (
          <motion.div 
            className="absolute left-2 sm:left-4 top-2 sm:top-4 flex flex-col gap-1.5 sm:gap-2 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="nav-card px-3 py-2 flex items-center gap-2 shadow-lg">
              <TrafficCone className="w-4 h-4 text-warning" />
              <span className="text-xs font-semibold text-foreground">Traffic</span>
            </div>
            <div className="nav-card px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success" />
              <span className="text-[10px] sm:text-xs text-foreground whitespace-nowrap">Westlands</span>
            </div>
            <div className="nav-card px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-warning animate-pulse" />
              <span className="text-[10px] sm:text-xs text-foreground whitespace-nowrap">Mombasa Rd</span>
            </div>
            <div className="nav-card px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] sm:text-xs text-foreground whitespace-nowrap">Uhuru Highway</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed indicator - Pro mode */}
      <AnimatePresence>
        {isPro && isNavigating && (
          <motion.div
            className="absolute left-2 sm:left-4 bottom-36 sm:bottom-48 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="nav-card w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-primary">
              <span className="text-xl sm:text-2xl font-bold text-foreground">{currentSpeed}</span>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground">km/h</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Arrow Overlay - appears when navigating */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            className="absolute bottom-44 sm:bottom-56 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-info rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <Navigation2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

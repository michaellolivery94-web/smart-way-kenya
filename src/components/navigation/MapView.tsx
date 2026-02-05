import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, Plus, Minus, Navigation2, Layers, MapPin, 
  Building2, Fuel, ShoppingBag, Trees, Locate, Satellite,
  Map as MapIcon, TrafficCone, Mountain, Moon, CircleDot,
  Trophy, Landmark, Route, Construction, AlertTriangle, Waves
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VoiceNavigationControl } from "./VoiceNavigationControl";
import { useVoiceNavigation, parseOSRMSteps } from "@/hooks/useVoiceNavigation";
import { useRoadConditions, RoadConditionType, SpeedCamera } from "@/contexts/RoadConditionsContext";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapViewHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  getMap: () => L.Map | null;
}

interface MapViewProps {
  isNavigating?: boolean;
  isPro?: boolean;
  origin?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
  previewLocation?: { lat: number; lng: number } | null;
}

// Nairobi coordinates
const NAIROBI_CENTER: [number, number] = [-1.2921, 36.8219];

// POI locations in Nairobi
const NAIROBI_POIS = [
  { name: "Sarit Centre", lat: -1.2647, lng: 36.8027, icon: ShoppingBag, color: "warning", type: "shopping" },
  { name: "Westgate Mall", lat: -1.2634, lng: 36.8048, icon: ShoppingBag, color: "warning", type: "shopping" },
  { name: "The Hub Karen", lat: -1.3273, lng: 36.7127, icon: ShoppingBag, color: "warning", type: "shopping" },
  { name: "KICC", lat: -1.2864, lng: 36.8172, icon: Building2, color: "muted-foreground", type: "landmark" },
  { name: "Nation Centre", lat: -1.2844, lng: 36.8234, icon: Building2, color: "muted-foreground", type: "landmark" },
  { name: "Shell Westlands", lat: -1.2689, lng: 36.8092, icon: Fuel, color: "warning", type: "fuel" },
  { name: "Total Ngong Rd", lat: -1.3012, lng: 36.7892, icon: Fuel, color: "warning", type: "fuel" },
  { name: "Uhuru Park", lat: -1.2891, lng: 36.8126, icon: Trees, color: "success", type: "park" },
  { name: "Central Park", lat: -1.2755, lng: 36.8182, icon: Trees, color: "success", type: "park" },
  { name: "Karura Forest", lat: -1.2355, lng: 36.8327, icon: Trees, color: "success", type: "park" },
];

// Major Nairobi Landmarks
const MAJOR_LANDMARKS = [
  { name: "Talanta Stadium", lat: -1.2675, lng: 36.8310, icon: Trophy, description: "Sports & Events Venue" },
  { name: "Kenyatta International Convention Centre", lat: -1.2864, lng: 36.8172, icon: Landmark, description: "Iconic Tower" },
  { name: "Nairobi Railway Station", lat: -1.2920, lng: 36.8298, icon: Building2, description: "Central Station" },
  { name: "Uhuru Gardens", lat: -1.3189, lng: 36.8135, icon: Landmark, description: "National Monument" },
  { name: "Nyayo Stadium", lat: -1.3059, lng: 36.8278, icon: Trophy, description: "Sports Complex" },
  { name: "Jomo Kenyatta International Airport", lat: -1.3192, lng: 36.9278, icon: Building2, description: "JKIA" },
];

// Major Roads in Nairobi
const MAJOR_ROADS = [
  { name: "Mombasa Road", points: [[-1.3192, 36.9278], [-1.3100, 36.8500], [-1.3050, 36.8350]], color: "#F59E0B" },
  { name: "Uhuru Highway", points: [[-1.2891, 36.8126], [-1.2980, 36.8190], [-1.3050, 36.8250]], color: "#EF4444" },
  { name: "Thika Road", points: [[-1.2200, 36.8800], [-1.2400, 36.8600], [-1.2600, 36.8400]], color: "#10B981" },
  { name: "Waiyaki Way", points: [[-1.2647, 36.8027], [-1.2580, 36.7800], [-1.2550, 36.7600]], color: "#3B82F6" },
  { name: "Ngong Road", points: [[-1.2891, 36.8126], [-1.3012, 36.7892], [-1.3100, 36.7700]], color: "#8B5CF6" },
  { name: "Langata Road", points: [[-1.3050, 36.8100], [-1.3189, 36.8000], [-1.3300, 36.7900]], color: "#EC4899" },
];

// Traffic Light Locations
const TRAFFIC_LIGHTS = [
  { name: "Westlands Roundabout", lat: -1.2660, lng: 36.8030, status: "green" },
  { name: "Museum Hill", lat: -1.2730, lng: 36.8150, status: "red" },
  { name: "Globe Roundabout", lat: -1.2820, lng: 36.8170, status: "amber" },
  { name: "Kenyatta Avenue Junction", lat: -1.2850, lng: 36.8220, status: "green" },
  { name: "University Way Junction", lat: -1.2800, lng: 36.8160, status: "red" },
  { name: "Ngong Road Junction", lat: -1.2950, lng: 36.8050, status: "amber" },
  { name: "Adams Arcade", lat: -1.3000, lng: 36.7870, status: "green" },
  { name: "Yaya Centre Junction", lat: -1.2970, lng: 36.7930, status: "green" },
  { name: "Nyayo Stadium Junction", lat: -1.3059, lng: 36.8278, status: "red" },
  { name: "Haile Selassie Junction", lat: -1.2890, lng: 36.8250, status: "amber" },
  { name: "Railways Junction", lat: -1.2910, lng: 36.8300, status: "green" },
  { name: "Langata Road Junction", lat: -1.3100, lng: 36.8050, status: "red" },
];

// Nairobi Expressway & Bypasses - Simplified coordinates for subtle highlights
const EXPRESSWAY_BYPASSES = [
  {
    name: "Nairobi Expressway",
    color: "rgba(59, 130, 246, 0.35)", // Subtle blue
    weight: 4,
    coords: [
      [-1.3192, 36.9278], // JKIA
      [-1.3150, 36.9000],
      [-1.3100, 36.8700],
      [-1.3050, 36.8450],
      [-1.3000, 36.8300],
      [-1.2920, 36.8200],
      [-1.2800, 36.8050],
      [-1.2700, 36.7900],
      [-1.2600, 36.7750], // Westlands end
    ]
  },
  {
    name: "Northern Bypass",
    color: "rgba(139, 92, 246, 0.3)", // Subtle purple
    weight: 3,
    coords: [
      [-1.2100, 36.9200], // Ruiru
      [-1.2050, 36.8800],
      [-1.2080, 36.8400],
      [-1.2150, 36.8000],
      [-1.2200, 36.7600],
      [-1.2250, 36.7200], // Limuru Road
    ]
  },
  {
    name: "Eastern Bypass",
    color: "rgba(236, 72, 153, 0.3)", // Subtle pink
    weight: 3,
    coords: [
      [-1.2100, 36.9200], // Northern connection
      [-1.2400, 36.9300],
      [-1.2700, 36.9350],
      [-1.3000, 36.9300],
      [-1.3192, 36.9278], // JKIA connection
    ]
  },
  {
    name: "Southern Bypass",
    color: "rgba(245, 158, 11, 0.3)", // Subtle amber
    weight: 3,
    coords: [
      [-1.3192, 36.9278], // JKIA
      [-1.3400, 36.8800],
      [-1.3500, 36.8400],
      [-1.3550, 36.8000],
      [-1.3500, 36.7600],
      [-1.3400, 36.7300], // Langata
    ]
  },
  {
    name: "Western Bypass",
    color: "rgba(16, 185, 129, 0.3)", // Subtle green
    weight: 3,
    coords: [
      [-1.2250, 36.7200], // Northern Bypass connection
      [-1.2500, 36.7100],
      [-1.2800, 36.7000],
      [-1.3100, 36.7050],
      [-1.3400, 36.7300], // Southern Bypass connection
    ]
  },
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

export const MapView = forwardRef<MapViewHandle, MapViewProps>(({ 
  isNavigating = false, 
  isPro = false,
  origin = null,
  destination = null,
  previewLocation = null
}, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const previewMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  const [mapTileType, setMapTileType] = useState<MapTileType>("dark");
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(45);
  const [userLocation, setUserLocation] = useState<[number, number]>(NAIROBI_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  
  // Voice navigation hook
  const voiceNav = useVoiceNavigation({
    enabled: true,
    announceDistance: 200,
    reminderDistance: 50,
  });

  // Road conditions hook
  const { conditions, cameras, checkProximity } = useRoadConditions();
  
  // Simulated position tracking for demo
  const positionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const routeCoordinatesRef = useRef<[number, number][]>([]);
  const currentPositionIndexRef = useRef(0);
  const roadConditionsLayerRef = useRef<L.LayerGroup | null>(null);
  const speedCamerasLayerRef = useRef<L.LayerGroup | null>(null);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number, zoom = 15) => {
      mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1 });
    },
    getMap: () => mapInstanceRef.current,
  }));

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
    roadConditionsLayerRef.current = L.layerGroup().addTo(map);
    speedCamerasLayerRef.current = L.layerGroup().addTo(map);

    // Add attribution
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    mapInstanceRef.current = map;

    // Add current location marker
    addCurrentLocationMarker(map, userLocation);

    // Add POI markers
    addPOIMarkers(map);

    // Add major landmarks
    addLandmarkMarkers(map);

    // Add road labels
    addRoadLabels(map);

    // Add traffic lights
    addTrafficLights(map);

    // Add expressway & bypass highlights
    addExpresswayBypasses(map);

    // Add road conditions markers
    addRoadConditionsMarkers();

    // Add speed camera markers
    addSpeedCameraMarkers();

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

  // Handle preview location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing preview marker
    if (previewMarkerRef.current) {
      previewMarkerRef.current.remove();
      previewMarkerRef.current = null;
    }

    // Add new preview marker if location provided and not navigating
    if (previewLocation && !isNavigating) {
      const previewIcon = L.divIcon({
        html: `<div class="relative">
          <div class="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" style="width: 48px; height: 48px; margin: -12px;"></div>
          <div class="w-10 h-10 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>`,
        className: 'custom-preview-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      previewMarkerRef.current = L.marker([previewLocation.lat, previewLocation.lng], { 
        icon: previewIcon,
        zIndexOffset: 900
      }).addTo(mapInstanceRef.current);
    }
  }, [previewLocation, isNavigating]);

  // Handle navigation route
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();
    
    // Remove preview marker when navigating starts
    if (previewMarkerRef.current && isNavigating) {
      previewMarkerRef.current.remove();
      previewMarkerRef.current = null;
    }

    if (isNavigating) {
      // Use actual coordinates if provided
      const startPoint: [number, number] = origin 
        ? [origin.lat, origin.lng] 
        : [-1.2689, 36.8092]; // Default: Westlands
      const endPoint: [number, number] = destination 
        ? [destination.lat, destination.lng] 
        : [-1.2864, 36.8172]; // Default: KICC

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
      // Request with steps for turn-by-turn navigation
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0 && routeLayerRef.current) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        // Store route coordinates for position simulation
        routeCoordinatesRef.current = coordinates;
        currentPositionIndexRef.current = 0;

        // Parse steps for voice navigation
        if (route.legs && route.legs[0]?.steps) {
          const instructions = parseOSRMSteps(route.legs[0].steps);
          voiceNav.setInstructions(instructions);
        }

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

        // Start simulated position tracking for demo
        startPositionSimulation(coordinates);
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

  // Simulate user moving along the route for demo purposes
  const startPositionSimulation = useCallback((coordinates: [number, number][]) => {
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
    }

    positionIntervalRef.current = setInterval(() => {
      const idx = currentPositionIndexRef.current;
      if (idx < coordinates.length) {
        const [lat, lng] = coordinates[idx];
        voiceNav.updateUserPosition(lat, lng);
        setUserLocation([lat, lng]);
        currentPositionIndexRef.current = Math.min(idx + 3, coordinates.length - 1);
      } else {
        if (positionIntervalRef.current) {
          clearInterval(positionIntervalRef.current);
        }
      }
    }, 2000);
  }, [voiceNav]);

  // Cleanup position simulation
  useEffect(() => {
    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, []);

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
        html: `<div class="bg-card/90 backdrop-blur px-2 py-1.5 rounded-lg shadow-lg border border-border flex items-center gap-1.5 whitespace-nowrap hover:scale-105 transition-transform cursor-pointer">
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

  // Add major landmark markers with prominent styling
  const addLandmarkMarkers = (map: L.Map) => {
    if (!markerLayerRef.current) return;

    MAJOR_LANDMARKS.forEach((landmark) => {
      const isStadium = landmark.icon === Trophy;
      
      const landmarkIcon = L.divIcon({
        html: `<div class="relative group cursor-pointer">
          <div class="absolute -inset-2 bg-gradient-to-r ${isStadium ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-500'} rounded-full opacity-40 blur-sm animate-pulse"></div>
          <div class="relative bg-gradient-to-br ${isStadium ? 'from-emerald-500 to-teal-600' : 'from-blue-500 to-indigo-600'} px-3 py-2 rounded-xl shadow-xl border-2 border-white/30 flex items-center gap-2 whitespace-nowrap transform hover:scale-110 transition-all duration-300">
            <div class="w-5 h-5 text-white">
              ${isStadium 
                ? '<svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
                : '<svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full"><path d="M3 22V8l9-6 9 6v14H3z"/><path d="M9 22V12h6v10"/></svg>'}
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-white drop-shadow-md">${landmark.name}</span>
              <span class="text-[10px] text-white/80">${landmark.description}</span>
            </div>
          </div>
        </div>`,
        className: 'custom-landmark-marker',
        iconSize: [180, 50],
        iconAnchor: [90, 25],
      });

      L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon, zIndexOffset: 800 })
        .addTo(markerLayerRef.current!);
    });
  };

  // Add road labels as polyline labels
  const addRoadLabels = (map: L.Map) => {
    if (!markerLayerRef.current) return;

    MAJOR_ROADS.forEach((road) => {
      // Add road line (subtle, just for label positioning)
      const midPoint = road.points[Math.floor(road.points.length / 2)] as [number, number];
      
      const roadLabelIcon = L.divIcon({
        html: `<div class="relative group">
          <div class="bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-border/50 flex items-center gap-2 whitespace-nowrap transform hover:scale-105 transition-all cursor-pointer">
            <div class="w-2 h-2 rounded-full" style="background-color: ${road.color}; box-shadow: 0 0 6px ${road.color}"></div>
            <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            <span class="text-xs font-semibold text-foreground tracking-wide">${road.name}</span>
          </div>
        </div>`,
        className: 'custom-road-label',
        iconSize: [140, 30],
        iconAnchor: [70, 15],
      });

      L.marker(midPoint, { icon: roadLabelIcon, zIndexOffset: 600 })
        .addTo(markerLayerRef.current!);
    });
  };

  // Add traffic light indicators
  const addTrafficLights = (map: L.Map) => {
    if (!markerLayerRef.current) return;

    TRAFFIC_LIGHTS.forEach((light) => {
      const statusColor = light.status === 'green' ? '#10B981' 
        : light.status === 'amber' ? '#F59E0B' 
        : '#EF4444';
      
      const statusText = light.status === 'green' ? 'Clear' 
        : light.status === 'amber' ? 'Slowing' 
        : 'Stop';

      const pulseClass = light.status === 'red' ? 'animate-pulse' : '';

      const trafficLightIcon = L.divIcon({
        html: `<div class="relative group cursor-pointer">
          <div class="relative flex flex-col items-center">
            <!-- Traffic Light Post -->
            <div class="bg-gray-800 rounded-t-lg px-1.5 py-1 border border-gray-600 shadow-lg">
              <div class="flex flex-col gap-0.5">
                <div class="w-2.5 h-2.5 rounded-full ${light.status === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-red-900/50'}"></div>
                <div class="w-2.5 h-2.5 rounded-full ${light.status === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-amber-900/50'}"></div>
                <div class="w-2.5 h-2.5 rounded-full ${light.status === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-emerald-900/50'}"></div>
              </div>
            </div>
            <div class="w-1 h-3 bg-gray-700"></div>
            <!-- Label on hover -->
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              <div class="bg-card/95 backdrop-blur px-2 py-1 rounded-md shadow-lg border border-border whitespace-nowrap flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full ${pulseClass}" style="background-color: ${statusColor}; box-shadow: 0 0 4px ${statusColor}"></div>
                <span class="text-[10px] font-medium text-foreground">${light.name}</span>
                <span class="text-[9px] px-1 py-0.5 rounded text-white" style="background-color: ${statusColor}">${statusText}</span>
              </div>
            </div>
          </div>
        </div>`,
        className: 'custom-traffic-light',
        iconSize: [24, 40],
        iconAnchor: [12, 35],
      });

      L.marker([light.lat, light.lng], { icon: trafficLightIcon, zIndexOffset: 700 })
        .addTo(markerLayerRef.current!);
    });
  };

  // Add subtle expressway & bypass polylines
  const addExpresswayBypasses = (map: L.Map) => {
    EXPRESSWAY_BYPASSES.forEach((bypass) => {
      const coords = bypass.coords as [number, number][];
      
      // Main line - subtle and thin
      const bypassLine = L.polyline(coords, {
        color: bypass.color,
        weight: bypass.weight,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: bypass.name === 'Nairobi Expressway' ? undefined : '8, 4',
      });

      bypassLine.addTo(map);

      // Add subtle label at midpoint for expressway only
      if (bypass.name === 'Nairobi Expressway' && markerLayerRef.current) {
        const midIdx = Math.floor(coords.length / 2);
        const midPoint: [number, number] = coords[midIdx];

        const labelIcon = L.divIcon({
          html: `<div class="bg-blue-500/20 backdrop-blur-sm px-2 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">
            <span class="text-[9px] font-medium text-blue-400/80 tracking-wide">EXPRESSWAY</span>
          </div>`,
          className: 'expressway-label',
          iconSize: [80, 18],
          iconAnchor: [40, 9],
        });

        L.marker(midPoint, { icon: labelIcon, zIndexOffset: 400 })
          .addTo(markerLayerRef.current);
      }
    });
  };

  // Add road conditions markers (murram, construction, etc.)
  const addRoadConditionsMarkers = useCallback(() => {
    if (!roadConditionsLayerRef.current) return;
    
    roadConditionsLayerRef.current.clearLayers();

    const conditionConfig: Record<RoadConditionType, { color: string; bgColor: string; icon: string; pulseColor: string }> = {
      murram: { 
        color: "#F59E0B", 
        bgColor: "bg-amber-500", 
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`,
        pulseColor: "rgba(245, 158, 11, 0.4)"
      },
      construction: { 
        color: "#F97316", 
        bgColor: "bg-orange-500", 
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
        pulseColor: "rgba(249, 115, 22, 0.4)"
      },
      pothole: { 
        color: "#EAB308", 
        bgColor: "bg-yellow-500", 
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4l7.53 14H4.47L12 6zm-1 6v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>`,
        pulseColor: "rgba(234, 179, 8, 0.4)"
      },
      flooded: { 
        color: "#3B82F6", 
        bgColor: "bg-blue-500", 
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>`,
        pulseColor: "rgba(59, 130, 246, 0.4)"
      },
    };

    const severitySize = {
      low: { outer: 40, inner: 32 },
      medium: { outer: 48, inner: 38 },
      high: { outer: 56, inner: 44 },
    };

    conditions.forEach((condition) => {
      const config = conditionConfig[condition.type];
      const size = severitySize[condition.severity];
      
      const markerIcon = L.divIcon({
        html: `<div class="relative group cursor-pointer">
          <!-- Pulse Ring -->
          <div class="absolute inset-0 rounded-full animate-ping" 
               style="width: ${size.outer}px; height: ${size.outer}px; background: ${config.pulseColor}; margin: -${(size.outer - size.inner) / 2}px;"></div>
          
          <!-- Main Marker -->
          <div class="relative flex items-center justify-center rounded-full shadow-xl border-2 border-white/50"
               style="width: ${size.inner}px; height: ${size.inner}px; background: ${config.color};">
            <div class="text-white w-5 h-5 flex items-center justify-center">
              ${condition.type === 'murram' ? '⬛' : condition.type === 'construction' ? '🚧' : condition.type === 'pothole' ? '⚠️' : '💧'}
            </div>
          </div>
          
          <!-- Label on hover -->
          <div class="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
            <div class="bg-card/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-border whitespace-nowrap">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-3 h-3 rounded-full" style="background: ${config.color}"></div>
                <span class="text-xs font-bold text-foreground">${condition.type.charAt(0).toUpperCase() + condition.type.slice(1)}</span>
                ${condition.verified ? '<span class="w-2 h-2 rounded-full bg-green-500"></span>' : ''}
              </div>
              <p class="text-[10px] text-muted-foreground max-w-[150px] truncate">${condition.name}</p>
              <span class="text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                condition.severity === 'high' ? 'bg-red-500/20 text-red-400' : 
                condition.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-green-500/20 text-green-400'
              }">${condition.severity}</span>
            </div>
          </div>
        </div>`,
        className: 'custom-road-condition-marker',
        iconSize: [size.inner, size.inner],
        iconAnchor: [size.inner / 2, size.inner / 2],
      });

      L.marker([condition.lat, condition.lng], { icon: markerIcon, zIndexOffset: 850 })
        .addTo(roadConditionsLayerRef.current!);
    });
  }, [conditions]);

  // Add speed camera markers
  const addSpeedCameraMarkers = useCallback(() => {
    if (!speedCamerasLayerRef.current) return;
    
    speedCamerasLayerRef.current.clearLayers();

    const cameraTypeConfig = {
      fixed: { label: "Fixed", color: "#EF4444" },
      mobile: { label: "Mobile", color: "#F97316" },
      average: { label: "Avg Speed", color: "#DC2626" },
    };

    cameras.forEach((camera) => {
      const config = cameraTypeConfig[camera.type];
      
      const markerIcon = L.divIcon({
        html: `<div class="relative group cursor-pointer">
          <!-- Pulse Ring -->
          <div class="absolute inset-0 rounded-full animate-ping" 
               style="width: 44px; height: 44px; background: rgba(239, 68, 68, 0.3); margin: -6px;"></div>
          
          <!-- Main Marker -->
          <div class="relative flex items-center justify-center rounded-lg shadow-xl border-2 border-white/50"
               style="width: 32px; height: 32px; background: ${config.color};">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          
          <!-- Speed Limit Badge -->
          <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center border border-red-500">
            <span class="text-[8px] font-bold text-red-600">${camera.speedLimit}</span>
          </div>
          
          <!-- Label on hover -->
          <div class="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
            <div class="bg-card/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-border whitespace-nowrap">
              <div class="flex items-center gap-2 mb-1">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                <span class="text-xs font-bold text-foreground">${config.label} Camera</span>
              </div>
              <p class="text-[10px] text-muted-foreground max-w-[180px]">${camera.name}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                  ${camera.speedLimit} km/h
                </span>
                ${camera.direction ? `<span class="text-[9px] text-muted-foreground">${camera.direction}</span>` : ''}
              </div>
            </div>
          </div>
        </div>`,
        className: 'custom-speed-camera-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([camera.lat, camera.lng], { icon: markerIcon, zIndexOffset: 900 })
        .addTo(speedCamerasLayerRef.current!);
    });
  }, [cameras]);

  // Update road conditions markers when conditions change
  useEffect(() => {
    if (mapInstanceRef.current && roadConditionsLayerRef.current) {
      addRoadConditionsMarkers();
    }
  }, [conditions, addRoadConditionsMarkers]);

  // Update speed camera markers when cameras change
  useEffect(() => {
    if (mapInstanceRef.current && speedCamerasLayerRef.current) {
      addSpeedCameraMarkers();
    }
  }, [cameras, addSpeedCameraMarkers]);

  // Check proximity to road conditions during navigation
  useEffect(() => {
    if (isNavigating && userLocation) {
      checkProximity(userLocation[0], userLocation[1]);
    }
  }, [isNavigating, userLocation, checkProximity]);

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
              className={`absolute right-2 sm:right-4 ${isNavigating && isPro ? 'bottom-56 sm:bottom-72' : 'bottom-36 sm:bottom-48'} p-3 sm:p-4 bg-primary rounded-full shadow-lg z-10 hover:shadow-xl transition-all ${
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

      {/* Voice Navigation Control - shows during navigation */}
      <AnimatePresence>
        {isNavigating && (
          <VoiceNavigationControl
            isEnabled={voiceNav.isEnabled}
            isSpeaking={voiceNav.isSpeaking}
            volume={voiceNav.volume}
            currentInstruction={voiceNav.currentInstruction}
            upcomingInstructions={voiceNav.upcomingInstructions}
            onToggle={voiceNav.toggleVoice}
            onVolumeChange={voiceNav.setVolume}
            onAnnounce={voiceNav.announceInstruction}
          />
        )}
      </AnimatePresence>

      {/* Speed indicator - Pro mode (repositioned) */}
      <AnimatePresence>
        {isPro && isNavigating && (
          <motion.div
            className="absolute right-2 sm:right-4 bottom-36 sm:bottom-48 z-10"
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
});

MapView.displayName = "MapView";

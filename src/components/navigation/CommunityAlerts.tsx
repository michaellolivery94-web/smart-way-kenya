import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, AlertTriangle, Car, Construction, TrafficCone, 
  MapPinOff, Droplets, Users, ChevronRight, Clock
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface CommunityAlert {
  id: string;
  type: "police" | "accident" | "traffic" | "hazard" | "construction" | "closure" | "flood" | "speed-trap";
  description: string;
  road: string;
  distance: string;
  timeAgo: string;
  confirmations: number;
  position: "ahead" | "left" | "right";
}

const alertConfig: Record<string, { icon: typeof Shield; color: string; bg: string }> = {
  "police": { icon: Shield, color: "text-info", bg: "bg-info/15" },
  "speed-trap": { icon: Shield, color: "text-info", bg: "bg-info/15" },
  "accident": { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/15" },
  "traffic": { icon: Car, color: "text-warning", bg: "bg-warning/15" },
  "hazard": { icon: TrafficCone, color: "text-warning", bg: "bg-warning/15" },
  "construction": { icon: Construction, color: "text-info", bg: "bg-info/15" },
  "closure": { icon: MapPinOff, color: "text-destructive", bg: "bg-destructive/15" },
  "flood": { icon: Droplets, color: "text-info", bg: "bg-info/15" },
};

const nairobiAlerts: CommunityAlert[] = [
  { id: "1", type: "police", description: "Police checkpoint — have your DL ready", road: "Uhuru Highway", distance: "1.2 km ahead", timeAgo: "3 min ago", confirmations: 12, position: "ahead" },
  { id: "2", type: "accident", description: "Minor fender-bender, 2 vehicles blocking left lane", road: "Mombasa Road (A109)", distance: "3.4 km ahead", timeAgo: "8 min ago", confirmations: 24, position: "ahead" },
  { id: "3", type: "hazard", description: "Large pothole in the middle lane — swerve right", road: "Thika Superhighway (A2)", distance: "800m ahead", timeAgo: "5 min ago", confirmations: 18, position: "ahead" },
  { id: "4", type: "traffic", description: "Heavy bumper-to-bumper traffic near Nyayo Stadium", road: "Langata Road", distance: "2.1 km ahead", timeAgo: "2 min ago", confirmations: 31, position: "ahead" },
  { id: "5", type: "speed-trap", description: "Speed camera van parked on the shoulder", road: "Waiyaki Way (A104)", distance: "1.5 km ahead", timeAgo: "6 min ago", confirmations: 15, position: "right" },
  { id: "6", type: "construction", description: "Road works — single lane alternating traffic", road: "Forest Road", distance: "4.2 km ahead", timeAgo: "12 min ago", confirmations: 8, position: "ahead" },
  { id: "7", type: "flood", description: "Flooded section after heavy rains — drive slowly", road: "Outer Ring Road", distance: "5.0 km", timeAgo: "15 min ago", confirmations: 22, position: "ahead" },
  { id: "8", type: "police", description: "Alcoblow checkpoint — detour via Valley Road possible", road: "Kenyatta Avenue", distance: "900m ahead", timeAgo: "1 min ago", confirmations: 9, position: "ahead" },
  { id: "9", type: "hazard", description: "Stalled matatu blocking bus lane", road: "Jogoo Road", distance: "1.8 km", timeAgo: "4 min ago", confirmations: 14, position: "left" },
  { id: "10", type: "accident", description: "Overturned truck — avoid right 2 lanes", road: "Southern Bypass", distance: "6.3 km", timeAgo: "20 min ago", confirmations: 42, position: "ahead" },
];

interface CommunityAlertsProps {
  isNavigating: boolean;
}

export const CommunityAlerts = ({ isNavigating }: CommunityAlertsProps) => {
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate receiving community alerts
  useEffect(() => {
    if (!isNavigating) {
      setAlerts([]);
      return;
    }
    // Load initial alerts with slight randomization
    const shuffled = [...nairobiAlerts].sort(() => Math.random() - 0.5).slice(0, 6);
    setAlerts(shuffled);

    // Add new alerts periodically
    const interval = setInterval(() => {
      setAlerts(prev => {
        const pool = nairobiAlerts.filter(a => !prev.find(p => p.id === a.id));
        if (pool.length === 0) return prev;
        const newAlert = pool[Math.floor(Math.random() * pool.length)];
        return [newAlert, ...prev].slice(0, 8);
      });
    }, 25000);

    return () => clearInterval(interval);
  }, [isNavigating]);

  // Rotate current alert ticker
  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAlertIndex(prev => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (!isNavigating || alerts.length === 0) return null;

  const current = alerts[currentAlertIndex];
  const config = alertConfig[current.type] || alertConfig.hazard;
  const AlertIcon = config.icon;

  return (
    <>
      {/* Ticker Bar — always visible during navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-[52px] left-0 right-0 z-20"
      >
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-md border-b border-border/30"
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">{alerts.length}</span>
          </div>
          <div className="w-px h-4 bg-border/50" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className={`w-5 h-5 rounded-md ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <AlertIcon className={`w-3 h-3 ${config.color}`} />
              </div>
              <span className="text-[11px] text-foreground font-medium truncate">
                {current.description}
              </span>
              <span className="text-[9px] text-muted-foreground flex-shrink-0">
                {current.distance}
              </span>
            </motion.div>
          </AnimatePresence>
          <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        </motion.button>
      </motion.div>

      {/* Expanded Alerts Panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 z-50 nav-card rounded-t-2xl max-h-[60vh] overflow-hidden"
            >
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Community Alerts</h3>
                      <p className="text-[10px] text-muted-foreground">{alerts.length} reports near your route</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[45vh] p-3 space-y-2">
                {alerts.map((alert, i) => {
                  const ac = alertConfig[alert.type] || alertConfig.hazard;
                  const Icon = ac.icon;
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30"
                    >
                      <div className={`w-10 h-10 rounded-xl ${ac.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${ac.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{alert.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground font-medium">{alert.road}</span>
                          <span className="text-[9px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">{alert.distance}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />
                            {alert.timeAgo}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-success font-medium">
                            <Users className="w-2.5 h-2.5" />
                            {alert.confirmations} confirmed
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="px-2 py-1 rounded-lg bg-success/15 text-success text-[9px] font-bold flex-shrink-0"
                      >
                        👍 Confirm
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

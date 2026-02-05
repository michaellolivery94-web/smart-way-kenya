import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  X, 
  Construction, 
  Car, 
  TrafficCone,
  MapPinOff,
  Route,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rateLimit";

interface ReportButtonProps {
  onReport?: (type: string) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const reportTypes = [
  { id: "traffic", icon: Car, label: "Traffic", color: "bg-warning" },
  { id: "accident", icon: AlertTriangle, label: "Accident", color: "bg-destructive" },
  { id: "construction", icon: Construction, label: "Construction", color: "bg-info" },
  { id: "closure", icon: MapPinOff, label: "Road Closed", color: "bg-destructive" },
  { id: "new-road", icon: Route, label: "New Road", color: "bg-success" },
  { id: "hazard", icon: TrafficCone, label: "Hazard", color: "bg-warning" },
];

export const ReportButton = ({ onReport, userLocation }: ReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedType, setSubmittedType] = useState<string | null>(null);

  const handleReport = async (type: string) => {
    // Check rate limit
    const { allowed, remainingTime } = checkRateLimit("report", RATE_LIMIT_CONFIGS.reportSubmission);
    
    if (!allowed) {
      toast.error(`Too many reports`, {
        description: `Please wait ${remainingTime} seconds before submitting another report.`,
      });
      return;
    }

    // Validate location
    if (!userLocation) {
      toast.error("Location required", {
        description: "Please enable location services to report an issue.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmittedType(type);

    // Simulate submission delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      onReport?.(type);
      
      const reportLabel = reportTypes.find(r => r.id === type)?.label || type;
      
      toast.success("Report submitted!", {
        description: `Your ${reportLabel} report has been received. Thank you for helping other drivers.`,
        icon: <CheckCircle className="w-5 h-5 text-success" />,
        duration: 4000,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to submit report", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
      setSubmittedType(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 left-4 right-4 z-50 nav-card p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Report an Issue</h3>
              <button
                onClick={() => !isSubmitting && setIsOpen(false)}
                disabled={isSubmitting}
                className="p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {reportTypes.map((type) => {
                const isThisSubmitting = isSubmitting && submittedType === type.id;
                
                return (
                  <motion.button
                    key={type.id}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    onClick={() => handleReport(type.id)}
                    disabled={isSubmitting}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-60"
                  >
                    <div className={`p-3 rounded-full ${type.color} relative`}>
                      {isThisSubmitting ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <type.icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your report helps other drivers in Nairobi
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-80 z-30 report-fab"
        aria-label="Report road issue"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-primary-foreground" />
          )}
        </motion.div>
      </motion.button>
    </>
  );
};

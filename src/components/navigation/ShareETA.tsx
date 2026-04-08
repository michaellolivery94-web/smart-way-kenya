import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareETAProps {
  destination: string | null;
  eta?: string;
  distance?: string;
  isNavigating: boolean;
}

export const ShareETA = ({ destination, eta, distance, isNavigating }: ShareETAProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isNavigating || !destination) return null;

  const arrivalTime = new Date(Date.now() + (parseInt(eta || "18") * 60 * 1000))
    .toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const shareMessage = `🚗 I'm on my way to ${destination}!\n⏱ ETA: ${eta || "18 min"} (arriving ~${arrivalTime})\n📍 Distance: ${distance || "7.2 km"}\n\nSent from Wayfinder Africa 🌍`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast.success("ETA copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My ETA - Wayfinder Africa",
          text: shareMessage,
        });
        setIsOpen(false);
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Share FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="absolute left-2 sm:left-4 bottom-36 sm:bottom-48 z-10 p-3 nav-card rounded-full shadow-lg hover:bg-muted/50 transition-colors"
        aria-label="Share ETA"
      >
        <Share2 className="w-4 h-4 text-foreground" />
      </motion.button>

      {/* Share Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md nav-card rounded-t-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Share your ETA</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 text-xs text-foreground/80 whitespace-pre-line leading-relaxed">
                {shareMessage}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-success-foreground font-semibold text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm border border-border"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
                {navigator.share && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNativeShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

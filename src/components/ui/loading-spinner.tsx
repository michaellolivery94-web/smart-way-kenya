import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  label 
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.div
        className={cn(
          "rounded-full border-2 border-muted border-t-primary",
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {label && (
        <span className="text-xs text-muted-foreground animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

export const LoadingOverlay = ({ 
  label = "Loading..." 
}: { 
  label?: string 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="nav-card p-6 flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
    </motion.div>
  );
};

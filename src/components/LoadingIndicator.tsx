
import { motion } from "framer-motion";

interface LoadingIndicatorProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingIndicator = ({ 
  text = "Processing", 
  size = "md" 
}: LoadingIndicatorProps) => {
  const getSize = () => {
    switch (size) {
      case "sm": return "w-4 h-4";
      case "md": return "w-6 h-6";
      case "lg": return "w-8 h-8";
      default: return "w-6 h-6";
    }
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const circleVariants = {
    initial: {
      y: 0
    },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex gap-2"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            variants={circleVariants}
            className={`bg-primary rounded-full ${getSize()}`}
            style={{ 
              originY: 0.5,
              transition: 'all 0.3s ease',
              animationDelay: `${i * 0.15}s` 
            }}
          />
        ))}
      </motion.div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingIndicator;

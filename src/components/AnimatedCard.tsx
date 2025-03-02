
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedCard = ({ children, className, delay = 0 }: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.6, 
          ease: [0.22, 1, 0.36, 1],
          delay 
        }
      }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "glass-panel p-8 glass-panel-hover w-full",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;

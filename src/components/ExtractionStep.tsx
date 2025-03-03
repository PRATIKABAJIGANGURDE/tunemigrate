
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import LoadingIndicator from "./LoadingIndicator";

interface ExtractionStepProps {
  reversed?: boolean;
}

const ExtractionStep = ({ reversed = false }: ExtractionStepProps) => {
  return (
    <motion.div
      key="extracting"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-16">
        <LoadingIndicator 
          text={reversed ? "Extracting songs from Spotify" : "Extracting songs from YouTube"} 
          size="lg" 
        />
        <p className="mt-6 text-muted-foreground text-sm">
          This might take a moment depending on the playlist size
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default ExtractionStep;

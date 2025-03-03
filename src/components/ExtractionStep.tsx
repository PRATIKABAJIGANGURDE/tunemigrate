
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import LoadingIndicator from "./LoadingIndicator";

interface ExtractionStepProps {
  playlistSize?: number;
  currentProgress?: number;
}

const ExtractionStep = ({ playlistSize, currentProgress }: ExtractionStepProps) => {
  const progressText = playlistSize && currentProgress 
    ? `Processed ${currentProgress} of ${playlistSize} songs`
    : "This might take a moment depending on the playlist size";

  return (
    <motion.div
      key="extracting"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-16">
        <LoadingIndicator text="Extracting songs from YouTube" size="lg" />
        <p className="mt-6 text-muted-foreground text-sm">
          {progressText}
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default ExtractionStep;

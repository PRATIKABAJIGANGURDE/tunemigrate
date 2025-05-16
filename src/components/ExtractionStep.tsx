
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import LoadingIndicator from "./LoadingIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExtractionStepProps {
  playlistSize?: number;
  currentProgress?: number;
}

const ExtractionStep = ({ playlistSize, currentProgress }: ExtractionStepProps) => {
  const progressText = playlistSize && currentProgress 
    ? `Processed ${currentProgress} of ${playlistSize} songs`
    : "This might take a moment depending on the playlist size";
  const isMobile = useIsMobile();

  return (
    <motion.div
      key="extracting"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-8 sm:py-16 px-4 sm:px-8">
        <LoadingIndicator text="Extracting songs from YouTube" size={isMobile ? "md" : "lg"} />
        <p className="mt-6 text-muted-foreground text-sm text-center">
          {progressText}
        </p>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Fetching titles, durations, and upload dates for better Spotify matching
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default ExtractionStep;

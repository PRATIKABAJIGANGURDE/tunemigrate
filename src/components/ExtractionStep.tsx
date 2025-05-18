
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import LoadingIndicator from "./LoadingIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExtractionStepProps {
  playlistSize?: number;
  currentProgress?: number;
}

const ExtractionStep = ({ playlistSize, currentProgress }: ExtractionStepProps) => {
  const isMobile = useIsMobile();
  
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
      <AnimatedCard className="flex flex-col items-center justify-center py-6 md:py-12">
        <LoadingIndicator 
          text="Extracting songs from YouTube" 
          size={isMobile ? "md" : "lg"} 
        />
        <p className="mt-4 text-xs md:text-sm text-muted-foreground text-center px-4">
          {progressText}
        </p>
        <p className="text-[0.65rem] md:text-xs text-muted-foreground mt-2 text-center px-4">
          Fetching titles, durations, and upload dates for better Spotify matching
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default ExtractionStep;

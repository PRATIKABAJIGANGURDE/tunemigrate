
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import LoadingIndicator from "./LoadingIndicator";

interface CreationStepProps {
  playlistTitle: string;
  selectedSongsCount: number;
  reversed?: boolean;
}

const CreationStep = ({ playlistTitle, selectedSongsCount, reversed = false }: CreationStepProps) => {
  return (
    <motion.div
      key="create-playlist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-16">
        <LoadingIndicator 
          text={reversed ? "Creating YouTube playlist" : "Creating Spotify playlist"} 
          size="lg" 
        />
        <p className="mt-6 text-muted-foreground text-sm">
          Adding {selectedSongsCount} songs to "{playlistTitle}"
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default CreationStep;

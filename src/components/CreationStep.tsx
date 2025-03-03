
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import LoadingIndicator from "./LoadingIndicator";

interface CreationStepProps {
  playlistTitle: string;
  selectedSongsCount: number;
  currentProgress?: number;
}

const CreationStep = ({ 
  playlistTitle, 
  selectedSongsCount,
  currentProgress = 0
}: CreationStepProps) => {
  const progressPercent = Math.min(100, Math.round((currentProgress / selectedSongsCount) * 100));
  
  return (
    <motion.div
      key="create-playlist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-16">
        <LoadingIndicator text="Creating Spotify playlist" size="lg" />
        <p className="mt-4 text-sm font-medium">
          {currentProgress > 0 ? `${progressPercent}% complete` : ''}
        </p>
        <p className="mt-2 text-muted-foreground text-sm">
          Adding {selectedSongsCount} songs to "{playlistTitle}"
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Enhanced matching for better song accuracy
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default CreationStep;

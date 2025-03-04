
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
  const progressPercent = Math.min(100, currentProgress);
  
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
        
        {progressPercent > 0 && (
          <div className="w-full max-w-xs mt-6 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
        
        <p className="mt-4 text-sm font-medium">
          {progressPercent > 0 ? `${progressPercent}% complete` : ''}
        </p>
        <p className="mt-2 text-muted-foreground text-sm">
          Finding and adding {selectedSongsCount} songs to "{playlistTitle}"
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Using duration, upload date, and advanced matching to find the most accurate songs
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default CreationStep;

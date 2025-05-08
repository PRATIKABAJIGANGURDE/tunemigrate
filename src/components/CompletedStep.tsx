
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";

interface CompletedStepProps {
  playlistTitle: string;
  matchingStats: { matched: number; total: number } | null;
  onStartOver: () => void;
  onOpenSpotify: () => void;
}

const CompletedStep = ({ 
  playlistTitle, 
  matchingStats, 
  onStartOver, 
  onOpenSpotify 
}: CompletedStepProps) => {
  
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 font-playfair">Playlist Created!</h2>
        <p className="text-muted-foreground mb-2">
          Your playlist "{playlistTitle}" has been successfully created on Spotify!
        </p>

        {matchingStats && (
          <div className="mb-6 bg-muted/50 rounded-lg p-3">
            <p className="text-sm">
              <span className="font-medium">{matchingStats.matched}</span> of <span className="font-medium">{matchingStats.total}</span> songs were matched and added to your playlist.
            </p>
          </div>
        )}
        
        <div className="flex gap-4">
          <button 
            onClick={onStartOver}
            className="text-primary font-medium hover:underline"
          >
            Convert Another Playlist
          </button>
          <button
            className="text-spotify font-medium hover:underline"
            onClick={onOpenSpotify}
          >
            Open in Spotify
          </button>
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

export default CompletedStep;

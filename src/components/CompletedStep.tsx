
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import { useEffect } from "react";

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
  
  // Load the Buy Me a Coffee button script when the component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.async = true;
    script.setAttribute('data-name', 'bmc-button');
    script.setAttribute('data-slug', 'tunemigrate');
    script.setAttribute('data-color', '#FFDD00');
    script.setAttribute('data-emoji', '❤️');
    script.setAttribute('data-font', 'Cookie');
    script.setAttribute('data-text', 'show some love');
    script.setAttribute('data-outline-color', '#000000');
    script.setAttribute('data-font-color', '#000000');
    script.setAttribute('data-coffee-color', '#ffffff');
    
    // Create a container for the button
    const container = document.getElementById('bmc-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
    
    return () => {
      // Clean up script when component unmounts
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);
  
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
        
        {/* Buy Me a Coffee button container - moved above the buttons */}
        <div className="mb-6" id="bmc-container"></div>
        
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


import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import PlaylistNaming from "./PlaylistNaming";
import SpotifyAuth from "./SpotifyAuth";

interface NamingStepProps {
  initialName: string;
  isSpotifyConnected: boolean;
  onSubmit: (name: string, description: string) => void;
  onLogin: () => void;
}

const NamingStep = ({ 
  initialName, 
  isSpotifyConnected, 
  onSubmit, 
  onLogin 
}: NamingStepProps) => {
  return (
    <motion.div
      key="name-playlist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard>
        <PlaylistNaming 
          initialName={initialName}
          onSubmit={onSubmit}
        />
        <SpotifyAuth 
          onLogin={onLogin} 
          isLoggedIn={isSpotifyConnected}
        />
      </AnimatedCard>
    </motion.div>
  );
};

export default NamingStep;

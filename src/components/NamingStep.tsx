
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import PlaylistNaming from "./PlaylistNaming";
import SpotifyAuth from "./SpotifyAuth";

interface NamingStepProps {
  title: string;
  onSubmit: (name: string, description: string) => void;
  loading?: boolean;
}

const NamingStep = ({ 
  title, 
  onSubmit, 
  loading = false 
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
          initialName={title}
          onSubmit={onSubmit}
        />
      </AnimatedCard>
    </motion.div>
  );
};

export default NamingStep;

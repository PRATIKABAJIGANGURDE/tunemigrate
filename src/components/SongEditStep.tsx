
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import SongList from "./SongList";
import { Song } from "@/types";

interface SongEditStepProps {
  songs: Song[];
  onUpdate: (songs: Song[]) => void;
  onContinue: () => void;
}

const SongEditStep = ({ songs, onUpdate, onContinue }: SongEditStepProps) => {
  return (
    <motion.div
      key="edit-songs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard>
        <SongList 
          songs={songs}
          onUpdate={onUpdate}
          onContinue={onContinue}
        />
      </AnimatedCard>
    </motion.div>
  );
};

export default SongEditStep;

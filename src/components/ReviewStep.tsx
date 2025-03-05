
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import AnimatedCard from "./AnimatedCard";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import MatchQualityIndicator from "./MatchQualityIndicator";
import { Clock, Filter, MusicIcon } from "lucide-react";
import { toast } from "sonner";

interface ReviewStepProps {
  playlistTitle: string;
  songs: Song[];
  onContinue: () => void;
  onBack: () => void;
}

const ReviewStep = ({ playlistTitle, songs, onContinue, onBack }: ReviewStepProps) => {
  const [minConfidence, setMinConfidence] = useState(0); // Filter threshold
  const selectedSongs = useMemo(() => songs.filter(song => song.selected), [songs]);

  // Calculate match quality statistics
  const stats = useMemo(() => {
    const songsByQuality = {
      excellent: selectedSongs.filter(song => (song.matchConfidence || 0) >= 80).length,
      good: selectedSongs.filter(song => (song.matchConfidence || 0) >= 60 && (song.matchConfidence || 0) < 80).length,
      poor: selectedSongs.filter(song => (song.matchConfidence || 0) < 60).length
    };
    
    const avgConfidence = selectedSongs.length > 0 
      ? Math.round(selectedSongs.reduce((sum, song) => sum + (song.matchConfidence || 0), 0) / selectedSongs.length) 
      : 0;
      
    return { songsByQuality, avgConfidence };
  }, [selectedSongs]);

  // Filter songs based on match confidence
  const displayedSongs = useMemo(() => {
    return selectedSongs
      .filter(song => (song.matchConfidence || 0) >= minConfidence)
      .sort((a, b) => (b.matchConfidence || 0) - (a.matchConfidence || 0));
  }, [selectedSongs, minConfidence]);

  const handleContinue = () => {
    if (displayedSongs.length === 0) {
      toast.error("No songs would be added to your playlist with the current quality filter");
      return;
    }
    onContinue();
  };

  // Change filter confidence level
  const handleFilterChange = (level: number) => {
    setMinConfidence(level);
    const filteredCount = selectedSongs.filter(s => (s.matchConfidence || 0) >= level).length;
    toast.info(`Showing ${filteredCount} songs with match quality of ${level}% or higher`);
  };

  return (
    <motion.div
      key="review-matches"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Review Matches</h2>
              <p className="text-sm text-muted-foreground">
                Confirm song matches before creating your playlist
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button onClick={handleContinue}>
                Create Playlist
              </Button>
            </div>
          </div>

          {/* Match quality summary */}
          <div className="bg-muted/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Playlist Match Quality</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Average Match</span>
                  <span className="text-lg font-bold">{stats.avgConfidence}%</span>
                </div>
              </div>
              
              <div className="bg-white/20 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Songs Selected</span>
                  <span className="text-lg font-bold">{selectedSongs.length}</span>
                </div>
              </div>
              
              <div className="bg-white/20 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Will Be Added</span>
                  <span className="text-lg font-bold">{displayedSongs.length}</span>
                </div>
              </div>
            </div>
            
            {/* Quality breakdown */}
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Excellent: {stats.songsByQuality.excellent}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Good: {stats.songsByQuality.good}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Poor: {stats.songsByQuality.poor}</span>
              </div>
            </div>
          </div>
          
          {/* Filter by match quality */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-4 w-4" />
            <span>Filter by match quality:</span>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={minConfidence === 0 ? "default" : "outline"} 
                className="h-7 text-xs"
                onClick={() => handleFilterChange(0)}
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={minConfidence === 60 ? "default" : "outline"} 
                className="h-7 text-xs"
                onClick={() => handleFilterChange(60)}
              >
                60%+
              </Button>
              <Button 
                size="sm" 
                variant={minConfidence === 80 ? "default" : "outline"} 
                className="h-7 text-xs"
                onClick={() => handleFilterChange(80)}
              >
                80%+
              </Button>
            </div>
          </div>

          {/* Song list */}
          <div className="max-h-[300px] overflow-y-auto pr-2">
            {displayedSongs.length > 0 ? (
              <ul className="space-y-2">
                {displayedSongs.map(song => (
                  <li key={song.id} className="glass-panel p-3 flex items-center gap-3">
                    {song.thumbnail ? (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                        <MusicIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-sm truncate">{song.title}</p>
                        <MatchQualityIndicator confidence={song.matchConfidence} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex items-center">
                        {song.artist}
                        {song.duration && (
                          <span className="ml-1 flex items-center text-xs opacity-70 gap-1">
                            <Clock className="h-3 w-3" />
                            {song.duration}
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No songs match the selected quality filter</p>
                <p className="text-xs mt-2">Try lowering the quality threshold</p>
              </div>
            )}
          </div>
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

export default ReviewStep;

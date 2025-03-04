
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Music, CheckCircle2, AlertTriangle } from "lucide-react";

interface SongListProps {
  songs: Song[];
  onUpdate: (updatedSongs: Song[]) => void;
  onContinue: () => void;
}

const SongList = ({ songs, onUpdate, onContinue }: SongListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSong, setEditingSong] = useState<string | null>(null);

  const handleToggleSelect = (id: string) => {
    const updatedSongs = songs.map(song => 
      song.id === id ? { ...song, selected: !song.selected } : song
    );
    onUpdate(updatedSongs);
  };

  const handleRemoveSong = (id: string) => {
    const updatedSongs = songs.filter(song => song.id !== id);
    onUpdate(updatedSongs);
  };

  const handleEditTitle = (id: string, newTitle: string) => {
    const updatedSongs = songs.map(song => 
      song.id === id ? { ...song, title: newTitle } : song
    );
    onUpdate(updatedSongs);
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = songs.filter(song => song.selected).length;

  // Function to render match confidence indicator
  const renderMatchConfidence = (confidence?: number) => {
    if (confidence === undefined) return null;
    
    if (confidence >= 80) {
      return (
        <span title={`Match confidence: ${confidence}%`}>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </span>
      );
    } else if (confidence >= 60) {
      return (
        <span title={`Match confidence: ${confidence}%`}>
          <CheckCircle2 className="h-4 w-4 text-yellow-500" />
        </span>
      );
    } else {
      return (
        <span title={`Match confidence: ${confidence}%`}>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Edit Songs</h2>
          <p className="text-sm text-muted-foreground">
            {selectedCount} of {songs.length} songs selected
          </p>
        </div>
        <Button onClick={onContinue} disabled={selectedCount === 0}>
          Continue
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search songs..."
          className="pl-10"
        />
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence>
          {filteredSongs.length > 0 ? (
            <motion.ul
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredSongs.map((song) => (
                <motion.li
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`glass-panel p-3 flex items-center gap-3 ${song.selected ? "border-l-4 border-primary" : ""}`}
                >
                  <Checkbox
                    checked={song.selected}
                    onCheckedChange={() => handleToggleSelect(song.id)}
                    id={`song-${song.id}`}
                  />
                  
                  {song.thumbnail ? (
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                      <Music className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {editingSong === song.id ? (
                      <Input
                        value={song.title}
                        onChange={(e) => handleEditTitle(song.id, e.target.value)}
                        onBlur={() => setEditingSong(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingSong(null)}
                        autoFocus
                        className="h-8 text-sm"
                      />
                    ) : (
                      <div 
                        onClick={() => setEditingSong(song.id)}
                        className="cursor-text"
                      >
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-sm truncate">{song.title}</p>
                          {renderMatchConfidence(song.matchConfidence)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {song.artist}
                          {song.duration && <span className="ml-1 text-xs opacity-70">• {song.duration}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove song"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground">No songs found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SongList;

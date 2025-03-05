import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import AnimatedCard from "./AnimatedCard";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MatchQualityIndicator from "./MatchQualityIndicator";
import { Clock, Filter, MusicIcon, Search, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAccessToken } from "@/services/spotifyService";

interface ReviewStepProps {
  playlistTitle: string;
  songs: Song[];
  onContinue: () => void;
  onBack: () => void;
  onAddSpotifySong: (query: string) => Promise<any[] | null>;
  onAddSpotifyTrack: (track: any) => void;
  onUpdate: (updatedSongs: Song[]) => void;
  loading: boolean;
}

const ReviewStep = ({ 
  playlistTitle, 
  songs, 
  onContinue, 
  onBack,
  onAddSpotifySong,
  onAddSpotifyTrack,
  onUpdate,
  loading
}: ReviewStepProps) => {
  const [minConfidence, setMinConfidence] = useState(0); // Filter threshold
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  
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
  
  // Handle Spotify search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.info("Please enter a search query");
      return;
    }
    
    if (!getAccessToken()) {
      toast.error("You need to connect to Spotify first");
      return;
    }
    
    const results = await onAddSpotifySong(searchQuery.trim());
    if (results) {
      setSearchResults(results);
      setShowDialog(true);
    }
  };

  // Handle removing song from playlist
  const handleRemoveSong = (songId: string) => {
    const updatedSongs = songs.map(song => 
      song.id === songId ? { ...song, selected: false } : song
    );
    onUpdate(updatedSongs);
    toast.success("Song removed from playlist");
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
          
          {/* Add song from Spotify */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Spotify for additional songs..."
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Plus className="mr-1 h-4 w-4" />
              Add Song
            </Button>
          </div>

          {/* Song list - UPDATED UI */}
          <div className="max-h-[300px] overflow-y-auto pr-2">
            {displayedSongs.length > 0 ? (
              <ul className="space-y-2">
                {displayedSongs.map(song => (
                  <li key={song.id} className="glass-panel p-3">
                    <div className="flex items-start gap-3">
                      {/* YouTube song info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
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
                            <p className="font-medium text-sm leading-tight line-clamp-2 break-words">
                              {song.title}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-xs text-muted-foreground truncate">
                              {song.artist}
                            </p>
                            {song.duration && (
                              <span className="ml-1 flex items-center text-xs opacity-70 gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {song.duration}
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <MatchQualityIndicator confidence={song.matchConfidence} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow pointing to Spotify match */}
                      <div className="text-muted-foreground px-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      
                      {/* Spotify match info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {song.spotifyThumbnail ? (
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img src={song.spotifyThumbnail} alt={song.spotifyTitle} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <MusicIcon className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight line-clamp-2 break-words">
                            {song.spotifyTitle || song.title}
                          </p>
                          <div className="flex items-center">
                            <p className="text-xs text-muted-foreground truncate">
                              {song.spotifyArtist || song.artist}
                            </p>
                            {song.spotifyDuration && (
                              <span className="ml-1 flex items-center text-xs opacity-70 gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {song.spotifyDuration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveSong(song.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
      
      {/* Spotify search results dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Spotify Search Results</DialogTitle>
            <DialogDescription>
              Choose a song to add to your playlist
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto">
            {searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map(track => (
                  <li 
                    key={track.id} 
                    className="flex items-center gap-3 p-2 hover:bg-secondary/50 cursor-pointer rounded-md"
                    onClick={() => {
                      onAddSpotifyTrack(track);
                      setShowDialog(false);
                    }}
                  >
                    {track.album?.images?.[0]?.url ? (
                      <img 
                        src={track.album.images[0].url} 
                        alt={track.name} 
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted flex items-center justify-center rounded">
                        <MusicIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artists.map((a: any) => a.name).join(", ")}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No results found</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ReviewStep;

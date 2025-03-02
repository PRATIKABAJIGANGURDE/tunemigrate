
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Components
import Header from "@/components/Header";
import AnimatedCard from "@/components/AnimatedCard";
import UrlInput from "@/components/UrlInput";
import LoadingIndicator from "@/components/LoadingIndicator";
import ProcessingSteps from "@/components/ProcessingSteps";
import SongList from "@/components/SongList";
import PlaylistNaming from "@/components/PlaylistNaming";
import SpotifyAuth from "@/components/SpotifyAuth";

// Types
import { ConversionStep, Song, PlaylistData } from "@/types";

// Services
import { extractSongsFromPlaylist } from "@/services/youtubeService";
import { 
  isLoggedIn as isSpotifyLoggedIn, 
  createSpotifyPlaylistFromSongs,
  getAccessToken
} from "@/services/spotifyService";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<ConversionStep>(ConversionStep.INPUT_URL);
  const [loading, setLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistData>({
    title: "",
    songs: []
  });
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [matchingStats, setMatchingStats] = useState<{ matched: number, total: number } | null>(null);

  // Check if user is logged in with Spotify
  useEffect(() => {
    setSpotifyConnected(isSpotifyLoggedIn());
  }, []);

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setCurrentStep(ConversionStep.EXTRACTING);
    
    try {
      // Extract songs from YouTube playlist
      const extractedData = await extractSongsFromPlaylist(url);
      
      setPlaylistData({
        title: extractedData.title,
        songs: extractedData.songs
      });
      
      setLoading(false);
      setCurrentStep(ConversionStep.EDIT_SONGS);
      toast.success(`${extractedData.songs.length} songs extracted successfully!`);
    } catch (error) {
      console.error("Error extracting songs:", error);
      setLoading(false);
      setCurrentStep(ConversionStep.INPUT_URL);
      toast.error("Failed to extract songs from playlist");
    }
  };

  const handleSongUpdate = (updatedSongs: Song[]) => {
    setPlaylistData({
      ...playlistData,
      songs: updatedSongs
    });
  };

  const handleContinueToNaming = () => {
    setCurrentStep(ConversionStep.NAME_PLAYLIST);
  };

  const handlePlaylistNameSubmit = async (name: string, description: string) => {
    setPlaylistData({
      ...playlistData,
      title: name,
      description
    });
    
    if (!spotifyConnected) {
      toast.info("Please connect your Spotify account", {
        duration: 5000,
      });
      return;
    }
    
    setCurrentStep(ConversionStep.CREATE_PLAYLIST);
    setLoading(true);
    
    try {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        throw new Error("Spotify access token not found");
      }
      
      // Create Spotify playlist with the selected songs
      const result = await createSpotifyPlaylistFromSongs(
        accessToken,
        name,
        description || `Converted from YouTube with TuneMigrate`,
        playlistData.songs
      );
      
      setPlaylistUrl(result.playlistUrl);
      setMatchingStats({
        matched: result.matchedCount,
        total: result.totalCount
      });
      
      setLoading(false);
      setCurrentStep(ConversionStep.COMPLETED);
      
      toast.success("Playlist created successfully!", {
        duration: 5000,
      });
    } catch (error) {
      console.error("Error creating playlist:", error);
      setLoading(false);
      setCurrentStep(ConversionStep.NAME_PLAYLIST);
      toast.error("Failed to create playlist. Please try again.");
    }
  };

  const handleSpotifyLogin = () => {
    // The actual login is handled in the SpotifyAuth component
    // We just need to update the state when the callback signals success
    setSpotifyConnected(true);
  };

  const handleStartOver = () => {
    setCurrentStep(ConversionStep.INPUT_URL);
    setPlaylistData({
      title: "",
      songs: []
    });
    setPlaylistUrl(null);
    setMatchingStats(null);
  };

  const handleOpenSpotify = () => {
    if (playlistUrl) {
      window.open(playlistUrl, '_blank');
      toast.info("Opening Spotify playlist...");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-3xl px-4 mx-auto">
        <Header />
        
        <ProcessingSteps currentStep={currentStep} />
        
        <AnimatePresence mode="wait">
          {currentStep === ConversionStep.INPUT_URL && (
            <motion.div
              key="input-url"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UrlInput onSubmit={handleUrlSubmit} loading={loading} />
            </motion.div>
          )}
          
          {currentStep === ConversionStep.EXTRACTING && (
            <motion.div
              key="extracting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard className="flex flex-col items-center justify-center py-16">
                <LoadingIndicator text="Extracting songs from YouTube" size="lg" />
                <p className="mt-6 text-muted-foreground text-sm">
                  This might take a moment depending on the playlist size
                </p>
              </AnimatedCard>
            </motion.div>
          )}
          
          {currentStep === ConversionStep.EDIT_SONGS && (
            <motion.div
              key="edit-songs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard>
                <SongList 
                  songs={playlistData.songs}
                  onUpdate={handleSongUpdate}
                  onContinue={handleContinueToNaming}
                />
              </AnimatedCard>
            </motion.div>
          )}
          
          {currentStep === ConversionStep.NAME_PLAYLIST && (
            <motion.div
              key="name-playlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard>
                <PlaylistNaming 
                  initialName={playlistData.title}
                  onSubmit={handlePlaylistNameSubmit}
                />
                <SpotifyAuth 
                  onLogin={handleSpotifyLogin} 
                  isLoggedIn={spotifyConnected}
                />
              </AnimatedCard>
            </motion.div>
          )}
          
          {currentStep === ConversionStep.CREATE_PLAYLIST && (
            <motion.div
              key="create-playlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard className="flex flex-col items-center justify-center py-16">
                <LoadingIndicator text="Creating Spotify playlist" size="lg" />
                <p className="mt-6 text-muted-foreground text-sm">
                  Adding {playlistData.songs.filter(s => s.selected).length} songs to "{playlistData.title}"
                </p>
              </AnimatedCard>
            </motion.div>
          )}
          
          {currentStep === ConversionStep.COMPLETED && (
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
                
                <h2 className="text-2xl font-bold mb-2">Playlist Created!</h2>
                <p className="text-muted-foreground mb-2">
                  Your playlist "{playlistData.title}" has been successfully created on Spotify!
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
                    onClick={handleStartOver}
                    className="text-primary font-medium hover:underline"
                  >
                    Convert Another Playlist
                  </button>
                  <button
                    className="text-spotify font-medium hover:underline"
                    onClick={handleOpenSpotify}
                  >
                    Open in Spotify
                  </button>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        <footer className="mt-auto py-8 text-center text-xs text-muted-foreground">
          <p>TuneMigrate &copy; {new Date().getFullYear()} - YouTube to Spotify Converter</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

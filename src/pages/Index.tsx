
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/sonner";

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

// Mock data for demonstration
const MOCK_SONGS: Song[] = [
  {
    id: uuidv4(),
    title: "Bohemian Rhapsody",
    artist: "Queen",
    selected: true,
    thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg"
  },
  {
    id: uuidv4(),
    title: "Hotel California",
    artist: "Eagles",
    selected: true,
    thumbnail: "https://i.ytimg.com/vi/EqPtz5qN7HM/mqdefault.jpg"
  },
  {
    id: uuidv4(),
    title: "Imagine",
    artist: "John Lennon",
    selected: true,
    thumbnail: "https://i.ytimg.com/vi/YkgkThdzX-8/mqdefault.jpg"
  },
  {
    id: uuidv4(),
    title: "Billie Jean",
    artist: "Michael Jackson",
    selected: true,
    thumbnail: "https://i.ytimg.com/vi/Zi_XLOBDo_Y/mqdefault.jpg"
  },
  {
    id: uuidv4(),
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    selected: true,
    thumbnail: "https://i.ytimg.com/vi/1w7OgIMMRc4/mqdefault.jpg"
  }
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<ConversionStep>(ConversionStep.INPUT_URL);
  const [loading, setLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistData>({
    title: "",
    songs: []
  });

  const handleUrlSubmit = (url: string) => {
    setLoading(true);
    setCurrentStep(ConversionStep.EXTRACTING);
    
    // Simulate API call to extract songs from YouTube
    setTimeout(() => {
      setPlaylistData({
        title: "My YouTube Playlist",
        songs: MOCK_SONGS
      });
      
      setLoading(false);
      setCurrentStep(ConversionStep.EDIT_SONGS);
      toast.success("Songs extracted successfully!");
    }, 2500);
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

  const handlePlaylistNameSubmit = (name: string, description: string) => {
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
    
    // Simulate API call to create Spotify playlist
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(ConversionStep.COMPLETED);
      toast.success("Playlist created successfully!", {
        duration: 5000,
      });
    }, 3000);
  };

  const handleSpotifyLogin = () => {
    // Simulate Spotify authentication
    setLoading(true);
    
    setTimeout(() => {
      setSpotifyConnected(true);
      setLoading(false);
      toast.success("Connected to Spotify successfully!");
    }, 1500);
  };

  const handleStartOver = () => {
    setCurrentStep(ConversionStep.INPUT_URL);
    setPlaylistData({
      title: "",
      songs: []
    });
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
                <p className="text-muted-foreground mb-6">
                  Your playlist "{playlistData.title}" has been successfully created on Spotify with {playlistData.songs.filter(s => s.selected).length} songs.
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleStartOver}
                    className="text-primary font-medium hover:underline"
                  >
                    Convert Another Playlist
                  </button>
                  <button
                    className="text-spotify font-medium hover:underline"
                    onClick={() => {
                      toast.info("Opening Spotify app...");
                    }}
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

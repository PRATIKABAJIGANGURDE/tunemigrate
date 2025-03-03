
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import Header from "@/components/Header";
import ProcessingSteps from "@/components/ProcessingSteps";
import UrlInput from "@/components/UrlInput";
import ExtractionStep from "@/components/ExtractionStep";
import SongEditStep from "@/components/SongEditStep";
import NamingStep from "@/components/NamingStep";
import CreationStep from "@/components/CreationStep";
import CompletedStep from "@/components/CompletedStep";

// Types
import { ConversionStep } from "@/types";

// Hooks
import { usePlaylistConversion } from "@/hooks/usePlaylistConversion";

// Services
import { isLoggedIn as isSpotifyLoggedIn } from "@/services/spotifyService";

const Index = () => {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const {
    currentStep,
    loading,
    playlistData,
    playlistUrl,
    matchingStats,
    conversionProgress,
    handleUrlSubmit,
    handleSongUpdate,
    handleContinueToNaming,
    handlePlaylistNameSubmit,
    handleStartOver,
    handleOpenSpotify
  } = usePlaylistConversion();

  // Check if user is logged in with Spotify
  useEffect(() => {
    setSpotifyConnected(isSpotifyLoggedIn());
  }, []);

  const handleSpotifyLogin = () => {
    // The actual login is handled in the SpotifyAuth component
    // We just need to update the state when the callback signals success
    setSpotifyConnected(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-3xl px-4 mx-auto">
        <Header />
        
        <ProcessingSteps currentStep={currentStep} />
        
        <AnimatePresence mode="wait">
          {currentStep === ConversionStep.INPUT_URL && (
            <UrlInput onSubmit={handleUrlSubmit} loading={loading} />
          )}
          
          {currentStep === ConversionStep.EXTRACTING && (
            <ExtractionStep />
          )}
          
          {currentStep === ConversionStep.EDIT_SONGS && (
            <SongEditStep 
              songs={playlistData.songs}
              onUpdate={handleSongUpdate}
              onContinue={handleContinueToNaming}
            />
          )}
          
          {currentStep === ConversionStep.NAME_PLAYLIST && (
            <NamingStep 
              initialName={playlistData.title}
              isSpotifyConnected={spotifyConnected}
              onSubmit={handlePlaylistNameSubmit}
              onLogin={handleSpotifyLogin}
            />
          )}
          
          {currentStep === ConversionStep.CREATE_PLAYLIST && (
            <CreationStep 
              playlistTitle={playlistData.title}
              selectedSongsCount={playlistData.songs.filter(s => s.selected).length}
              currentProgress={conversionProgress}
            />
          )}
          
          {currentStep === ConversionStep.COMPLETED && (
            <CompletedStep 
              playlistTitle={playlistData.title}
              matchingStats={matchingStats}
              onStartOver={handleStartOver}
              onOpenSpotify={handleOpenSpotify}
            />
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

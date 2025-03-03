
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
    <div className="min-h-screen flex flex-col bg-white">
      <div className="container max-w-4xl px-4 mx-auto">
        <Header reversed={true} />
        
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Convert Your Playlists</h1>
          <p className="text-lg text-gray-600">
            Transfer your favorite Spotify playlists to YouTube in just a few steps. 
            Enter your playlist URL below to get started.
          </p>
        </div>
        
        <ProcessingSteps currentStep={currentStep} reversed={true} />
        
        <AnimatePresence mode="wait">
          {currentStep === ConversionStep.INPUT_URL && (
            <UrlInput 
              onSubmit={handleUrlSubmit} 
              loading={loading} 
              reversed={true} 
            />
          )}
          
          {currentStep === ConversionStep.EXTRACTING && (
            <ExtractionStep reversed={true} />
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
              reversed={true}
            />
          )}
          
          {currentStep === ConversionStep.COMPLETED && (
            <CompletedStep 
              playlistTitle={playlistData.title}
              matchingStats={matchingStats}
              onStartOver={handleStartOver}
              onOpenSpotify={handleOpenSpotify}
              reversed={true}
            />
          )}
        </AnimatePresence>
        
        <footer className="mt-auto py-8 text-center text-xs text-muted-foreground">
          <p>TuneMigrate &copy; {new Date().getFullYear()} - Spotify to YouTube Converter</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

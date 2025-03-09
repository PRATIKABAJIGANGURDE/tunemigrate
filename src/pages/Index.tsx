
import React from "react";
import { ConversionStep } from "@/types";
import UrlInput from "@/components/UrlInput";
import ExtractionStep from "@/components/ExtractionStep";
import SongEditStep from "@/components/SongEditStep";
import NamingStep from "@/components/NamingStep";
import ReviewStep from "@/components/ReviewStep";
import CreationStep from "@/components/CreationStep";
import CompletedStep from "@/components/CompletedStep";
import SpotifyAuth from "@/components/SpotifyAuth";
import { usePlaylistConversion } from "@/hooks/usePlaylistConversion";
import { isLoggedIn } from "@/services/spotifyService";
import ProcessingSteps from "@/components/ProcessingSteps";
import SpotifyLoginPrompt from "@/components/SpotifyLoginPrompt";

const Index = () => {
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
    handleCreatePlaylist,
    handleBackToNaming,
    handleStartOver,
    handleOpenSpotify,
    handleAddSpotifySong,
    handleAddSpotifyTrack,
    handleManualApprove
  } = usePlaylistConversion();

  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(isLoggedIn());

  React.useEffect(() => {
    const checkLoginStatus = () => {
      setIsUserLoggedIn(isLoggedIn());
    };
    
    // Check initially
    checkLoginStatus();
    
    // Add event listener to check when window gets focus
    window.addEventListener('focus', checkLoginStatus);
    
    return () => {
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, []);

  const handleLogin = () => {
    setIsUserLoggedIn(true);
  };

  // Show login prompt if user is not at step 1 and not logged in
  const showLoginPrompt = currentStep === ConversionStep.INPUT_URL && !isUserLoggedIn;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="space-y-8">
        {/* Show login prompt at the top if not logged in */}
        {showLoginPrompt && (
          <div className="mb-8">
            <SpotifyLoginPrompt />
          </div>
        )}
        
        <ProcessingSteps currentStep={currentStep} />
        
        <div className="p-4 bg-white rounded-xl shadow-sm border">
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
              loading={loading}
            />
          )}
          
          {currentStep === ConversionStep.NAME_PLAYLIST && (
            <NamingStep 
              title={playlistData.title}
              onSubmit={handlePlaylistNameSubmit}
              loading={loading}
            />
          )}
          
          {currentStep === ConversionStep.REVIEW_MATCHES && (
            <ReviewStep 
              songs={playlistData.songs}
              onCreatePlaylist={handleCreatePlaylist}
              onBackToNaming={handleBackToNaming}
              loading={loading}
              matchStats={matchingStats}
              progress={conversionProgress}
              onAddSpotifySong={handleAddSpotifySong}
              onAddSpotifyTrack={handleAddSpotifyTrack}
              onManualApprove={handleManualApprove}
            />
          )}
          
          {currentStep === ConversionStep.CREATE_PLAYLIST && (
            <CreationStep progress={conversionProgress} />
          )}
          
          {currentStep === ConversionStep.COMPLETED && (
            <CompletedStep 
              playlistUrl={playlistUrl}
              stats={matchingStats}
              onOpenSpotify={handleOpenSpotify}
              onStartOver={handleStartOver}
            />
          )}
          
          <div className="mt-8 border-t pt-6">
            <SpotifyAuth onLogin={handleLogin} isLoggedIn={isUserLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

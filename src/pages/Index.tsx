
import React from "react";
import { ConversionStep } from "@/types";
import UrlInput from "@/components/UrlInput";
import ExtractionStep from "@/components/ExtractionStep";
import SongEditStep from "@/components/SongEditStep";
import NamingStep from "@/components/NamingStep";
import ReviewStep from "@/components/ReviewStep";
import CreationStep from "@/components/CreationStep";
import CompletedStep from "@/components/CompletedStep";
import { usePlaylistConversion } from "@/hooks/usePlaylistConversion";
import { isLoggedIn } from "@/services/spotifyService";
import ProcessingSteps from "@/components/ProcessingSteps";
import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";

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

  // Calculate the number of selected songs for CreationStep
  const selectedSongsCount = playlistData.songs.filter(song => song.selected).length;

  // Show ads only after the first step
  const showAds = currentStep !== ConversionStep.INPUT_URL && 
                  currentStep !== ConversionStep.EXTRACTING;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="space-y-8">
        {/* Header component */}
        <Header />
        
        <ProcessingSteps currentStep={currentStep} />
        
        {/* Display top ad banner after first step */}
        {showAds && <AdBanner position="top" />}
        
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
              onContinue={handleCreatePlaylist}
              onBack={handleBackToNaming}
              onUpdate={handleSongUpdate}
              onAddSpotifySong={handleAddSpotifySong}
              onAddSpotifyTrack={handleAddSpotifyTrack}
              onManualApprove={handleManualApprove}
              loading={loading}
              playlistTitle={playlistData.title}
            />
          )}
          
          {currentStep === ConversionStep.CREATE_PLAYLIST && (
            <CreationStep 
              playlistTitle={playlistData.title}
              selectedSongsCount={selectedSongsCount}
              currentProgress={conversionProgress}
            />
          )}
          
          {currentStep === ConversionStep.COMPLETED && (
            <CompletedStep 
              playlistTitle={playlistData.title}
              matchingStats={matchingStats}
              onOpenSpotify={handleOpenSpotify}
              onStartOver={handleStartOver}
            />
          )}
        </div>
        
        {/* Display bottom ad banner after first step */}
        {showAds && <AdBanner position="bottom" />}
      </div>
    </div>
  );
};

export default Index;

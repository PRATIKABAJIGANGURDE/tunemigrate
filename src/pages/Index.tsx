
import React, { useEffect, useState } from "react";
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
import NewUserModal from "@/components/NewUserModal";
import { toast } from "sonner";

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
    handleManualApprove,
    handleAIMatchAll
  } = usePlaylistConversion();

  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(isLoggedIn());
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsUserLoggedIn(isLoggedIn());
    };
    
    // Check initially
    checkLoginStatus();
    
    // Add event listener to check when window gets focus
    window.addEventListener('focus', checkLoginStatus);
    
    // Debug loading state changes
    console.log(`Current loading state: ${loading}`);
    
    return () => {
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, [loading]);

  useEffect(() => {
    // Check if this is the first visit to the app
    const hasVisitedBefore = localStorage.getItem('has_visited_before');
    if (!hasVisitedBefore && currentStep === ConversionStep.INPUT_URL) {
      // Show the new user modal on first visit
      setShowNewUserModal(true);
    }
  }, [currentStep]);

  const handleExistingUser = () => {
    setShowNewUserModal(false);
    localStorage.setItem('has_visited_before', 'true');
  };

  const handleNewUser = () => {
    toast.success("Welcome to TuneMigrate! We'll guide you through the conversion process.");
    setShowNewUserModal(false);
    localStorage.setItem('has_visited_before', 'true');
  };

  // Calculate the number of selected songs for CreationStep
  const selectedSongsCount = playlistData.songs.filter(song => song.selected).length;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="space-y-8">
        {/* Header component */}
        <Header />
        
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
              onAIMatchAll={handleAIMatchAll}
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
      </div>

      {/* Modal for first-time visitors */}
      <NewUserModal
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onExistingUser={handleExistingUser}
        onNewUser={handleNewUser}
      />
    </div>
  );
};

export default Index;

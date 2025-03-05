
import { useState } from "react";
import { toast } from "sonner";
import { ConversionStep, Song, PlaylistData } from "@/types";
import { extractSongsFromPlaylist } from "@/services/youtubeService";
import { 
  createSpotifyPlaylistFromSongs,
  getAccessToken,
  findSpotifyTracks
} from "@/services/spotifyService";

export const usePlaylistConversion = () => {
  const [currentStep, setCurrentStep] = useState<ConversionStep>(ConversionStep.INPUT_URL);
  const [loading, setLoading] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistData>({
    title: "",
    songs: []
  });
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [matchingStats, setMatchingStats] = useState<{ matched: number; total: number } | null>(null);
  const [conversionProgress, setConversionProgress] = useState(0);

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
    
    if (!getAccessToken()) {
      toast.info("Please connect your Spotify account", {
        duration: 5000,
      });
      return;
    }
    
    // Move to Match Review step instead of immediately creating playlist
    setCurrentStep(ConversionStep.REVIEW_MATCHES);
    setLoading(true);
    
    try {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        throw new Error("Spotify access token not found");
      }
      
      // First, find matching tracks to display in the review step
      const selectedSongs = playlistData.songs.filter(song => song.selected);
      
      // Get matches but don't create the playlist yet
      const songsWithMatches = await findSpotifyTracks(
        selectedSongs, 
        accessToken,
        (progress) => {
          setConversionProgress(progress);
        }
      );
      
      setPlaylistData({
        ...playlistData,
        songs: songsWithMatches
      });
      
      setLoading(false);
      
      // Stats for the review screen
      const matchedCount = songsWithMatches.filter(s => s.selected && s.spotifyUri).length;
      setMatchingStats({
        matched: matchedCount,
        total: selectedSongs.length
      });
      
    } catch (error) {
      console.error("Error finding matches:", error);
      setLoading(false);
      setCurrentStep(ConversionStep.NAME_PLAYLIST);
      toast.error("Failed to find matches for songs. Please try again.");
    }
  };
  
  const handleCreatePlaylist = async () => {
    setCurrentStep(ConversionStep.CREATE_PLAYLIST);
    setLoading(true);
    setConversionProgress(0);
    
    try {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        throw new Error("Spotify access token not found");
      }
      
      // Songs already have spotifyUri from the review step, just need to create the playlist
      const result = await createSpotifyPlaylistFromSongs(
        accessToken,
        playlistData.title,
        playlistData.description || `Converted from YouTube with TuneMigrate`,
        playlistData.songs,
        (progress) => {
          setConversionProgress(progress);
        }
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
      setCurrentStep(ConversionStep.REVIEW_MATCHES);
      toast.error("Failed to create playlist. Please try again.");
    }
  };

  const handleBackToNaming = () => {
    setCurrentStep(ConversionStep.NAME_PLAYLIST);
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

  return {
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
    handleOpenSpotify
  };
};

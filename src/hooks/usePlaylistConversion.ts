import { useState } from "react";
import { toast } from "sonner";
import { ConversionStep, Song, PlaylistData } from "@/types";
import { extractSongsFromPlaylist } from "@/services/youtubeService";
import { 
  createSpotifyPlaylistFromSongs,
  getAccessToken,
  findSpotifyTracks,
  searchSpotifySongs
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
    
    setCurrentStep(ConversionStep.REVIEW_MATCHES);
    setLoading(true);
    
    try {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        throw new Error("Spotify access token not found");
      }
      
      const selectedSongs = playlistData.songs.filter(song => song.selected);
      
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

  const handleAddSpotifySong = async (query: string) => {
    if (!getAccessToken()) {
      toast.error("You must be connected to Spotify to search songs");
      return;
    }
    
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        throw new Error("Not logged in to Spotify");
      }
      
      const searchResults = await searchSpotifySongs(query, accessToken);
      
      if (searchResults.length === 0) {
        toast.info("No matching songs found");
        setLoading(false);
        return null;
      }
      
      return searchResults;
    } catch (error) {
      console.error("Error searching Spotify:", error);
      toast.error("Failed to search Spotify");
      setLoading(false);
      return null;
    }
  };

  const handleAddSpotifyTrack = (track: any) => {
    const newSong: Song = {
      id: `spotify-${track.id}`,
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      thumbnail: track.album.images[0]?.url,
      spotifyId: track.id,
      spotifyUri: track.uri,
      selected: true,
      matchConfidence: 100,
      spotifyTitle: track.name,
      spotifyArtist: track.artists.map((a: any) => a.name).join(", "),
      spotifyThumbnail: track.album.images[0]?.url,
      spotifyDuration: track.duration_ms ? `${Math.floor((track.duration_ms / 1000) / 60)}:${String(Math.floor((track.duration_ms / 1000) % 60)).padStart(2, '0')}` : undefined,
    };
    
    setPlaylistData({
      ...playlistData,
      songs: [...playlistData.songs, newSong]
    });
    
    toast.success(`Added "${track.name}" to playlist`);
    setLoading(false);
  };

  const handleManualApprove = async (songId: string) => {
    try {
      const updatedSongs = playlistData.songs.map(song => {
        if (song.id === songId) {
          return {
            ...song,
            manuallyApproved: true
          };
        }
        return song;
      });
      
      setPlaylistData({
        ...playlistData,
        songs: updatedSongs
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error manually approving song:", error);
      return Promise.reject(error);
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
      
      const selectedSongs = playlistData.songs.filter(song => 
        song.selected && (song.spotifyUri || song.manuallyApproved)
      );
      
      const result = await createSpotifyPlaylistFromSongs(
        accessToken,
        playlistData.title,
        playlistData.description || `Converted from YouTube with TuneMigrate`,
        selectedSongs,
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
    handleOpenSpotify,
    handleAddSpotifySong,
    handleAddSpotifyTrack,
    handleManualApprove
  };
};

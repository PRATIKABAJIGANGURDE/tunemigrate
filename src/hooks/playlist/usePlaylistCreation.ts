
import { toast } from "sonner";
import { ConversionStep, Song } from "@/types";
import { getAccessToken, validateToken, createSpotifyPlaylistFromSongs } from "@/services/spotifyService";
import { UsePlaylistCreationReturn } from "./types";

export const usePlaylistCreation = (
  state: {
    playlistData: { title: string; description?: string; songs: Song[] };
    playlistUrl: string | null;
  },
  actions: {
    setCurrentStep: (step: ConversionStep) => void;
    setLoading: (isLoading: boolean) => void;
    setPlaylistUrl: (url: string | null) => void;
    setConversionProgress: (progress: number) => void;
    setMatchingStats: (stats: { matched: number; total: number } | null) => void;
  }
): UsePlaylistCreationReturn => {
  
  const handleCreatePlaylist = async () => {
    actions.setCurrentStep(ConversionStep.CREATE_PLAYLIST);
    actions.setLoading(true);
    actions.setConversionProgress(0);
    
    try {
      const accessToken = await getAccessToken();
      
      if (!accessToken) {
        throw new Error("Spotify access token not found");
      }
      
      const isValid = await validateToken();
      if (!isValid) {
        throw new Error("Your Spotify session has expired. Please log in again.");
      }
      
      const selectedSongs = state.playlistData.songs.filter(song => 
        song.selected && (song.spotifyUri || song.manuallyApproved)
      );
      
      const result = await createSpotifyPlaylistFromSongs(
        accessToken,
        state.playlistData.title,
        state.playlistData.description || `Converted from YouTube with TuneMigrate`,
        selectedSongs,
        (progress) => {
          actions.setConversionProgress(progress);
        }
      );
      
      actions.setPlaylistUrl(result.playlistUrl);
      actions.setMatchingStats({
        matched: result.matchedCount,
        total: result.totalCount
      });
      
      actions.setLoading(false);
      actions.setCurrentStep(ConversionStep.COMPLETED);
      
      toast.success("Playlist created successfully!", {
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      actions.setLoading(false);
      actions.setCurrentStep(ConversionStep.REVIEW_MATCHES);
      toast.error(`Failed to create playlist: ${error.message || 'Unknown error'}`);
    }
  };

  const handleStartOver = () => {
    actions.setCurrentStep(ConversionStep.INPUT_URL);
  };

  const handleOpenSpotify = () => {
    if (state.playlistUrl) {
      window.open(state.playlistUrl, '_blank');
      toast.info("Opening Spotify playlist...");
    }
  };

  return {
    handleCreatePlaylist,
    handleStartOver,
    handleOpenSpotify
  };
};

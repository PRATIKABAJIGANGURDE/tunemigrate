
import { toast } from "sonner";
import { ConversionStep, Song } from "@/types";
import { getAccessToken, validateToken } from "@/services/spotifyService";
import { UsePlaylistNamingReturn } from "./types";
import { findSpotifyTracks } from "@/services/spotifyService";

export const usePlaylistNaming = (
  state: {
    playlistData: { title: string; description?: string; songs: Song[] };
  },
  actions: {
    setCurrentStep: (step: ConversionStep) => void;
    setLoading: (isLoading: boolean) => void;
    setPlaylistData: (data: { title: string; description?: string; songs: Song[] }) => void;
    updatePlaylistSongs: (songs: Song[]) => void;
    setConversionProgress: (progress: number) => void;
    setMatchingStats: (stats: { matched: number; total: number } | null) => void;
  }
): UsePlaylistNamingReturn => {
  
  const handlePlaylistNameSubmit = async (name: string, description: string) => {
    actions.setPlaylistData({
      ...state.playlistData,
      title: name,
      description
    });
    
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      toast.info("Please connect your Spotify account", {
        duration: 5000,
      });
      return;
    }
    
    try {
      const isValid = await validateToken();
      if (!isValid) {
        toast.error("Your Spotify session has expired. Please log in again.", {
          duration: 5000,
        });
        return;
      }
    } catch (error) {
      console.error("Error validating token:", error);
      toast.error("There was a problem with your Spotify connection. Please log in again.", {
        duration: 5000,
      });
      return;
    }
    
    actions.setCurrentStep(ConversionStep.REVIEW_MATCHES);
    actions.setLoading(true);
    
    try {
      const selectedSongs = state.playlistData.songs.filter(song => song.selected);
      
      const songsWithMatches = await findSpotifyTracks(
        selectedSongs, 
        accessToken,
        (progress) => {
          actions.setConversionProgress(progress);
        }
      );
      
      actions.updatePlaylistSongs(songsWithMatches);
      actions.setLoading(false);
      
      const matchedCount = songsWithMatches.filter(s => s.selected && s.spotifyUri).length;
      actions.setMatchingStats({
        matched: matchedCount,
        total: selectedSongs.length
      });
      
    } catch (error: any) {
      console.error("Error finding matches:", error);
      actions.setLoading(false);
      actions.setCurrentStep(ConversionStep.NAME_PLAYLIST);
      
      if (error.message?.includes("session expired") || error.message?.includes("log in again")) {
        toast.error("Spotify authentication failed. Please reconnect your account.", {
          duration: 5000,
        });
      } else {
        toast.error(`Failed to find matches for songs: ${error.message || "Unknown error"}`, {
          duration: 5000,
        });
      }
    }
  };

  const handleBackToNaming = () => {
    actions.setCurrentStep(ConversionStep.NAME_PLAYLIST);
  };

  return {
    handlePlaylistNameSubmit,
    handleBackToNaming
  };
};

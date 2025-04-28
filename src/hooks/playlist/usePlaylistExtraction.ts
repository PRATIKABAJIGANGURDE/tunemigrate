
import { toast } from "sonner";
import { ConversionStep, Song } from "@/types";
import { extractSongsFromPlaylist } from "@/services/youtubeService";
import { UsePlaylistExtractionReturn } from "./types";

export const usePlaylistExtraction = (
  state: {
    loading: boolean;
    playlistData: { title: string; songs: Song[] };
  },
  actions: {
    setLoading: (isLoading: boolean) => void;
    setCurrentStep: (step: ConversionStep) => void;
    setPlaylistData: (data: { title: string; songs: Song[] }) => void;
    updatePlaylistSongs: (songs: Song[]) => void;
  }
): UsePlaylistExtractionReturn => {
  
  const extractPlaylist = async (url: string) => {
    actions.setLoading(true);
    actions.setCurrentStep(ConversionStep.EXTRACTING);
    
    try {
      const extractedData = await extractSongsFromPlaylist(url);
      
      actions.setPlaylistData({
        title: extractedData.title,
        songs: extractedData.songs
      });
      
      actions.setLoading(false);
      actions.setCurrentStep(ConversionStep.EDIT_SONGS);
      toast.success(`${extractedData.songs.length} songs extracted successfully!`);
    } catch (error) {
      console.error("Error extracting songs:", error);
      actions.setLoading(false);
      actions.setCurrentStep(ConversionStep.INPUT_URL);
      toast.error("Failed to extract songs from playlist");
    }
  };

  const handleSongUpdate = (updatedSongs: Song[]) => {
    actions.updatePlaylistSongs(updatedSongs);
  };

  const handleContinueToNaming = () => {
    actions.setCurrentStep(ConversionStep.NAME_PLAYLIST);
  };

  return {
    extractPlaylist,
    handleSongUpdate,
    handleContinueToNaming
  };
};

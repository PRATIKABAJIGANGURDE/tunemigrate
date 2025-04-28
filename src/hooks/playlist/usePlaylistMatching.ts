
import { toast } from "sonner";
import { Song } from "@/types";
import { getAccessToken, searchSpotifySongs } from "@/services/spotifyService";
import { UsePlaylistMatchingReturn } from "./types";

export const usePlaylistMatching = (
  state: {
    playlistData: { title: string; songs: Song[] };
  },
  actions: {
    setLoading: (isLoading: boolean) => void;
    updatePlaylistSongs: (songs: Song[]) => void;
  }
): UsePlaylistMatchingReturn => {
  
  const handleAddSpotifySong = async (query: string) => {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      toast.error("You must be connected to Spotify to search songs");
      return null;
    }
    
    try {
      actions.setLoading(true);
      
      const searchResults = await searchSpotifySongs(query, accessToken);
      
      if (searchResults.length === 0) {
        toast.info("No matching songs found");
        actions.setLoading(false);
        return null;
      }
      
      return searchResults;
    } catch (error) {
      console.error("Error searching Spotify:", error);
      toast.error("Failed to search Spotify");
      actions.setLoading(false);
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
    
    actions.updatePlaylistSongs([...state.playlistData.songs, newSong]);
    
    toast.success(`Added "${track.name}" to playlist`);
    actions.setLoading(false);
  };

  const handleManualApprove = async (songId: string) => {
    try {
      const updatedSongs = state.playlistData.songs.map(song => {
        if (song.id === songId) {
          return {
            ...song,
            manuallyApproved: true
          };
        }
        return song;
      });
      
      actions.updatePlaylistSongs(updatedSongs);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error manually approving song:", error);
      return Promise.reject(error);
    }
  };

  return {
    handleAddSpotifySong,
    handleAddSpotifyTrack,
    handleManualApprove
  };
};

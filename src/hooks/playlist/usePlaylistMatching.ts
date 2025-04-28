
import { toast } from "sonner";
import { Song } from "@/types";
import { getAccessToken, searchSpotifySongs, searchTrack } from "@/services/spotifyService";
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

  // New function to handle batch AI matching for all unmatched songs
  const handleAIMatchAll = async () => {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      toast.error("You must be connected to Spotify to match songs");
      return;
    }
    
    try {
      actions.setLoading(true);
      
      // Find all selected songs without Spotify matches
      const unmatchedSongs = state.playlistData.songs.filter(
        song => song.selected && !song.spotifyUri
      );
      
      if (unmatchedSongs.length === 0) {
        toast.info("No unmatched songs found");
        actions.setLoading(false);
        return;
      }
      
      toast.info(`Finding matches for ${unmatchedSongs.length} songs...`);
      
      // Create a copy of the songs array to update
      const updatedSongs = [...state.playlistData.songs];
      let matchedCount = 0;
      
      // Process each unmatched song sequentially
      for (const song of unmatchedSongs) {
        try {
          const searchQuery = `${song.title} ${song.artist}`;
          const spotifyMatch = await searchTrack(song, accessToken);
          
          if (spotifyMatch) {
            // Find and update the song in our copied array
            const songIndex = updatedSongs.findIndex(s => s.id === song.id);
            if (songIndex !== -1) {
              updatedSongs[songIndex] = {
                ...updatedSongs[songIndex],
                spotifyId: spotifyMatch.id,
                spotifyUri: spotifyMatch.uri,
                spotifyTitle: spotifyMatch.name,
                spotifyArtist: spotifyMatch.artists.map((a: any) => a.name).join(", "),
                spotifyThumbnail: spotifyMatch.album?.images?.[0]?.url,
                spotifyDuration: spotifyMatch.duration_ms ? 
                  `${Math.floor((spotifyMatch.duration_ms / 1000) / 60)}:${String(Math.floor((spotifyMatch.duration_ms / 1000) % 60)).padStart(2, '0')}` : 
                  undefined,
                matchConfidence: spotifyMatch.confidence || 0
              };
              matchedCount++;
            }
          }
          
          // Update songs in state after each match to show progress
          if (matchedCount % 3 === 0 || matchedCount === unmatchedSongs.length) {
            actions.updatePlaylistSongs([...updatedSongs]);
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to allow UI updates
          }
        } catch (error) {
          console.error(`Failed to match song ${song.title}:`, error);
        }
      }
      
      // Final update to state with all changes
      actions.updatePlaylistSongs(updatedSongs);
      
      if (matchedCount > 0) {
        toast.success(`Successfully matched ${matchedCount} out of ${unmatchedSongs.length} songs`);
      } else {
        toast.error("Could not find matches for any songs");
      }
    } catch (error) {
      console.error("Error during AI matching:", error);
      toast.error("Failed to complete AI matching");
    } finally {
      actions.setLoading(false);
    }
  };

  return {
    handleAddSpotifySong,
    handleAddSpotifyTrack,
    handleManualApprove,
    handleAIMatchAll
  };
};

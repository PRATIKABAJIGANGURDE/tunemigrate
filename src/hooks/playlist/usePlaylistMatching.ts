
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

  // Helper function to delay execution (used for rate limiting)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Process songs in small batches with retry logic
  const processSongBatch = async (songs: Song[], accessToken: string, batchSize: number = 5, delayMs: number = 2000) => {
    const updatedSongs = [...state.playlistData.songs];
    let matchedCount = 0;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Process songs in small batches to avoid rate limits
    for (let i = 0; i < songs.length; i += batchSize) {
      const batch = songs.slice(i, i + batchSize);
      toast.info(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(songs.length/batchSize)}`);
      
      // Process each song in the current batch
      for (const song of batch) {
        try {
          const songIndex = updatedSongs.findIndex(s => s.id === song.id);
          if (songIndex === -1) continue;
          
          // Try to match the song with retry logic for rate limiting
          let spotifyMatch = null;
          let attempt = 0;
          
          while (!spotifyMatch && attempt < maxRetries) {
            try {
              spotifyMatch = await searchTrack(song, accessToken);
              if (spotifyMatch) {
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
            } catch (error: any) {
              attempt++;
              
              // Check if it's a rate limit error (429)
              if (error.message && error.message.includes('429')) {
                const waitTime = Math.min(2000 * Math.pow(2, attempt), 30000); // Exponential backoff with 30s max
                console.log(`Rate limit hit, retrying in ${waitTime}ms (attempt ${attempt})`);
                retryCount++;
                
                if (attempt < maxRetries) {
                  await delay(waitTime);
                } else {
                  toast.error("API rate limit reached. Try again later or process fewer songs.");
                  break;
                }
              } else {
                // For other errors, just log and continue
                console.error(`Error matching song ${song.title}:`, error);
                break;
              }
            }
          }
          
          // Small delay between songs in the same batch
          await delay(500);
        } catch (error) {
          console.error(`Failed to match song ${song.title}:`, error);
        }
      }
      
      // Update songs in state after each batch
      actions.updatePlaylistSongs([...updatedSongs]);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < songs.length) {
        toast.info("Pausing briefly to avoid rate limits...");
        await delay(delayMs);
      }
    }
    
    return { matchedCount, retryCount, updatedSongs };
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
      
      // Show warning if there are many songs to match
      if (unmatchedSongs.length > 15) {
        toast.warning(
          `You're trying to match ${unmatchedSongs.length} songs at once. API rate limits may cause some failures. Consider matching in smaller batches.`,
          { duration: 6000 }
        );
      }
      
      toast.info(`Finding matches for ${unmatchedSongs.length} songs...`);
      
      // Process songs in small batches with rate limiting
      const { matchedCount, retryCount, updatedSongs } = await processSongBatch(
        unmatchedSongs,
        accessToken,
        5,  // Process 5 songs at a time
        3000 // Wait 3 seconds between batches
      );
      
      // Final update to state with all changes
      actions.updatePlaylistSongs(updatedSongs);
      
      if (matchedCount > 0) {
        toast.success(`Successfully matched ${matchedCount} out of ${unmatchedSongs.length} songs`);
        if (retryCount > 0) {
          toast.info(`Had to retry ${retryCount} API calls due to rate limiting`);
        }
      } else {
        toast.error("Could not find matches for any songs");
      }
    } catch (error: any) {
      console.error("Error during AI matching:", error);
      
      // Better error messages for specific error types
      if (error.message && error.message.includes('429')) {
        toast.error("API rate limit reached. Please try again in a few minutes or match fewer songs at once.");
      } else if (error.message && error.message.includes('404')) {
        toast.error("AI service unavailable. Using fallback matching instead.");
      } else {
        toast.error("Failed to complete AI matching");
      }
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

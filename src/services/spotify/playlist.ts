/**
 * Spotify Playlist Creation Services
 */

import { Song } from "@/types";
import { searchTrack } from "./matcher";
import { refreshAccessToken } from "./utils/auth";
import { toast } from "sonner";

/**
 * Create a new playlist on Spotify
 */
export const createPlaylist = async (
  accessToken: string,
  name: string,
  description: string
): Promise<{ id: string; url: string }> => {
  try {
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (userResponse.status === 401) {
      // Token expired, attempt to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        return createPlaylist(newToken, name, description);
      } else {
        throw new Error("Session expired. Please log in again.");
      }
    }
    
    if (!userResponse.ok) {
      throw new Error(`Failed to get user profile: ${userResponse.statusText}`);
    }
    
    const userData = await userResponse.json();
    const userId = userData.id;
    
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          public: false
        })
      }
    );
    
    if (response.status === 401) {
      // Token expired, attempt to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        return createPlaylist(newToken, name, description);
      } else {
        throw new Error("Session expired. Please log in again.");
      }
    }
    
    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      url: data.external_urls.spotify
    };
  } catch (error: any) {
    console.error("Error creating playlist:", error);
    throw new Error(`Failed to create playlist: ${error.message}`);
  }
};

/**
 * Add tracks to a playlist
 */
export const addTracksToPlaylist = async (
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> => {
  try {
    for (let i = 0; i < trackUris.length; i += 100) {
      const chunk = trackUris.slice(i, i + 100);
      
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: chunk
          })
        }
      );
      
      if (response.status === 401) {
        // Token expired, attempt to refresh
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with new token
          await addTracksToPlaylist(newToken, playlistId, trackUris.slice(i));
          return;
        } else {
          throw new Error("Session expired. Please log in again.");
        }
      }
      
      if (!response.ok) {
        throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
      }
    }
  } catch (error: any) {
    console.error("Error adding tracks to playlist:", error);
    throw new Error(`Failed to add tracks: ${error.message}`);
  }
};

/**
 * Find Spotify track URIs for a list of songs
 */
export const findSpotifyTracks = async (
  songs: Song[], 
  accessToken: string,
  progressCallback?: (progress: number) => void
): Promise<Song[]> => {
  const enhancedSongs = [...songs];
  const selectedSongs = enhancedSongs.filter(song => song.selected);
  let processedCount = 0;
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 3;
  
  for (let i = 0; i < enhancedSongs.length; i++) {
    if (enhancedSongs[i].selected) {
      try {
        // Search with the full song information
        const result = await searchTrack(enhancedSongs[i], accessToken);
        
        if (result) {
          enhancedSongs[i].spotifyId = result.id;
          enhancedSongs[i].spotifyUri = result.uri;
          enhancedSongs[i].matchConfidence = result.confidence;
          
          // Add Spotify-specific details for display in the review step
          enhancedSongs[i].spotifyTitle = result.name;
          enhancedSongs[i].spotifyArtist = result.artists.map((a: any) => a.name).join(", ");
          enhancedSongs[i].spotifyThumbnail = result.album?.images?.[0]?.url;
          enhancedSongs[i].spotifyDuration = result.duration_ms ? 
            `${Math.floor((result.duration_ms / 1000) / 60)}:${String(Math.floor((result.duration_ms / 1000) % 60)).padStart(2, '0')}` : 
            undefined;
        }
        
        // Reset consecutive error count on success
        consecutiveErrors = 0;
        
        // Update progress
        processedCount++;
        if (progressCallback) {
          progressCallback(Math.round((processedCount / selectedSongs.length) * 100));
        }
        
        // Add a small delay between requests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        console.error(`Error finding track "${enhancedSongs[i].title}":`, error);
        
        // If the error is due to an expired token, try to refresh it
        if (error.message?.includes("401") || error.message?.includes("expired")) {
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              accessToken = newToken;
              // Retry the current song (don't increment i)
              i--;
              continue;
            }
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
          }
        }
        
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          toast.error("Multiple errors occurred while searching for songs. Please try again later.");
          break;
        }
        
        processedCount++;
        if (progressCallback) {
          progressCallback(Math.round((processedCount / selectedSongs.length) * 100));
        }
      }
    }
  }
  
  return enhancedSongs;
};

/**
 * Create a Spotify playlist from YouTube songs
 */
export const createSpotifyPlaylistFromSongs = async (
  accessToken: string,
  playlistName: string,
  playlistDescription: string,
  songs: Song[],
  progressCallback?: (progress: number) => void
): Promise<{ playlistUrl: string; matchedCount: number; totalCount: number }> => {
  try {
    // Validate the access token first
    const tokenValidationResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (tokenValidationResponse.status === 401 || tokenValidationResponse.status === 403) {
      console.log(`Token validation failed with status: ${tokenValidationResponse.status}. Attempting to refresh token...`);
      
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return createSpotifyPlaylistFromSongs(
            newToken, 
            playlistName, 
            playlistDescription, 
            songs, 
            progressCallback
          );
        } else {
          throw new Error("Your Spotify session has expired. Please log in again.");
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        throw new Error("Authentication failed. Please try logging in to Spotify again.");
      }
    }
    
    if (!tokenValidationResponse.ok) {
      const errorText = await tokenValidationResponse.text();
      console.error("Spotify API error:", errorText);
      throw new Error(`Failed to validate Spotify token: ${tokenValidationResponse.statusText}`);
    }
    
    const enhancedSongs = await findSpotifyTracks(songs, accessToken, progressCallback);
    
    const playlist = await createPlaylist(accessToken, playlistName, playlistDescription);
    
    // Get all songs with a spotifyUri
    // This now includes automatically matched, manually approved, and replaced songs
    const trackUris = enhancedSongs
      .filter(song => song.selected && (song.spotifyUri || song.isReplacement))
      .map(song => song.spotifyUri as string);
    
    if (trackUris.length > 0) {
      await addTracksToPlaylist(accessToken, playlist.id, trackUris);
    }
    
    return {
      playlistUrl: playlist.url,
      matchedCount: trackUris.length,
      totalCount: songs.filter(song => song.selected).length
    };
  } catch (error: any) {
    console.error("Error creating Spotify playlist:", error);
    throw new Error(`Failed to create playlist: ${error.message}`);
  }
};


/**
 * Spotify Playlist Creation Services
 */

import { Song } from "@/types";
import { searchTrack } from "./matcher";

/**
 * Create a new playlist on Spotify
 */
export const createPlaylist = async (
  accessToken: string,
  name: string,
  description: string
): Promise<{ id: string; url: string }> => {
  const userResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
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
  
  if (!response.ok) {
    throw new Error(`Failed to create playlist: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    id: data.id,
    url: data.external_urls.spotify
  };
};

/**
 * Add tracks to a playlist
 */
export const addTracksToPlaylist = async (
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> => {
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
    
    if (!response.ok) {
      throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
    }
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
        
        // Update progress
        processedCount++;
        if (progressCallback) {
          progressCallback(Math.round((processedCount / selectedSongs.length) * 100));
        }
      } catch (error) {
        console.error(`Error finding track "${enhancedSongs[i].title}":`, error);
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
  const enhancedSongs = await findSpotifyTracks(songs, accessToken, progressCallback);
  
  const playlist = await createPlaylist(accessToken, playlistName, playlistDescription);
  
  // Get all songs with a spotifyUri
  // This now includes both automatically matched and manually approved songs
  const trackUris = enhancedSongs
    .filter(song => song.selected && song.spotifyUri)
    .map(song => song.spotifyUri as string);
  
  if (trackUris.length > 0) {
    await addTracksToPlaylist(accessToken, playlist.id, trackUris);
  }
  
  return {
    playlistUrl: playlist.url,
    matchedCount: trackUris.length,
    totalCount: songs.filter(song => song.selected).length
  };
};

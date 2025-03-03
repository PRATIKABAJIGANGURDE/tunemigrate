import { Song } from "@/types";

const CLIENT_ID = "e4de652cc02f42d6b3bdfdc24e155fc6";
const REDIRECT_URI = window.location.origin + "/callback";

/**
 * Generate a random string for the state parameter
 */
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Generate a code verifier and challenge for PKCE
 */
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Initiate Spotify login
 */
export const initiateSpotifyLogin = async (): Promise<void> => {
  const state = generateRandomString(16);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store the code verifier in local storage for later use
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  
  // Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
    scope: 'playlist-modify-private playlist-modify-public user-read-private',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  
  // Redirect to Spotify authorization page
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> => {
  const codeVerifier = localStorage.getItem('spotify_code_verifier');
  
  if (!codeVerifier) {
    throw new Error("Code verifier not found");
  }
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Refresh the access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ access_token: string; expires_in: number }> => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Clean song title to improve search accuracy
 */
const cleanSongTitle = (title: string): string => {
  return title
    .replace(/\(Official Video\)/gi, '')
    .replace(/\(Official Music Video\)/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\(Lyrics\)/gi, '')
    .replace(/\(Lyric Video\)/gi, '')
    .replace(/\(Audio\)/gi, '')
    .replace(/\(Visualizer\)/gi, '')
    .replace(/\(Lyrics\/Lyric Video\)/gi, '')
    .replace(/\[Official Video\]/gi, '')
    .replace(/\[Official Music Video\]/gi, '')
    .replace(/\[Official Audio\]/gi, '')
    .replace(/\[Lyrics\]/gi, '')
    .replace(/\[Lyric Video\]/gi, '')
    .replace(/\[Audio\]/gi, '')
    .replace(/\[Visualizer\]/gi, '')
    .replace(/\[Lyrics\/Lyric Video\]/gi, '')
    .replace(/ft\.|feat\./gi, '')
    .replace(/\(ft\..*?\)/gi, '')
    .replace(/\(feat\..*?\)/gi, '')
    .replace(/HD|HQ/gi, '')
    .replace(/\d{4}/, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extract artist name from YouTube video title
 */
const extractArtistName = (videoTitle: string): string => {
  if (videoTitle.includes('-')) {
    const parts = videoTitle.split('-');
    return parts[0].trim();
  }
  
  return "";
};

/**
 * Search for a track on Spotify with improved accuracy
 */
export const searchTrack = async (query: string, accessToken: string): Promise<{ id: string; uri: string } | null> => {
  const cleanedQuery = cleanSongTitle(query);
  
  // Try to extract artist name
  const artist = extractArtistName(cleanedQuery);
  
  // First attempt: search with artist if available
  if (artist) {
    try {
      const artistTitleQuery = `${artist} ${cleanedQuery.replace(artist, '').trim()}`;
      
      const artistResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistTitleQuery)}&type=track&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (artistResponse.ok) {
        const artistData = await artistResponse.json();
        if (artistData.tracks && artistData.tracks.items && artistData.tracks.items.length > 0) {
          // Sort by popularity to get the most recognized version
          artistData.tracks.items.sort((a: any, b: any) => b.popularity - a.popularity);
          
          // Only return if popularity is reasonable
          if (artistData.tracks.items[0].popularity > 20) {
            return {
              id: artistData.tracks.items[0].id,
              uri: artistData.tracks.items[0].uri
            };
          }
        }
      }
    } catch (error) {
      console.error("Error in artist search:", error);
      // Continue to next search approach
    }
  }
  
  // Second attempt: search with the whole cleaned title
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanedQuery)}&type=track&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
        // Sort by popularity
        data.tracks.items.sort((a: any, b: any) => b.popularity - a.popularity);
        
        if (data.tracks.items[0].popularity > 20) {
          return {
            id: data.tracks.items[0].id,
            uri: data.tracks.items[0].uri
          };
        }
      }
    }
  } catch (error) {
    console.error("Error in full title search:", error);
  }
  
  // If we haven't found a good match, return null rather than a poor match
  return null;
};

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
        const title = enhancedSongs[i].title;
        const artist = extractArtistName(title);
        
        let result = null;
        if (artist) {
          result = await searchTrack(`${artist} ${cleanSongTitle(title.replace(artist, ''))}`, accessToken);
        }
        
        if (!result) {
          result = await searchTrack(title, accessToken);
        }
        
        if (result) {
          enhancedSongs[i].spotifyId = result.id;
          enhancedSongs[i].spotifyUri = result.uri;
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

/**
 * Check if user is logged in to Spotify
 */
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('spotify_access_token');
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('spotify_access_token');
};

/**
 * Logout from Spotify
 */
export const logout = (): void => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_code_verifier');
};

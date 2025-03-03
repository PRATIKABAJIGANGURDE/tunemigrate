
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
  // First, attempt to detect and remove channel names (usually ends with -, not in parentheses)
  let cleanedTitle = title;
  
  // Remove channel names at the beginning (Pattern: "Channel - Song Title")
  const channelMatch = cleanedTitle.match(/^(.+?)\s*-\s*(.+)$/);
  if (channelMatch) {
    // Only remove if what's before the dash looks like a channel name (not part of song title)
    const beforeDash = channelMatch[1].trim();
    if (beforeDash.split(' ').length <= 4 && !beforeDash.includes('(') && !beforeDash.includes('[')) {
      cleanedTitle = channelMatch[2].trim();
    }
  }
  
  // Common patterns to remove
  return cleanedTitle
    // Remove official video markers
    .replace(/\(Official Video\)/gi, '')
    .replace(/\(Official Music Video\)/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    // Remove lyric markers
    .replace(/\(Lyrics\)/gi, '')
    .replace(/\(Lyric Video\)/gi, '')
    .replace(/\(Lyrics\/Lyric Video\)/gi, '')
    .replace(/\(with Lyrics\)/gi, '')
    // Remove video quality markers
    .replace(/\(Audio\)/gi, '')
    .replace(/\(Visualizer\)/gi, '')
    .replace(/\[Official Video\]/gi, '')
    .replace(/\[Official Music Video\]/gi, '')
    .replace(/\[Official Audio\]/gi, '')
    .replace(/\[Lyrics\]/gi, '')
    .replace(/\[Lyric Video\]/gi, '')
    .replace(/\[Audio\]/gi, '')
    .replace(/\[Visualizer\]/gi, '')
    .replace(/\[Lyrics\/Lyric Video\]/gi, '')
    // Remove common YouTube channel suffixes
    .replace(/\|\s*[A-Za-z0-9\s]+\s*Official/gi, '')
    .replace(/VEVO/gi, '')
    // Remove feat. mentions which Spotify often formats differently
    .replace(/ft\.|feat\./gi, '')
    .replace(/\(ft\..*?\)/gi, '')
    .replace(/\(feat\..*?\)/gi, '')
    // Remove video quality markers
    .replace(/HD|HQ|4K|8K|1080p|720p/gi, '')
    // Remove years
    .replace(/\(\d{4}\)|\[\d{4}\]/, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Detect if the song is a live version, remix, or cover
 */
const detectSpecialVersion = (title: string): { 
  isLive: boolean; 
  isRemix: boolean;
  isCover: boolean;
} => {
  return {
    isLive: /\blive\b|\bconcert\b|\bperformance\b/i.test(title),
    isRemix: /\bremix\b|\bedit\b|\bflip\b|\bmashup\b/i.test(title),
    isCover: /\bcover\b|\btribute\b|\bversion by\b/i.test(title)
  };
};

/**
 * Extract artist name from YouTube video title
 */
const extractArtistName = (videoTitle: string): string => {
  // Look for pattern: Artist - Song Title
  const artistTitleMatch = videoTitle.match(/^(.+?)\s*-\s*(.+)$/);
  if (artistTitleMatch) {
    const potentialArtist = artistTitleMatch[1].trim();
    // Check if potential artist looks like an actual artist name (not too long)
    if (potentialArtist.split(' ').length <= 4 && !potentialArtist.includes('(') && !potentialArtist.includes('[')) {
      return potentialArtist;
    }
  }
  
  // If no clear artist from pattern, return empty string
  return "";
};

/**
 * Advanced search for a track on Spotify with multiple fallbacks
 */
export const searchTrack = async (query: string, accessToken: string): Promise<{ id: string; uri: string; popularity: number } | null> => {
  const cleanedQuery = cleanSongTitle(query);
  const { isLive, isRemix, isCover } = detectSpecialVersion(cleanedQuery);
  
  // Extract artist if possible
  const artist = extractArtistName(cleanedQuery);
  const songTitle = artist ? cleanedQuery.replace(artist + ' - ', '') : cleanedQuery;
  
  // Create a structured search query
  let searchResults = null;
  
  // STEP 1: Try searching with track: and artist: qualifiers (most precise)
  if (artist) {
    try {
      const structuredQuery = `track:${songTitle} artist:${artist}`;
      const structuredResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(structuredQuery)}&type=track&limit=10`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      
      if (structuredResponse.ok) {
        const data = await structuredResponse.json();
        if (data.tracks?.items?.length > 0) {
          // Filter and sort by popularity and matching criteria
          searchResults = findBestMatch(data.tracks.items, songTitle, artist, isLive, isRemix, isCover);
        }
      }
    } catch (error) {
      console.error("Error in structured search:", error);
    }
  }
  
  // STEP 2: If no results, try searching with just title and artist as regular query
  if (!searchResults && artist) {
    try {
      const query = `${songTitle} ${artist}`;
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.tracks?.items?.length > 0) {
          searchResults = findBestMatch(data.tracks.items, songTitle, artist, isLive, isRemix, isCover);
        }
      }
    } catch (error) {
      console.error("Error in basic search:", error);
    }
  }
  
  // STEP 3: Last resort - search with just the song title
  if (!searchResults) {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(songTitle)}&type=track&limit=10`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.tracks?.items?.length > 0) {
          searchResults = findBestMatch(data.tracks.items, songTitle, artist || "", isLive, isRemix, isCover);
        }
      }
    } catch (error) {
      console.error("Error in title-only search:", error);
    }
  }
  
  return searchResults;
};

/**
 * Find the best matching track from search results
 */
const findBestMatch = (
  tracks: any[], 
  songTitle: string, 
  artist: string, 
  isLive: boolean, 
  isRemix: boolean, 
  isCover: boolean
): { id: string; uri: string; popularity: number } | null => {
  // Clean strings for comparison
  const cleanTitle = songTitle.toLowerCase();
  const cleanArtist = artist.toLowerCase();
  
  // Filter out tracks with very low popularity
  const viableTracks = tracks.filter(track => track.popularity >= 20);
  
  if (viableTracks.length === 0) {
    return null;
  }
  
  // Score tracks by various criteria
  const scoredTracks = viableTracks.map(track => {
    let score = 0;
    
    // Base score from Spotify's popularity metric (0-100)
    score += track.popularity;
    
    const trackName = track.name.toLowerCase();
    const trackArtists = track.artists.map((a: any) => a.name.toLowerCase());
    
    // Title match score
    if (trackName === cleanTitle) {
      score += 50; // Perfect title match
    } else if (trackName.includes(cleanTitle) || cleanTitle.includes(trackName)) {
      score += 25; // Partial title match
    }
    
    // Artist match score
    if (cleanArtist && trackArtists.some(a => a === cleanArtist || a.includes(cleanArtist) || cleanArtist.includes(a))) {
      score += 50; // Artist match
    }
    
    // Special version handling (live, remix, cover)
    const trackIsLive = /\blive\b|\bconcert\b|\bperformance\b/i.test(trackName);
    const trackIsRemix = /\bremix\b|\bedit\b|\bflip\b|\bmashup\b/i.test(trackName);
    const trackIsCover = /\bcover\b|\btribute\b|\bversion by\b/i.test(trackName);
    
    // Penalize mismatches in special versions
    if (isLive !== trackIsLive) score -= 20;
    if (isRemix !== trackIsRemix) score -= 20;
    if (isCover !== trackIsCover) score -= 20;
    
    return { track, score };
  });
  
  // Sort by score
  scoredTracks.sort((a, b) => b.score - a.score);
  
  // Only return if the best match has a reasonable score
  if (scoredTracks.length > 0 && scoredTracks[0].score >= 70) {
    const bestMatch = scoredTracks[0].track;
    return {
      id: bestMatch.id,
      uri: bestMatch.uri,
      popularity: bestMatch.popularity
    };
  }
  
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
        
        // Search with the full song information
        const result = await searchTrack(title, accessToken);
        
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

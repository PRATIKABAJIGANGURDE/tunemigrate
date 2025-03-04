
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
 * Enhanced to better remove channel names and clean metadata
 */
const cleanSongTitle = (title: string): string => {
  // First, attempt to detect and remove channel names (usually ends with -, not in parentheses)
  let cleanedTitle = title;
  
  // Remove channel names at the beginning (Pattern: "Channel - Song Title")
  const channelMatch = cleanedTitle.match(/^(.+?)\s*-\s*(.+)$/);
  if (channelMatch) {
    // Only remove if what's before the dash looks like a channel name (not part of song title)
    const beforeDash = channelMatch[1].trim();
    if (beforeDash.split(' ').length <= 5 && !beforeDash.includes('(') && !beforeDash.includes('[')) {
      cleanedTitle = channelMatch[2].trim();
    }
  }
  
  // Common patterns to remove
  return cleanedTitle
    // Remove official video markers
    .replace(/\(Official Video\)/gi, '')
    .replace(/\(Official Music Video\)/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\(Official Lyric Video\)/gi, '')
    .replace(/\(Official Performance Video\)/gi, '')
    // Remove lyric markers
    .replace(/\(Lyrics\)/gi, '')
    .replace(/\(Lyric Video\)/gi, '')
    .replace(/\(Lyrics\/Lyric Video\)/gi, '')
    .replace(/\(with Lyrics\)/gi, '')
    .replace(/\(ft\..*?\)/gi, '')
    .replace(/\(feat\..*?\)/gi, '')
    // Remove video quality markers
    .replace(/\(Audio\)/gi, '')
    .replace(/\(Visualizer\)/gi, '')
    .replace(/\[Official Video\]/gi, '')
    .replace(/\[Official Music Video\]/gi, '')
    .replace(/\[Official Audio\]/gi, '')
    .replace(/\[Official Lyric Video\]/gi, '')
    .replace(/\[Lyrics\]/gi, '')
    .replace(/\[Lyric Video\]/gi, '')
    .replace(/\[Audio\]/gi, '')
    .replace(/\[Visualizer\]/gi, '')
    .replace(/\[Lyrics\/Lyric Video\]/gi, '')
    // Remove common YouTube channel suffixes
    .replace(/\|\s*[A-Za-z0-9\s]+\s*Official/gi, '')
    .replace(/VEVO/gi, '')
    // Remove feat. mentions which Spotify often formats differently
    .replace(/\s+ft\.|\s+feat\./gi, '')
    // Remove video quality markers
    .replace(/HD|HQ|4K|8K|1080p|720p/gi, '')
    // Remove years in parentheses and brackets
    .replace(/\(\d{4}\)|\[\d{4}\]/g, '')
    // Remove premiere/release labels
    .replace(/\bpremiere\b|\brelease\b/gi, '')
    // Remove special unicode characters that might affect search
    .replace(/[^\w\s\(\)\[\]\-&]/g, ' ')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Detect if the song is a live version, remix, or cover
 * Enhanced to detect more special version patterns
 */
const detectSpecialVersion = (title: string): { 
  isLive: boolean; 
  isRemix: boolean;
  isCover: boolean;
  isAcoustic: boolean;
} => {
  const lowerTitle = title.toLowerCase();
  return {
    isLive: /\blive\b|\bconcert\b|\bperformance\b|\bunplugged\b|\bsession\b/i.test(lowerTitle),
    isRemix: /\bremix\b|\bedit\b|\bflip\b|\bmashup\b|\bbootleg\b|\brework\b/i.test(lowerTitle),
    isCover: /\bcover\b|\btribute\b|\bversion by\b|\bperformed by\b/i.test(lowerTitle),
    isAcoustic: /\bacoustic\b|\bstripped\b|\bpiano\b|\bunplugged\b/i.test(lowerTitle)
  };
};

/**
 * Extract artist name from YouTube video title with improved pattern recognition
 */
const extractArtistName = (videoTitle: string): string => {
  // Look for the most common pattern: Artist - Song Title
  const artistTitleMatch = videoTitle.match(/^(.+?)\s*-\s*(.+)$/);
  if (artistTitleMatch) {
    const potentialArtist = artistTitleMatch[1].trim();
    // Check if potential artist looks like an actual artist name (not too long)
    if (potentialArtist.split(' ').length <= 5 && !potentialArtist.includes('(') && !potentialArtist.includes('[')) {
      return potentialArtist;
    }
  }
  
  // Look for "by Artist" pattern
  const byArtistMatch = videoTitle.match(/\bby\s+([^()\[\]]+)/i);
  if (byArtistMatch) {
    return byArtistMatch[1].trim();
  }
  
  // If no clear artist from patterns, return empty string
  return "";
};

/**
 * Extract song title (without artist name) with improved accuracy
 */
const extractSongTitle = (videoTitle: string, artistName: string): string => {
  // If we have an artist name and the title follows the "Artist - Song" format
  if (artistName) {
    // Remove the artist and the dash
    let title = videoTitle.replace(new RegExp(`^${artistName}\\s*-\\s*`, 'i'), '');
    
    // Clean up any featuring artists which might be in parentheses
    title = title.replace(/\(ft\..*?\)/gi, '').replace(/\(feat\..*?\)/gi, '');
    
    // Clean up common YouTube title additions
    return cleanSongTitle(title);
  }
  
  // If we couldn't extract an artist, just clean the whole title
  return cleanSongTitle(videoTitle);
};

/**
 * Calculate similarity score between two strings
 * Used for fuzzy matching of titles and artists
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact match
  if (s1 === s2) return 100;
  
  // One is substring of the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const longerLength = Math.max(s1.length, s2.length);
    const shorterLength = Math.min(s1.length, s2.length);
    return Math.floor((shorterLength / longerLength) * 100);
  }
  
  // Simple word matching (how many words match between the two strings)
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchCount = 0;
  for (const word1 of words1) {
    if (word1.length <= 2) continue; // Skip very short words
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matchCount++;
    }
  }
  
  return Math.floor((matchCount / Math.max(words1.length, words2.length)) * 100);
};

/**
 * Advanced search for a track on Spotify with multiple fallbacks
 * Enhanced with structured queries and fuzzy matching
 */
export const searchTrack = async (query: string, accessToken: string): Promise<{ id: string; uri: string; popularity: number } | null> => {
  // Clean the title to remove YouTube-specific formatting
  const cleanedQuery = cleanSongTitle(query);
  const specialVersion = detectSpecialVersion(cleanedQuery);
  
  // Extract artist and song title components
  const artist = extractArtistName(cleanedQuery);
  let songTitle = extractSongTitle(cleanedQuery, artist);
  
  console.log("Clean query:", cleanedQuery);
  console.log("Extracted artist:", artist);
  console.log("Extracted song title:", songTitle);
  console.log("Special version:", specialVersion);
  
  // Store all search results to analyze and select the best match
  let allResults: any[] = [];
  
  // STEP 1: Try searching with track: and artist: qualifiers (most precise)
  if (artist) {
    try {
      const structuredQuery = `track:${songTitle} artist:${artist}`;
      console.log("Trying structured query:", structuredQuery);
      
      const structuredResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(structuredQuery)}&type=track&limit=15`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      
      if (structuredResponse.ok) {
        const data = await structuredResponse.json();
        if (data.tracks?.items?.length > 0) {
          console.log(`Found ${data.tracks.items.length} results with structured query`);
          allResults = [...data.tracks.items];
        }
      }
    } catch (error) {
      console.error("Error in structured search:", error);
    }
  }
  
  // STEP 2: If few results, try searching with just title and artist as regular query
  if (allResults.length < 5 && artist) {
    try {
      const query = `${songTitle} ${artist}`;
      console.log("Trying basic query:", query);
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.tracks?.items?.length > 0) {
          console.log(`Found ${data.tracks.items.length} results with basic query`);
          // Add only new tracks we haven't seen yet
          const existingIds = new Set(allResults.map(track => track.id));
          const newTracks = data.tracks.items.filter((track: any) => !existingIds.has(track.id));
          allResults = [...allResults, ...newTracks];
        }
      }
    } catch (error) {
      console.error("Error in basic search:", error);
    }
  }
  
  // STEP 3: If still few results, search with just the song title
  if (allResults.length < 5) {
    try {
      console.log("Trying title-only query:", songTitle);
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(songTitle)}&type=track&limit=15`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.tracks?.items?.length > 0) {
          console.log(`Found ${data.tracks.items.length} results with title-only query`);
          // Add only new tracks we haven't seen yet
          const existingIds = new Set(allResults.map(track => track.id));
          const newTracks = data.tracks.items.filter((track: any) => !existingIds.has(track.id));
          allResults = [...allResults, ...newTracks];
        }
      }
    } catch (error) {
      console.error("Error in title-only search:", error);
    }
  }
  
  // If we found results, score them and find the best match
  if (allResults.length > 0) {
    const bestMatch = findBestMatch(allResults, songTitle, artist, specialVersion);
    
    if (bestMatch) {
      console.log("Best match found:", bestMatch.name, "by", bestMatch.artists[0].name, "with score:", bestMatch.matchScore);
      return {
        id: bestMatch.id,
        uri: bestMatch.uri,
        popularity: bestMatch.popularity
      };
    }
  }
  
  console.log("No good match found for:", query);
  return null;
};

/**
 * Enhanced algorithm to find the best matching track from search results
 * Uses a scoring system based on multiple criteria
 */
const findBestMatch = (
  tracks: any[], 
  songTitle: string, 
  artist: string, 
  specialVersion: { isLive: boolean; isRemix: boolean; isCover: boolean; isAcoustic: boolean }
): any | null => {
  // Clean strings for comparison
  const cleanTitle = songTitle.toLowerCase();
  const cleanArtist = artist ? artist.toLowerCase() : '';
  
  // Filter out tracks with very low popularity as they are likely to be wrong matches
  const viableTracks = tracks.filter(track => track.popularity >= 20);
  
  if (viableTracks.length === 0) {
    return null;
  }
  
  // Score tracks by various criteria
  const scoredTracks = viableTracks.map(track => {
    const trackName = track.name.toLowerCase();
    const trackArtists = track.artists.map((a: any) => a.name.toLowerCase());
    
    // Start with the popularity as base score (0-100)
    let score = track.popularity;
    
    // Title similarity score (0-100)
    const titleSimilarity = calculateSimilarity(trackName, cleanTitle);
    score += titleSimilarity * 2; // Weight title similarity highly
    
    // Artist match score
    let artistScore = 0;
    if (cleanArtist) {
      // Try to find best matching artist among track artists
      const artistSimilarities = trackArtists.map(a => calculateSimilarity(a, cleanArtist));
      artistScore = Math.max(...artistSimilarities);
      score += artistScore * 2; // Weight artist match highly
    }
    
    // Special version handling (live, remix, cover, acoustic)
    const trackIsLive = /\blive\b|\bconcert\b|\bperformance\b|\bunplugged\b|\bsession\b/i.test(trackName);
    const trackIsRemix = /\bremix\b|\bedit\b|\bflip\b|\bmashup\b|\brework\b/i.test(trackName);
    const trackIsCover = /\bcover\b|\btribute\b|\bversion by\b|\bperformed by\b/i.test(trackName);
    const trackIsAcoustic = /\bacoustic\b|\bstripped\b|\bpiano\b|\bunplugged\b/i.test(trackName);
    
    // Penalize mismatches in special versions
    if (specialVersion.isLive !== trackIsLive) score -= 40;
    if (specialVersion.isRemix !== trackIsRemix) score -= 40;
    if (specialVersion.isCover !== trackIsCover) score -= 40;
    if (specialVersion.isAcoustic !== trackIsAcoustic) score -= 20;
    
    // Penalize if title lengths are very different
    const titleLengthDiff = Math.abs(trackName.length - cleanTitle.length) / Math.max(trackName.length, cleanTitle.length);
    if (titleLengthDiff > 0.5) { // If more than 50% difference in length
      score -= 30;
    }
    
    console.log(`${track.name} by ${track.artists[0].name} - Score: ${score} (Title:${titleSimilarity}, Artist:${artistScore}, Pop:${track.popularity})`);
    
    return { 
      ...track, 
      matchScore: score,
      titleSimilarity: titleSimilarity,
      artistSimilarity: artistScore 
    };
  });
  
  // Sort by score
  scoredTracks.sort((a, b) => b.matchScore - a.matchScore);
  
  // Only return if the best match has a reasonable score and title similarity
  if (scoredTracks.length > 0) {
    const bestMatch = scoredTracks[0];
    
    // Require a minimum score threshold that's based on both 
    // popularity and matching criteria
    if (bestMatch.matchScore >= 150 && bestMatch.titleSimilarity >= 50) {
      return bestMatch;
    }
    
    // Special case for exact title match with good popularity
    if (bestMatch.titleSimilarity >= 95 && bestMatch.popularity >= 40) {
      return bestMatch;
    }
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

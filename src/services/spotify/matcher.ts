/**
 * Advanced Spotify track matching functionality
 */

import { Song } from "@/types";
import { 
  cleanSongTitle, 
  detectSpecialVersion, 
  extractArtistName, 
  extractSongTitle 
} from "./utils/songCleaner";
import { 
  calculateStringSimilarity, 
  durationToSeconds, 
  compareDurations, 
  compareReleaseDates
} from "./utils/similarity";

/**
 * Calculate a confidence score for how well a spotify track matches a youtube song
 * Returns a value from 0-100
 */
export const calculateMatchConfidence = (
  song: Song,
  spotifyTrack: any
): number => {
  let confidence = 0;
  
  // Extract relevant data
  const youtubeTitle = cleanSongTitle(song.title);
  const youtubeArtist = song.artist || extractArtistName(song.title);
  const youtubeDuration = song.duration;
  const youtubeUploadDate = song.uploadDate;
  
  const spotifyTitle = spotifyTrack.name;
  const spotifyArtist = spotifyTrack.artists[0].name;
  const spotifyDuration = spotifyTrack.duration_ms;
  const spotifyReleaseDate = spotifyTrack.album?.release_date;
  
  console.log(`Calculating confidence for "${youtubeTitle}" by ${youtubeArtist} vs "${spotifyTitle}" by ${spotifyArtist}`);
  
  // Exact match (after cleaning) is a guaranteed high score
  const normalizedYoutubeTitle = youtubeTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const normalizedSpotifyTitle = spotifyTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  if (normalizedYoutubeTitle === normalizedSpotifyTitle && 
      youtubeArtist.toLowerCase().includes(spotifyArtist.toLowerCase()) || 
      spotifyArtist.toLowerCase().includes(youtubeArtist.toLowerCase())) {
    return 90; // Very high confidence for exact title match with artist overlap
  }
  
  // Title similarity (40% weight)
  const titleSimilarity = calculateStringSimilarity(youtubeTitle, spotifyTitle);
  confidence += titleSimilarity * 40;
  
  // Artist similarity (30% weight)
  const artistSimilarity = calculateStringSimilarity(youtubeArtist, spotifyArtist);
  confidence += artistSimilarity * 30;
  
  // Duration similarity (30% weight) - this is now more important
  const durationScore = compareDurations(youtubeDuration, spotifyDuration);
  confidence += (durationScore / 100) * 30;
  
  console.log(`Duration comparison: YouTube=${youtubeDuration}, Spotify=${spotifyDuration/1000}s, Score=${durationScore}`);
  
  // Add bonus for temporal proximity between upload and release
  const dateScore = compareReleaseDates(youtubeUploadDate, spotifyReleaseDate);
  confidence += dateScore;
  
  console.log(`Confidence breakdown - Title: ${titleSimilarity * 40}, Artist: ${artistSimilarity * 30}, Duration: ${(durationScore / 100) * 30}, Date: ${dateScore}`);
  console.log(`Final confidence: ${Math.min(100, Math.max(0, confidence))}`);
  
  return Math.min(100, Math.max(0, Math.round(confidence)));
};

/**
 * Find the best matching track from search results
 * Uses a scoring system based on multiple criteria
 */
export const findBestMatch = (
  tracks: any[], 
  songTitle: string, 
  artist: string, 
  specialVersion: { isLive: boolean; isRemix: boolean; isCover: boolean; isAcoustic: boolean },
  duration?: string,
  uploadDate?: string
): any | null => {
  // Clean strings for comparison
  const cleanTitle = songTitle.toLowerCase();
  const cleanArtist = artist ? artist.toLowerCase() : '';
  
  if (tracks.length === 0) {
    return null;
  }
  
  // Score tracks by various criteria
  const scoredTracks = tracks.map(track => {
    // Calculate confidence score
    const song: Song = {
      id: 'temp',
      title: songTitle,
      artist: artist,
      duration: duration,
      uploadDate: uploadDate,
      selected: true
    };
    
    const confidenceScore = calculateMatchConfidence(song, track);
    
    // Consider special version matching (live, remix, cover, acoustic)
    const trackIsLive = /\blive\b|\bconcert\b|\bperformance\b|\bunplugged\b|\bsession\b/i.test(track.name);
    const trackIsRemix = /\bremix\b|\bedit\b|\bflip\b|\bmashup\b|\brework\b/i.test(track.name);
    const trackIsCover = /\bcover\b|\btribute\b|\bversion by\b|\bperformed by\b/i.test(track.name);
    const trackIsAcoustic = /\bacoustic\b|\bstripped\b|\bpiano\b|\bunplugged\b/i.test(track.name);
    
    // Penalize mismatches in special versions
    let adjustedScore = confidenceScore;
    if (specialVersion.isLive !== trackIsLive) adjustedScore -= 20;
    if (specialVersion.isRemix !== trackIsRemix) adjustedScore -= 20;
    if (specialVersion.isCover !== trackIsCover) adjustedScore -= 20;
    if (specialVersion.isAcoustic !== trackIsAcoustic) adjustedScore -= 10;
    
    return { 
      ...track, 
      matchScore: adjustedScore,
      confidenceScore
    };
  });
  
  // Sort by score
  scoredTracks.sort((a, b) => b.matchScore - a.matchScore);
  
  // Only return if the best match has a reasonable score
  if (scoredTracks.length > 0) {
    const bestMatch = scoredTracks[0];
    
    // Threshold based on confidence score
    if (bestMatch.confidenceScore >= 70) {
      return bestMatch;
    }
    
    // Special case for tracks with very high popularity even if confidence is lower
    if (bestMatch.confidenceScore >= 60 && bestMatch.popularity >= 70) {
      return bestMatch;
    }
  }
  
  return null;
};

/**
 * Advanced search for a track on Spotify with multiple fallbacks
 * Enhanced with structured queries, fuzzy matching, and additional metadata
 */
export const searchTrack = async (song: Song, accessToken: string): Promise<{ id: string; uri: string; popularity: number; confidence: number } | null> => {
  // Clean the title to remove YouTube-specific formatting
  const cleanedQuery = cleanSongTitle(song.title);
  const specialVersion = detectSpecialVersion(cleanedQuery);
  
  // Extract artist and song title components
  const artist = extractArtistName(cleanedQuery);
  let songTitle = extractSongTitle(cleanedQuery, artist);
  
  console.log("Clean query:", cleanedQuery);
  console.log("Extracted artist:", artist);
  console.log("Extracted song title:", songTitle);
  console.log("Special version:", specialVersion);
  console.log("Duration:", song.duration);
  console.log("Upload date:", song.uploadDate);
  
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
    const bestMatch = findBestMatch(allResults, songTitle, artist, specialVersion, song.duration, song.uploadDate);
    
    if (bestMatch) {
      console.log("Best match found:", bestMatch.name, "by", bestMatch.artists[0].name, "with score:", bestMatch.matchScore);
      return {
        id: bestMatch.id,
        uri: bestMatch.uri,
        popularity: bestMatch.popularity,
        confidence: bestMatch.confidenceScore
      };
    }
  }
  
  console.log("No good match found for:", song.title);
  return null;
};

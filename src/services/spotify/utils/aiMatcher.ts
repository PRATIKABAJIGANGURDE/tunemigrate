
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Song } from "@/types";

// Store API key in a place that would be secure in production
// In a real app, this would come from environment variables or server-side
let geminiApiKey: string | null = null;

export const setGeminiApiKey = (key: string) => {
  geminiApiKey = key;
};

export const getGeminiApiKey = () => geminiApiKey;

/**
 * Extract artist name using Gemini AI
 */
export const extractArtistWithAI = async (title: string): Promise<string> => {
  if (!geminiApiKey) {
    console.log("No Gemini API key set, using fallback extraction");
    return fallbackArtistExtraction(title);
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Extract the primary artist name from this song title. 
    Only return the artist name. If multiple artists, return the first/main artist.
    
    Song Title: ${title}
    Artist Name:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const artistName = response.text().trim();
    
    console.log(`AI extracted artist "${artistName}" from "${title}"`);
    return artistName;
  } catch (error) {
    console.error("Gemini AI Artist Extraction Error:", error);
    // Fallback to basic extraction
    return fallbackArtistExtraction(title);
  }
};

/**
 * Fallback method to extract artist when AI is unavailable
 */
export const fallbackArtistExtraction = (title: string): string => {
  // Basic artist extraction patterns
  const patterns = [
    /^(.*?)\s*[-–:]\s*/,  // Matches "Artist - Title" format
    /^(.*?)\s*\(/,        // Matches "Artist (Title)" format
    /^(.*?)\s*ft\./i,     // Matches "Artist ft." format
    /^(.*?)\s*feat\./i,   // Matches "Artist feat." format
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }

  return '';
};

/**
 * Calculate string similarity using Levenshtein distance
 */
export const calculateLevenshteinSimilarity = (str1: string, str2: string): number => {
  const levenshteinDistance = (s1: string, s2: string): number => {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[s2.length][s1.length];
  };

  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  const distance = levenshteinDistance(str1, str2);
  
  // Higher similarity score for closer matches
  return Math.max(0, Math.min(100, Math.round((1 - (distance / maxLen)) * 100)));
};

/**
 * Compare artists with more flexibility
 * This handles cases where the uploader isn't the artist
 */
export const compareArtistsFlexibly = (youtubeName: string, spotifyName: string): number => {
  // Normalize names
  const normalizeArtist = (name: string): string => {
    return name.toLowerCase()
      .replace(/official|music|vevo|channel|records|recordings/gi, '')
      .replace(/\(.*?\)|\[.*?\]/g, '')
      .trim();
  };
  
  const normalizedYoutube = normalizeArtist(youtubeName);
  const normalizedSpotify = normalizeArtist(spotifyName);
  
  // Check for exact match after normalization
  if (normalizedYoutube === normalizedSpotify) {
    return 100;
  }
  
  // Check if one contains the other
  if (normalizedYoutube.includes(normalizedSpotify) || normalizedSpotify.includes(normalizedYoutube)) {
    return 80;
  }
  
  // Split names into parts and check for partial matches
  const youtubeWords = normalizedYoutube.split(/\s+/).filter(w => w.length > 2);
  const spotifyWords = normalizedSpotify.split(/\s+/).filter(w => w.length > 2);
  
  let matchCount = 0;
  for (const word of youtubeWords) {
    if (spotifyWords.some(w => w.includes(word) || word.includes(w))) {
      matchCount++;
    }
  }
  
  if (youtubeWords.length === 0) return 30; // No meaningful words to compare
  
  return Math.min(100, Math.round((matchCount / youtubeWords.length) * 100));
};

/**
 * Gets detailed song match information 
 */
export const getMatchDetails = (song: Song, spotifyTrack: any): {
  artistMatch: number;
  titleMatch: number;
  durationMatch: number;
  dateMatch: number;
  totalScore: number;
} => {
  // Convert song duration from string format (e.g., "3:45") to seconds
  const durationToSeconds = (duration?: string): number => {
    if (!duration) return 0;
    
    const parts = duration.split(':').map(Number);
    
    if (parts.length === 3) { // H:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // M:SS
      return parts[0] * 60 + parts[1];
    }
    
    return 0;
  };

  // Artist matching with flexible comparison (40% weight)
  const songArtist = song.artist.toLowerCase();
  const spotifyArtist = spotifyTrack.artists[0].name.toLowerCase();
  
  // Use flexible artist comparison to better handle YouTube channel vs actual artist names
  const artistMatch = compareArtistsFlexibly(songArtist, spotifyArtist);
  
  // Title matching (30% weight)
  const songTitle = song.title.toLowerCase();
  const spotifyTitle = spotifyTrack.name.toLowerCase();
  const titleMatch = calculateLevenshteinSimilarity(songTitle, spotifyTitle);

  // Duration matching (20% weight) - more heavily weighted in our algorithm now
  const songDuration = durationToSeconds(song.duration);
  const spotifyDuration = spotifyTrack.duration_ms / 1000; // convert ms to seconds
  
  let durationMatch = 100;
  const durationDiff = Math.abs(songDuration - spotifyDuration);
  
  if (durationDiff <= 3) {
    durationMatch = 100; // Perfect match
  } else if (durationDiff <= 10) {
    durationMatch = 95; // Very close match
  } else if (durationDiff <= 20) {
    durationMatch = 85; // Close match
  } else if (durationDiff <= 30) {
    durationMatch = 70; // Acceptable
  } else if (durationDiff <= 60) {
    durationMatch = 50; // Questionable
  } else if (durationDiff <= 120) {
    durationMatch = 20; // Poor match
  } else {
    durationMatch = 0; // Not a match
  }
  
  // Date matching (10% weight)
  // If we have both dates, compare them
  let dateMatch = 50; // Default to neutral if we can't compare

  if (song.uploadDate && spotifyTrack.album?.release_date) {
    const uploadDate = new Date(song.uploadDate);
    const releaseDate = new Date(spotifyTrack.album.release_date);
    
    const timeDiff = Math.abs(uploadDate.getTime() - releaseDate.getTime());
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    if (daysDiff <= 7) {
      dateMatch = 100; // Very close dates
    } else if (daysDiff <= 30) {
      dateMatch = 80; // Within a month
    } else if (daysDiff <= 180) {
      dateMatch = 60; // Within 6 months
    } else if (daysDiff <= 365) {
      dateMatch = 40; // Within a year
    } else {
      dateMatch = 20; // More than a year apart
    }
  }
  
  // Calculate weighted total score
  const totalScore = Math.round(
    (artistMatch * 0.3) +
    (titleMatch * 0.3) +
    (durationMatch * 0.35) +  // Increased weight for duration
    (dateMatch * 0.05)
  );
  
  return {
    artistMatch,
    titleMatch,
    durationMatch,
    dateMatch,
    totalScore
  };
};

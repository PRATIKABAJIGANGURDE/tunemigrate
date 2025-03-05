
/**
 * Utilities for calculating similarities between songs
 */

/**
 * Calculate string similarity using a combination of methods
 * Returns a value between 0-1 where 1 is exact match
 */
export const calculateStringSimilarity = (str1: string, str2: string): number => {
  // Normalize strings - remove special characters, lowercase
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  const a = normalize(str1);
  const b = normalize(str2);
  
  // Check for exact match after normalization
  if (a === b) return 1.0;
  
  // Check if one is a substring of the other
  if (a.includes(b) || b.includes(a)) {
    const longerLength = Math.max(a.length, b.length);
    const shorterLength = Math.min(a.length, b.length);
    return shorterLength / longerLength;
  }
  
  // Check individual word matches
  const wordsA = a.split(/\s+/).filter(w => w.length > 2);
  const wordsB = b.split(/\s+/).filter(w => w.length > 2);
  
  let matchCount = 0;
  for (const wordA of wordsA) {
    if (wordsB.some(wordB => wordB.includes(wordA) || wordA.includes(wordB))) {
      matchCount++;
    }
  }
  
  const wordMatchRatio = wordsA.length > 0 ? matchCount / wordsA.length : 0;
  
  // Return weighted combination
  return wordMatchRatio;
};

/**
 * Convert duration string (like "3:45") to seconds
 */
export const durationToSeconds = (duration?: string): number => {
  if (!duration) return 0;
  
  const parts = duration.split(':').map(Number);
  
  if (parts.length === 3) { // H:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) { // M:SS
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
};

/**
 * Compare song durations to improve matching
 * Returns a score from 0-100, with 100 being an exact match
 * Updated to be more strict with duration differences
 */
export const compareDurations = (ytDuration?: string, spotifyDurationMs?: number): number => {
  if (!ytDuration || !spotifyDurationMs) return 50; // Neutral score if we can't compare
  
  try {
    // Convert YouTube duration (e.g., "3:42") to seconds
    const ytSeconds = durationToSeconds(ytDuration);
    
    // Convert Spotify duration from ms to seconds
    const spotifySeconds = spotifyDurationMs / 1000;
    
    // Calculate absolute difference in seconds
    const diffSeconds = Math.abs(ytSeconds - spotifySeconds);
    
    // Updated scoring logic per requirement:
    // - If difference is less than 10 seconds: 100 (perfect match)
    // - If difference is between 10-20 seconds: linear scale from 100 to 90
    // - If difference is between 20-30 seconds: linear scale from 90 to 70
    // - If difference is between 30-60 seconds: linear scale from 70 to 50
    // - If difference is between 60-120 seconds (1-2 min): low score of 20
    // - If difference is greater than 120 seconds (2 min): 0 (completely different)
    
    if (diffSeconds <= 10) {
      return 100;
    } else if (diffSeconds <= 20) {
      return 100 - ((diffSeconds - 10) * 1); // 100 to 90
    } else if (diffSeconds <= 30) {
      return 90 - ((diffSeconds - 20) * 2); // 90 to 70
    } else if (diffSeconds <= 60) {
      return 70 - ((diffSeconds - 30) * (20 / 30)); // 70 to 50
    } else if (diffSeconds <= 120) {
      return 20; // Low score for differences between 1-2 minutes
    } else {
      return 0; // No points if difference is over 2 minutes
    }
  } catch (e) {
    console.error("Error comparing durations:", e);
    return 50; // Neutral score on error
  }
};

/**
 * Check if the upload date approximately matches release date
 * Returns a bonus score (0-20) if dates are close
 */
export const compareReleaseDates = (uploadDate?: string, releaseDate?: string): number => {
  if (!uploadDate || !releaseDate) return 0;
  
  try {
    const upload = new Date(uploadDate);
    const release = new Date(releaseDate);
    
    // Calculate difference in days
    const diffDays = Math.abs(
      Math.round((upload.getTime() - release.getTime()) / (1000 * 60 * 60 * 24))
    );
    
    // Score based on proximity
    if (diffDays <= 6) {
      return 20; // Full bonus if within 6 days
    } else if (diffDays <= 30) {
      return 15; // High bonus if within a month
    } else if (diffDays <= 90) {
      return 10; // Medium bonus if within 3 months
    } else if (diffDays <= 365) {
      return 5; // Low bonus if within a year
    } else {
      return 0;
    }
  } catch (e) {
    console.error("Error comparing dates:", e);
    return 0;
  }
};

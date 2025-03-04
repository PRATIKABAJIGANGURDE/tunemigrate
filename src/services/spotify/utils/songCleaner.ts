
/**
 * Song title cleaning utilities for improved Spotify matching
 */

/**
 * Clean song title to improve search accuracy
 * Enhanced to better remove channel names and clean metadata
 */
export const cleanSongTitle = (title: string): string => {
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
    .replace(/\(Lyric\/Lyric Video\)/gi, '')
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
export const detectSpecialVersion = (title: string): { 
  isLive: boolean; 
  isRemix: boolean;
  isCover: boolean;
  isAcoustic: boolean;
} => {
  const lowerTitle = title.toLowerCase();
  return {
    isLive: /\blive\b|\bconcert\b|\bperformance\b|\bunplugged\b|\bsession\b/i.test(lowerTitle),
    isRemix: /\bremix\b|\bedit\b|\bflip\b|\bmashup\b|\brework\b/i.test(lowerTitle),
    isCover: /\bcover\b|\btribute\b|\bversion by\b|\bperformed by\b/i.test(lowerTitle),
    isAcoustic: /\bacoustic\b|\bstripped\b|\bpiano\b|\bunplugged\b/i.test(lowerTitle)
  };
};

/**
 * Extract artist name from YouTube video title with improved pattern recognition
 */
export const extractArtistName = (videoTitle: string): string => {
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
export const extractSongTitle = (videoTitle: string, artistName: string): string => {
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


/**
 * Main Spotify Service - reexports all Spotify functionality
 */

// Re-export all functionality from modular files
export { 
  initiateSpotifyLogin, 
  exchangeCodeForToken, 
  refreshAccessToken,
  isLoggedIn,
  getAccessToken,
  logout,
  validateToken,
  isTokenExpired
} from './spotify/utils/auth';

export {
  cleanSongTitle,
  detectSpecialVersion,
  extractArtistName,
  extractSongTitle
} from './spotify/utils/songCleaner';

export {
  calculateStringSimilarity,
  durationToSeconds,
  compareDurations,
  compareReleaseDates
} from './spotify/utils/similarity';

export {
  searchTrack,
  calculateMatchConfidence,
  findBestMatch,
  searchSpotifySongs
} from './spotify/matcher';

export {
  createPlaylist,
  addTracksToPlaylist,
  findSpotifyTracks,
  createSpotifyPlaylistFromSongs
} from './spotify/playlist';

// Export AI matching utilities with enhanced functionality
export {
  extractArtistWithAI,
  setGeminiApiKey,
  getGeminiApiKey,
  getMatchDetails,
  getEnhancedMatchDetails,
  analyzeSongDetailsWithAI
} from './spotify/utils/aiMatcher';

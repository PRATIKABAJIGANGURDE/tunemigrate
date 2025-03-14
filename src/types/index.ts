
export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  duration?: string;
  uploadDate?: string;
  spotifyId?: string;
  spotifyUri?: string;
  selected: boolean;
  matchConfidence?: number;
  // New fields for Spotify track details
  spotifyTitle?: string;
  spotifyArtist?: string;
  spotifyThumbnail?: string;
  spotifyDuration?: string;
  // Manual approval flag
  manuallyApproved?: boolean;
  // Replacement flag to indicate if this song was manually replaced
  isReplacement?: boolean;
}

export interface PlaylistData {
  title: string;
  description?: string;
  songs: Song[];
}

export enum ConversionStep {
  INPUT_URL = 0,
  EXTRACTING = 1,
  EDIT_SONGS = 2,
  NAME_PLAYLIST = 3,
  REVIEW_MATCHES = 4,
  CREATE_PLAYLIST = 5,
  COMPLETED = 6,
}

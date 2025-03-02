
export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  duration?: string;
  spotifyId?: string;
  spotifyUri?: string;
  selected: boolean;
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
  CREATE_PLAYLIST = 4,
  COMPLETED = 5,
}

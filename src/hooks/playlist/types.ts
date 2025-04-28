
import { ConversionStep, Song, PlaylistData } from "@/types";

export interface PlaylistConversionState {
  currentStep: ConversionStep;
  loading: boolean;
  playlistData: PlaylistData;
  playlistUrl: string | null;
  matchingStats: { matched: number; total: number } | null;
  conversionProgress: number;
}

export interface UsePlaylistExtractionReturn {
  extractPlaylist: (url: string) => Promise<void>;
  handleSongUpdate: (updatedSongs: Song[]) => void;
  handleContinueToNaming: () => void;
}

export interface UsePlaylistNamingReturn {
  handlePlaylistNameSubmit: (name: string, description: string) => Promise<void>;
  handleBackToNaming: () => void;
}

export interface UsePlaylistMatchingReturn {
  handleAddSpotifySong: (query: string) => Promise<any[] | null>;
  handleAddSpotifyTrack: (track: any) => void;
  handleManualApprove: (songId: string) => Promise<void>;
  handleAIMatchAll: () => Promise<void>;
}

export interface UsePlaylistCreationReturn {
  handleCreatePlaylist: () => Promise<void>;
  handleStartOver: () => void;
  handleOpenSpotify: () => void;
}

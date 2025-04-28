
import { useState } from "react";
import { ConversionStep, Song, PlaylistData } from "@/types";
import { PlaylistConversionState } from "./types";

export const usePlaylistState = (): [
  PlaylistConversionState,
  {
    setCurrentStep: (step: ConversionStep) => void;
    setLoading: (isLoading: boolean) => void;
    setPlaylistData: (data: PlaylistData) => void;
    setPlaylistUrl: (url: string | null) => void;
    setMatchingStats: (stats: { matched: number; total: number } | null) => void;
    setConversionProgress: (progress: number) => void;
    updatePlaylistSongs: (songs: Song[]) => void;
  }
] => {
  const [state, setState] = useState<PlaylistConversionState>({
    currentStep: ConversionStep.INPUT_URL,
    loading: false,
    playlistData: {
      title: "",
      songs: []
    },
    playlistUrl: null,
    matchingStats: null,
    conversionProgress: 0
  });

  const setCurrentStep = (step: ConversionStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, loading: isLoading }));
  };

  const setPlaylistData = (data: PlaylistData) => {
    setState(prev => ({ ...prev, playlistData: data }));
  };

  const setPlaylistUrl = (url: string | null) => {
    setState(prev => ({ ...prev, playlistUrl: url }));
  };

  const setMatchingStats = (stats: { matched: number; total: number } | null) => {
    setState(prev => ({ ...prev, matchingStats: stats }));
  };

  const setConversionProgress = (progress: number) => {
    setState(prev => ({ ...prev, conversionProgress: progress }));
  };

  const updatePlaylistSongs = (songs: Song[]) => {
    setState(prev => ({
      ...prev,
      playlistData: {
        ...prev.playlistData,
        songs
      }
    }));
  };

  return [
    state,
    {
      setCurrentStep,
      setLoading,
      setPlaylistData,
      setPlaylistUrl,
      setMatchingStats,
      setConversionProgress,
      updatePlaylistSongs
    }
  ];
};

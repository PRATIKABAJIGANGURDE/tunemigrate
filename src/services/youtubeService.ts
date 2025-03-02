
import { Song } from "@/types";
import { v4 as uuidv4 } from "uuid";

const API_KEY = "AIzaSyBi-wrtS__IN67vSvK3poSimRoBBQqJAog";

/**
 * Extract the playlist ID from a YouTube playlist URL
 */
export const extractPlaylistId = (url: string): string | null => {
  // Match patterns like:
  // https://www.youtube.com/playlist?list=PLw-VjHDlEOgs2kzJXgkX1RkU0uZNUYRNP
  // https://youtube.com/playlist?list=PLw-VjHDlEOgs2kzJXgkX1RkU0uZNUYRNP
  // https://m.youtube.com/playlist?list=PLw-VjHDlEOgs2kzJXgkX1RkU0uZNUYRNP
  const regex = /(?:youtube\.com|youtu\.be).*?list=([^&\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Fetch playlist details from YouTube
 */
export const fetchPlaylistDetails = async (playlistId: string): Promise<{ title: string }> => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist details: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("Playlist not found");
  }
  
  return {
    title: data.items[0].snippet.title
  };
};

/**
 * Fetch playlist items (videos) from YouTube
 */
export const fetchPlaylistItems = async (playlistId: string): Promise<Song[]> => {
  const songs: Song[] = [];
  let nextPageToken: string | undefined = undefined;
  
  do {
    const pageQueryParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}${pageQueryParam}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist items: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process items
    for (const item of data.items) {
      if (item.snippet && item.snippet.title !== "Deleted video" && item.snippet.title !== "Private video") {
        songs.push({
          id: uuidv4(),
          title: item.snippet.title,
          artist: item.snippet.videoOwnerChannelTitle || "Unknown Artist",
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          selected: true
        });
      }
    }
    
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);
  
  return songs;
};

/**
 * Extract songs from a YouTube playlist URL
 */
export const extractSongsFromPlaylist = async (playlistUrl: string): Promise<{ title: string, songs: Song[] }> => {
  const playlistId = extractPlaylistId(playlistUrl);
  
  if (!playlistId) {
    throw new Error("Invalid YouTube playlist URL");
  }
  
  const playlistDetails = await fetchPlaylistDetails(playlistId);
  const songs = await fetchPlaylistItems(playlistId);
  
  return {
    title: playlistDetails.title,
    songs
  };
};

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
 * Format duration from ISO 8601 format to readable format
 * e.g., PT3M42S -> 3:42
 */
export const formatDuration = (duration: string): string => {
  // Match hours, minutes, and seconds
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!matches) {
    return "0:00";
  }
  
  const hours = matches[1] ? parseInt(matches[1]) : 0;
  const minutes = matches[2] ? parseInt(matches[2]) : 0;
  const seconds = matches[3] ? parseInt(matches[3]) : 0;
  
  // Format as MM:SS or H:MM:SS
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Format date to show month and year
 * e.g., 2021-05-20 -> May 2021
 */
export const formatUploadDate = (date: string): string => {
  if (!date) return "Unknown";
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } catch (e) {
    return "Unknown";
  }
};

/**
 * Fetch playlist items (videos) from YouTube with additional details
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
    
    // Get video IDs to fetch additional details
    const videoIds = data.items
      .filter((item: any) => 
        item.snippet && 
        item.snippet.title !== "Deleted video" && 
        item.snippet.title !== "Private video")
      .map((item: any) => item.snippet.resourceId.videoId);
    
    // Fetch video details (duration, upload date, etc.)
    if (videoIds.length > 0) {
      const videoDetailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(',')}&key=${API_KEY}`
      );
      
      if (!videoDetailsResponse.ok) {
        throw new Error(`Failed to fetch video details: ${videoDetailsResponse.statusText}`);
      }
      
      const videoDetails = await videoDetailsResponse.json();
      const videoDetailsMap = new Map();
      
      videoDetails.items.forEach((item: any) => {
        videoDetailsMap.set(item.id, {
          duration: item.contentDetails?.duration,
          uploadDate: item.snippet?.publishedAt
        });
      });
      
      // Process items with additional details
      for (const item of data.items) {
        if (item.snippet && item.snippet.title !== "Deleted video" && item.snippet.title !== "Private video") {
          const videoId = item.snippet.resourceId.videoId;
          const details = videoDetailsMap.get(videoId);
          
          songs.push({
            id: uuidv4(),
            title: item.snippet.title,
            artist: item.snippet.videoOwnerChannelTitle || "Unknown Artist",
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            duration: details?.duration ? formatDuration(details.duration) : undefined,
            uploadDate: details?.uploadDate ? formatUploadDate(details.uploadDate) : undefined,
            selected: true
          });
        }
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

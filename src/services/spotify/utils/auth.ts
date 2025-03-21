
/**
 * Spotify Authentication Utilities
 */
import { SPOTIFY_CONFIG } from '@/config/env';

// Use environment variables
const CLIENT_ID = SPOTIFY_CONFIG.clientId;
const CLIENT_SECRET = SPOTIFY_CONFIG.clientSecret;
export const REDIRECT_URI = SPOTIFY_CONFIG.redirectUri;

/**
 * Generate a random string for the state parameter
 */
export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Generate a code verifier and challenge for PKCE
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Initiate Spotify login
 */
export const initiateSpotifyLogin = async (): Promise<void> => {
  const state = generateRandomString(16);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  if (!CLIENT_ID) {
    console.error("Spotify Client ID is not configured in environment variables!");
    throw new Error("Spotify Client ID is not configured. Please check the environment variables.");
  }

  // Store the code verifier in local storage for later use
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  localStorage.setItem('spotify_auth_state', state);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
    scope: 'playlist-modify-private playlist-modify-public user-read-private user-read-email',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'true' // Force showing the auth dialog even if already authenticated
  });

  // Redirect to Spotify authorization page
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> => {
  const codeVerifier = localStorage.getItem('spotify_code_verifier');

  if (!codeVerifier) {
    throw new Error("Code verifier not found");
  }

  if (!CLIENT_ID) {
    throw new Error("Spotify Client ID is not configured in environment variables!");
  }

  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    });

    // If client secret is available, add basic authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    if (CLIENT_SECRET) {
      const authString = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers,
      body: params
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Token exchange error:", errorData);
      throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
};

/**
 * Refresh the access token
 */
export const refreshAccessToken = async (refreshToken?: string): Promise<string> => {
  // If no refresh token provided, try to get it from localStorage
  const token = refreshToken || localStorage.getItem('spotify_refresh_token');

  if (!token) {
    logout(); // Clean up any existing tokens
    throw new Error("No refresh token available");
  }

  if (!CLIENT_ID) {
    throw new Error("Spotify Client ID is not configured in environment variables!");
  }

  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: token
    });

    // If client secret is available, add basic authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    if (CLIENT_SECRET) {
      const authString = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers,
      body: params
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Token refresh error:", errorData);
      
      // If we got a 400 or 401, our refresh token might be invalid
      if (response.status === 400 || response.status === 401) {
        logout();
        throw new Error("Your session has expired. Please log in again.");
      }
      
      throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Update the stored token
    localStorage.setItem('spotify_access_token', data.access_token);

    // If we got a new refresh token, store that too
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }

    // Update token expiry time
    const expiryTime = Date.now() + (data.expires_in * 1000);
    localStorage.setItem('spotify_token_expiry', expiryTime.toString());

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

/**
 * Check if user is logged in to Spotify
 */
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('spotify_access_token');
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiryTime = localStorage.getItem('spotify_token_expiry');
  if (!expiryTime) return true;
  
  // Add a buffer of 5 minutes to ensure we refresh before expiry
  return Date.now() > (parseInt(expiryTime, 10) - 300000);
};

/**
 * Get stored access token (with automatic refresh if needed)
 */
export const getAccessToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('spotify_access_token');
  
  if (!token) return null;
  
  // Check if token is expired and refresh if needed
  if (isTokenExpired()) {
    try {
      console.log("Token expired, refreshing...");
      return await refreshAccessToken();
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout(); // Clear invalid tokens
      return null;
    }
  }
  
  return token;
};

/**
 * Validate the current token by making a test API call
 * Returns true if valid, false otherwise
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    
    const response = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      // Token might be invalid, try refreshing
      try {
        const newToken = await refreshAccessToken();
        if (!newToken) return false;
        
        // Test with the new token
        const retryResponse = await fetch('https://api.spotify.com/v1/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        return retryResponse.ok;
      } catch (refreshError) {
        console.error("Failed to refresh token during validation:", refreshError);
        return false;
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

/**
 * Clear auth token when there's a validation error
 */
export const handleAuthError = async (error: any): Promise<string | null> => {
  console.error("Spotify API error:", error);
  
  if (error.message?.includes('401') || error.message?.includes('403')) {
    try {
      return await refreshAccessToken();
    } catch (refreshError) {
      logout();
      return null;
    }
  }
  
  return null;
};

/**
 * Logout from Spotify
 */
export const logout = (): void => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_auth_state');
};

// Helper to create headers with authentication
export const createAuthHeaders = (accessToken: string) => {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
};

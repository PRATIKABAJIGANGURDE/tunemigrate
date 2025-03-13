
/**
 * Spotify Authentication Utilities
 */

// Use environment variable for Client ID
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
export const REDIRECT_URI = 'http://localhost:8080/callback';

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
    console.error("VITE_SPOTIFY_CLIENT_ID environment variable is not set!");
    alert("Spotify Client ID is not configured. Please check the environment variables.");
    return;
  }

  // Store the code verifier in local storage for later use
  localStorage.setItem('spotify_code_verifier', codeVerifier);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
    scope: 'playlist-modify-private playlist-modify-public user-read-private',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
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
    throw new Error("VITE_SPOTIFY_CLIENT_ID environment variable is not set!");
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Refresh the access token
 */
export const refreshAccessToken = async (refreshToken?: string): Promise<string> => {
  // If no refresh token provided, try to get it from localStorage
  const token = refreshToken || localStorage.getItem('spotify_refresh_token');

  if (!token) {
    throw new Error("No refresh token available");
  }

  if (!CLIENT_ID) {
    throw new Error("VITE_SPOTIFY_CLIENT_ID environment variable is not set!");
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: token
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
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
};

/**
 * Check if user is logged in to Spotify
 */
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('spotify_access_token');
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('spotify_access_token');
};

/**
 * Logout from Spotify
 */
export const logout = (): void => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_code_verifier');
};

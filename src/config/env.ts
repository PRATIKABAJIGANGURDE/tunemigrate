
/**
 * Central configuration file for environment variables
 */

// Environment detection
export const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_ENV === 'development';
export const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENV === 'production';

// Spotify configuration
export const SPOTIFY_CONFIG = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 
    (isProduction 
      ? 'https://tunemigrate.vercel.app/callback'
      : 'http://localhost:8080/callback')
};

// AI Services
export const AI_CONFIG = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
};

// Validate required environment variables
const validateEnv = () => {
  const required = [
    { name: 'VITE_SPOTIFY_CLIENT_ID', value: SPOTIFY_CONFIG.clientId }
  ];

  const missing = required.filter(item => !item.value);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.map(item => item.name).join(', ')}`);
    return false;
  }
  
  return true;
};

// Run validation
export const isEnvValid = validateEnv();

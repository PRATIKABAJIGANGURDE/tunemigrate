
import { Button } from "@/components/ui/button";
import { initiateSpotifyLogin, isLoggedIn, logout, validateToken } from "@/services/spotifyService";
import SpotifyIcon from "./icons/SpotifyIcon";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink } from "lucide-react";

interface SpotifyAuthProps {
  onLogin: () => void;
  isLoggedIn: boolean;
}

const SpotifyAuth = ({ onLogin, isLoggedIn: propIsLoggedIn }: SpotifyAuthProps) => {
  const [validatingToken, setValidatingToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'validating' | 'disconnected' | 'error'>(
    propIsLoggedIn ? 'connected' : 'disconnected'
  );
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (propIsLoggedIn) {
      const validate = async () => {
        setValidatingToken(true);
        setConnectionStatus('validating');
        try {
          const isValid = await validateToken();
          if (!isValid) {
            // Token is invalid, log out
            logout();
            setConnectionStatus('error');
            setErrorDetails("Your Spotify session has expired or you don't have permission to use this app");
            toast.error("Your Spotify session has expired. Please log in again.");
          } else {
            setConnectionStatus('connected');
            setErrorDetails(null);
          }
        } catch (error: any) {
          console.error("Token validation error:", error);
          setConnectionStatus('error');
          setErrorDetails(error.message || "Failed to validate Spotify connection");
        } finally {
          setValidatingToken(false);
        }
      };
      validate();
    }
  }, [propIsLoggedIn]);

  const handleLogin = async () => {
    try {
      await initiateSpotifyLogin();
      toast.info("Redirecting to Spotify...");
      // onLogin will be called in the callback page after successful authentication
    } catch (error: any) {
      console.error("Failed to initiate Spotify login:", error);
      toast.error("Failed to connect to Spotify");
      setErrorDetails(error.message || "Failed to connect to Spotify");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload(); // Refresh the page to update state
    toast.success("Logged out from Spotify");
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      {!propIsLoggedIn ? (
        <>
          <p className="text-center text-muted-foreground">
            Connect your Spotify account to create playlists
          </p>
          <Button 
            onClick={handleLogin}
            className="bg-[#1DB954] hover:bg-[#1AA34A] font-medium text-white gap-2"
          >
            <SpotifyIcon className="h-5 w-5" />
            Connect with Spotify
          </Button>
          
          {errorDetails && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Connection Error</p>
                <p>{errorDetails}</p>
                <p className="mt-1">Make sure your Spotify account is registered in the developer dashboard.</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center space-y-3 w-full max-w-xs">
          {connectionStatus === 'error' ? (
            <div className="bg-red-50 text-red-600 rounded-lg py-2 px-4 text-sm flex items-start w-full">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Spotify Connection Error</p>
                <p>{errorDetails || "Failed to validate Spotify connection"}</p>
                <p className="mt-1 flex items-center gap-1">
                  <a 
                    href="https://developer.spotify.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-700 underline flex items-center hover:text-red-800"
                  >
                    Check Spotify Dashboard <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 rounded-lg py-2 px-4 text-sm flex items-center w-full justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {connectionStatus === 'validating' ? 'Verifying connection...' : 'Connected to Spotify'}
            </div>
          )}
          
          <div className="flex w-full justify-center">            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-sm border-red-200 text-red-600 hover:bg-red-50"
              disabled={validatingToken}
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyAuth;

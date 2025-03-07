
import { Button } from "@/components/ui/button";
import { initiateSpotifyLogin, isLoggedIn, logout } from "@/services/spotifyService";
import SpotifyIcon from "./icons/SpotifyIcon";

interface SpotifyAuthProps {
  onLogin: () => void;
  isLoggedIn: boolean;
}

const SpotifyAuth = ({ onLogin, isLoggedIn: propIsLoggedIn }: SpotifyAuthProps) => {
  const handleLogin = async () => {
    try {
      await initiateSpotifyLogin();
      // onLogin will be called in the callback page after successful authentication
    } catch (error) {
      console.error("Failed to initiate Spotify login:", error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload(); // Refresh the page to update state
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
            className="bg-spotify hover:bg-spotify-dark font-medium text-white"
          >
            <SpotifyIcon className="w-5 h-5 mr-2" />
            Connect with Spotify
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-green-50 text-green-700 rounded-lg py-2 px-4 text-sm flex items-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Connected to Spotify
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-destructive"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default SpotifyAuth;


import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { extractPlaylistId } from "@/services/youtubeService";
import SpotifyIcon from "./icons/SpotifyIcon";
import { initiateSpotifyLogin, isLoggedIn, logout, setGeminiApiKey } from "@/services/spotifyService";
import NewUserModal from "./NewUserModal";
import { Link } from "react-router-dom";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

const UrlInput = ({ onSubmit, loading = false }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const spotifyConnected = isLoggedIn();
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // Initialize Gemini API key using useEffect hook
  useEffect(() => {
    const apiKey = "AIzaSyAQZZw6P7EGCe5usjNfjfoilFOswghFnY0";
    setGeminiApiKey(apiKey);
    localStorage.setItem("gemini_api_key", apiKey);
  }, []);

  const validateAndProceed = (urlToSubmit: string) => {
    if (!spotifyConnected) {
      setError("Please connect your Spotify account first");
      toast.error("Please connect to Spotify before proceeding");
      return false;
    }
    
    if (!urlToSubmit.trim()) {
      setError("Please enter a YouTube playlist URL");
      return false;
    }
    
    const playlistId = extractPlaylistId(urlToSubmit);
    if (!playlistId) {
      setError("Please enter a valid YouTube playlist URL");
      toast.error("Invalid YouTube playlist URL");
      return false;
    }
    
    return true;
  };

  const handleStartConversion = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First validate the URL
    if (validateAndProceed(url)) {
      // If valid, store it for later and show the modal
      setPendingUrl(url);
      setShowNewUserModal(true);
    }
  };

  const handleExistingUser = () => {
    // Close the modal and proceed with the submission if we have a pending URL
    setShowNewUserModal(false);
    if (pendingUrl) {
      setError(null);
      onSubmit(pendingUrl);
      setPendingUrl(null);
    }
  };

  const handleSpotifyLogin = async () => {
    try {
      await initiateSpotifyLogin();
      // Login process will redirect to callback
    } catch (error) {
      console.error("Failed to login with Spotify:", error);
      toast.error("Failed to connect with Spotify");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload(); // Refresh the page to update state
    toast.success("Logged out from Spotify");
  };

  return (
    <AnimatedCard>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Convert YouTube Playlist</h2>
          <p className="text-muted-foreground">
            Connect your Spotify account and paste a YouTube playlist URL to convert it
          </p>
        </div>

        <form onSubmit={handleStartConversion} className="space-y-4">
          {!spotifyConnected ? (
            <div className="flex flex-col space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-[#1DB954] hover:bg-[#1AA34A] text-white gap-2"
                onClick={handleSpotifyLogin}
              >
                <SpotifyIcon className="h-5 w-5" />
                Connect with Spotify
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Connect to Spotify before continuing
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="https://www.youtube.com/playlist?list=..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  className={`h-12 text-base px-4 transition-all duration-200 ${
                    error ? "border-destructive ring-destructive/20" : ""
                  }`}
                  disabled={loading}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? "Processing..." : "Convert Playlist"}
              </Button>
              
              <div className="bg-green-50 text-green-700 rounded-lg py-2 px-4 text-sm flex items-center w-full justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Connected to Spotify
              </div>
              
              <Button 
                variant="outline" 
                className="w-full text-sm border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                Disconnect from Spotify
              </Button>
            </div>
          )}

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              By using this service, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>

        {/* New User Modal */}
        <NewUserModal
          isOpen={showNewUserModal}
          onClose={() => setShowNewUserModal(false)}
          onExistingUser={handleExistingUser}
        />
      </motion.div>
    </AnimatedCard>
  );
};

export default UrlInput;

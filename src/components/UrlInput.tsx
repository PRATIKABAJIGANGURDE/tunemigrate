
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { extractPlaylistId } from "@/services/youtubeService";
import SpotifyIcon from "./icons/SpotifyIcon";
import { initiateSpotifyLogin, isLoggedIn, logout, setGeminiApiKey } from "@/services/spotifyService";
import AIConfigDialog from "./AIConfigDialog";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

const UrlInput = ({ onSubmit, loading = false }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const spotifyConnected = isLoggedIn();

  // Initialize Gemini API key using useEffect hook
  useEffect(() => {
    const apiKey = "AIzaSyAQZZw6P7EGCe5usjNfjfoilFOswghFnY0";
    setGeminiApiKey(apiKey);
    localStorage.setItem("gemini_api_key", apiKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!spotifyConnected) {
      setError("Please connect your Spotify account first");
      toast.error("Please connect to Spotify before proceeding");
      return;
    }
    
    if (!url.trim()) {
      setError("Please enter a YouTube playlist URL");
      return;
    }
    
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      setError("Please enter a valid YouTube playlist URL");
      toast.error("Invalid YouTube playlist URL");
      return;
    }
    
    setError(null);
    onSubmit(url);
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  className="text-sm border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Disconnect from Spotify
                </Button>
                
                <AIConfigDialog />
              </div>
            </div>
          )}

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              By using this service, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
      </motion.div>
    </AnimatedCard>
  );
};

export default UrlInput;

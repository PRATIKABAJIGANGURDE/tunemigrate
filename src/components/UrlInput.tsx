
import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { extractPlaylistId } from "@/services/youtubeService";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
  reversed?: boolean;
}

const UrlInput = ({ onSubmit, loading = false, reversed = false }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError(reversed ? "Please enter a Spotify playlist URL" : "Please enter a YouTube playlist URL");
      return;
    }
    
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      setError(reversed ? "Please enter a valid Spotify playlist URL" : "Please enter a valid YouTube playlist URL");
      toast.error(reversed ? "Invalid Spotify playlist URL" : "Invalid YouTube playlist URL");
      return;
    }
    
    setError(null);
    onSubmit(url);
  };

  return (
    <AnimatedCard>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={reversed ? "flex flex-row gap-8" : ""}
      >
        {!reversed && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Convert YouTube Playlist</h2>
            <p className="text-muted-foreground">
              Paste a YouTube playlist URL to convert it to Spotify
            </p>
          </div>
        )}

        {reversed && (
          <div className="w-1/2 flex items-center justify-center bg-gray-50 rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="64" 
                  height="64" 
                  viewBox="0 0 24 24" 
                  className="text-gray-300"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.83v-6.34l6 3.17-6 3.17z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No tracks found</h3>
              <p className="text-sm text-gray-500">
                Enter a Spotify playlist URL to see the tracks
              </p>
            </div>
          </div>
        )}

        <div className={reversed ? "w-1/2" : "w-full"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {reversed && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Spotify Playlist URL</h3>
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={reversed ? "https://open.spotify.com/playlist/..." : "https://www.youtube.com/playlist?list=..."}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                className={`h-12 text-base px-4 transition-all duration-200 ${
                  error ? "border-destructive ring-destructive/20" : ""
                }`}
                disabled={loading}
                icon={reversed ? "spotify" : "youtube"}
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
              
              {reversed && (
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full URL of your Spotify playlist
                </p>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-base font-medium ${reversed ? "bg-purple-500 hover:bg-purple-600" : ""}`}
              disabled={loading}
            >
              {loading ? "Processing..." : reversed ? "Extract Tracks" : "Convert Playlist"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                By using this service, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatedCard>
  );
};

export default UrlInput;


import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

const UrlInput = ({ onSubmit, loading = false }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (input: string): boolean => {
    // Very basic YouTube playlist URL validation
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*playlist.*$/;
    return youtubePattern.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a YouTube playlist URL");
      return;
    }
    
    if (!validateUrl(url)) {
      setError("Please enter a valid YouTube playlist URL");
      toast.error("Invalid YouTube playlist URL");
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
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Convert YouTube Playlist</h2>
          <p className="text-muted-foreground">
            Paste a YouTube playlist URL to convert it to Spotify
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

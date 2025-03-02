
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";

interface PlaylistNamingProps {
  initialName: string;
  onSubmit: (name: string, description: string) => void;
}

const PlaylistNaming = ({ initialName, onSubmit }: PlaylistNamingProps) => {
  const [name, setName] = useState(initialName || "My Converted Playlist");
  const [description, setDescription] = useState("Converted from YouTube with TuneMigrate");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateName = () => {
    // Simulate AI playlist name generation
    setIsGenerating(true);
    setTimeout(() => {
      const names = [
        "Vibes & Melodies Collection",
        "Curated Sounds Journey",
        "Rhythm Expedition",
        "Harmonic Discoveries",
        "Sonic Treasures"
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];
      setName(randomName);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Name Your Playlist</h2>
        <p className="text-sm text-muted-foreground">
          Choose a name for your Spotify playlist
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="playlist-name" className="text-sm font-medium">
            Playlist Name
          </label>
          <div className="flex gap-2">
            <Input
              id="playlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name"
              className="flex-1"
              required
            />
            <Button
              type="button"
              onClick={generateName}
              variant="outline"
              className="flex-shrink-0"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              {!isGenerating && <span>AI Name</span>}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="playlist-description" className="text-sm font-medium">
            Description (optional)
          </label>
          <Textarea
            id="playlist-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter playlist description"
            rows={3}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Create Playlist
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlaylistNaming;

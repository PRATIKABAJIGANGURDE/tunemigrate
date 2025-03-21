
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setGeminiApiKey, getGeminiApiKey } from "@/services/spotifyService";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { AI_CONFIG } from "@/config/env";

const AIConfigDialog = () => {
  const [apiKey, setApiKey] = useState(getGeminiApiKey() || AI_CONFIG.geminiApiKey || "");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    try {
      if (apiKey.trim()) {
        setGeminiApiKey(apiKey.trim());
        localStorage.setItem("gemini_api_key", apiKey.trim());
        toast.success("AI matching enabled successfully!");
      } else {
        // Remove API key if empty
        setGeminiApiKey("");
        localStorage.removeItem("gemini_api_key");
        toast.info("AI matching disabled");
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    }
  };

  // Initialize API key from localStorage or environment variable on component mount
  React.useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key") || AI_CONFIG.geminiApiKey;
    if (savedKey) {
      setApiKey(savedKey);
      setGeminiApiKey(savedKey);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Matching
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enable AI-Enhanced Matching</DialogTitle>
          <DialogDescription>
            Add your Google Gemini API key to enable AI-enhanced song matching for better results.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>This key is stored locally in your browser and never sent to our servers.</p>
            <p className="mt-2">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get a free Gemini API key
              </a>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfigDialog;

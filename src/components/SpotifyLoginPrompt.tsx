
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initiateSpotifyLogin } from "@/services/spotifyService";
import SpotifyIcon from "./icons/SpotifyIcon";
import { toast } from "sonner";

const SpotifyLoginPrompt = () => {
  const handleLogin = async () => {
    try {
      await initiateSpotifyLogin();
      toast.info("Redirecting to Spotify...");
    } catch (error) {
      console.error("Failed to initiate Spotify login:", error);
      toast.error("Failed to connect to Spotify");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-[#1DB954]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SpotifyIcon className="h-6 w-6 text-[#1DB954]" />
          Connect with Spotify
        </CardTitle>
        <CardDescription>
          Connect your Spotify account to get started with playlist conversion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-2xl font-semibold">Easy</p>
              <p className="text-sm text-muted-foreground">One-click conversion</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-2xl font-semibold">Smart</p>
              <p className="text-sm text-muted-foreground">AI-powered matching</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleLogin} 
          className="w-full bg-[#1DB954] hover:bg-[#1AA34A] text-white gap-2"
        >
          <SpotifyIcon className="h-5 w-5" />
          Login with Spotify
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpotifyLoginPrompt;

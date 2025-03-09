
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initiateSpotifyLogin, isLoggedIn, logout } from "@/services/spotifyService";
import SpotifyIcon from "./icons/SpotifyIcon";
import { toast } from "sonner";

const SpotifyLoginPrompt = () => {
  const spotifyConnected = isLoggedIn();

  const handleLogin = async () => {
    try {
      await initiateSpotifyLogin();
      toast.info("Redirecting to Spotify...");
    } catch (error) {
      console.error("Failed to initiate Spotify login:", error);
      toast.error("Failed to connect to Spotify");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload(); // Refresh the page to update state
    toast.success("Logged out from Spotify");
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
        {!spotifyConnected ? (
          <Button 
            onClick={handleLogin} 
            className="w-full bg-[#1DB954] hover:bg-[#1AA34A] text-white gap-2"
          >
            <SpotifyIcon className="h-5 w-5" />
            Login with Spotify
          </Button>
        ) : (
          <div className="w-full space-y-3">
            <div className="bg-green-50 text-green-700 rounded-lg py-2 px-4 text-sm flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Connected to Spotify
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full text-sm border-red-200 text-red-600 hover:bg-red-50"
            >
              Disconnect from Spotify
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SpotifyLoginPrompt;

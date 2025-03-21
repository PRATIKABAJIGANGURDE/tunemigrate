
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken } from "@/services/spotifyService";
import LoadingIndicator from "@/components/LoadingIndicator";
import { toast } from "sonner";

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get the full URL to analyze
      const currentUrl = window.location.href;
      console.log("Current callback URL:", currentUrl);
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (error) {
        console.error("Spotify Authentication Error from URL:", error);
        setError("Authentication failed: " + error);
        toast.error("Authentication failed: " + error);
        return;
      }

      if (!code) {
        console.error("Authorization code missing from callback URL");
        setError("No authorization code found");
        toast.error("No authorization code found");
        return;
      }

      try {
        console.log("Exchanging code for token...");
        const tokenData = await exchangeCodeForToken(code);

        if (!tokenData || !tokenData.access_token || !tokenData.refresh_token) {
          console.error("Token data is incomplete:", tokenData);
          setError("Failed to retrieve tokens from Spotify");
          toast.error("Failed to retrieve tokens from Spotify");
          return;
        }

        // Store the tokens in localStorage
        localStorage.setItem("spotify_access_token", tokenData.access_token);
        localStorage.setItem("spotify_refresh_token", tokenData.refresh_token);

        // Set expiry time (current time + expires_in seconds)
        const expiryTime = new Date().getTime() + (tokenData.expires_in * 1000);
        localStorage.setItem("spotify_token_expiry", expiryTime.toString());

        console.log("Tokens successfully stored. Redirecting to app...");
        toast.success("Successfully connected to Spotify!");
        
        // Check if we're on the deployed site or development
        const isProduction = window.location.hostname === "tunemigrate.vercel.app";
        
        if (isProduction) {
          // In production, we need to redirect to the correct URL
          window.location.href = "https://tunemigrate.vercel.app/app";
        } else {
          // In development or sandbox, use navigate
          navigate("/app");
        }
      } catch (err) {
        console.error("Error in exchangeCodeForToken:", err);
        setError("Failed to complete authentication");
        toast.error("Failed to complete authentication");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-destructive">Authentication Error</h2>
          <p>{error}</p>
          <button
            onClick={() => {
              // Check if we're on the deployed site or development
              const isProduction = window.location.hostname === "tunemigrate.vercel.app";
              
              if (isProduction) {
                window.location.href = "https://tunemigrate.vercel.app";
              } else {
                navigate("/");
              }
            }}
            className="text-primary font-medium hover:underline"
          >
            Return to Home
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <h2 className="text-xl font-bold">Connecting to Spotify</h2>
          <LoadingIndicator size="lg" />
          <p className="text-muted-foreground">Please wait while we complete the authentication...</p>
        </div>
      )}
    </div>
  );
};

export default Callback;

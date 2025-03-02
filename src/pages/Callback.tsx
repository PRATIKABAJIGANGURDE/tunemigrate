
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken } from "@/services/spotifyService";
import LoadingIndicator from "@/components/LoadingIndicator";

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (error) {
        setError("Authentication failed: " + error);
        return;
      }

      if (!code) {
        setError("No authorization code found");
        return;
      }

      try {
        // Exchange the code for an access token
        const tokenData = await exchangeCodeForToken(code);
        
        // Store the tokens in localStorage
        localStorage.setItem("spotify_access_token", tokenData.access_token);
        localStorage.setItem("spotify_refresh_token", tokenData.refresh_token);
        
        // Set expiry time (current time + expires_in seconds)
        const expiryTime = new Date().getTime() + (tokenData.expires_in * 1000);
        localStorage.setItem("spotify_token_expiry", expiryTime.toString());
        
        // Redirect back to the main page
        navigate("/");
      } catch (err) {
        console.error("Error exchanging code for token:", err);
        setError("Failed to complete authentication");
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
            onClick={() => navigate("/")}
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

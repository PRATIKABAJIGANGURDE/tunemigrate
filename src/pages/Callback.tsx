
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken } from "@/services/spotifyService";
import LoadingIndicator from "@/components/LoadingIndicator";
import { toast } from "sonner";

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Get the full URL to analyze
      const currentUrl = window.location.href;
      console.log("Current callback URL:", currentUrl);
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const returnedState = urlParams.get("state");
      const error = urlParams.get("error");
      const storedState = localStorage.getItem("spotify_auth_state");

      if (error) {
        console.error("Spotify Authentication Error from URL:", error);
        setError("Authentication failed: " + error);
        setProcessing(false);
        toast.error("Authentication failed: " + error);
        return;
      }

      if (!code) {
        console.error("Authorization code missing from callback URL");
        setError("No authorization code found in the URL");
        setProcessing(false);
        toast.error("No authorization code found");
        return;
      }

      if (returnedState !== storedState) {
        console.error("State mismatch. Possible CSRF attack.");
        setError("Authentication state mismatch. Please try again.");
        setProcessing(false);
        toast.error("Security error. Please try again.");
        return;
      }

      try {
        console.log("Exchanging code for token...");
        const tokenData = await exchangeCodeForToken(code);

        if (!tokenData || !tokenData.access_token || !tokenData.refresh_token) {
          console.error("Token data is incomplete:", tokenData);
          setError("Failed to retrieve tokens from Spotify");
          setProcessing(false);
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
        
        // Clear state params after successful login
        localStorage.removeItem("spotify_auth_state");
        
        // Define redirect URL
        const redirectPath = "/app"; // Default redirect path
        
        // Check if we're on the deployed site
        const isProduction = window.location.origin.includes("vercel") || 
                             window.location.origin.includes("tunemigrate");
        
        if (isProduction) {
          // In production, use window.location for a full page reload
          window.location.href = `${window.location.origin}${redirectPath}`;
        } else {
          // In development
          navigate(redirectPath);
        }
      } catch (err: any) {
        console.error("Error in exchangeCodeForToken:", err);
        setError(`Failed to complete authentication: ${err.message || 'Unknown error'}`);
        setProcessing(false);
        toast.error("Failed to complete authentication");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-red-600">Authentication Error</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>{error}</p>
          </div>
          <p className="text-muted-foreground">
            There was a problem authenticating with Spotify. Please try again.
          </p>
          <button
            onClick={() => {
              // Check if we're on the deployed site
              const isProduction = window.location.origin.includes("vercel") || 
                                  window.location.origin.includes("tunemigrate");
              
              if (isProduction) {
                window.location.href = window.location.origin;
              } else {
                navigate("/");
              }
            }}
            className="text-primary font-medium hover:underline mt-2 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Return to Home
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-xl font-bold">Connecting to Spotify</h2>
          <LoadingIndicator size="lg" />
          <p className="text-muted-foreground">
            {processing ? "Please wait while we complete the authentication..." : "Redirecting you back to the app..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Callback;

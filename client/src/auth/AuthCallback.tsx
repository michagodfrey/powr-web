// Handles the OAuth callback after Google authentication
// Processes the authentication response, fetches user data, and handles any errors
// Redirects to dashboard on success or login page with error message on failure

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    // Process the authentication callback and handle user data
    const handleCallback = async () => {
      try {
        // Check URL for authentication errors
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");

        if (error) {
          // Map error codes to user-friendly messages
          let errorMessage = "Authentication failed";
          switch (error) {
            case "auth_failed":
              errorMessage = "Google authentication failed. Please try again.";
              break;
            case "no_user":
              errorMessage = "Failed to create or find user account.";
              break;
            case "login_failed":
              errorMessage = "Failed to complete login. Please try again.";
              break;
            case "invalid_state":
              errorMessage = "Invalid authentication state. Please try again.";
              break;
            case "access_denied":
              errorMessage =
                "Access was denied. Please grant the required permissions.";
              break;
            case "server_error":
              errorMessage = "Server error occurred. Please try again later.";
              break;
            case "network_error":
              errorMessage =
                "Network error. Please check your connection and try again.";
              break;
            case "session_error":
              errorMessage = "Session error. Please try logging in again.";
              break;
            default:
              errorMessage = decodeURIComponent(error);
          }
          throw new Error(errorMessage);
        }

        // Fetch authenticated user data from the backend
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:4000"
          }/api/auth/me`,
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Authentication failed. Please try logging in again."
            );
          }
          if (response.status === 429) {
            throw new Error(
              "Too many attempts. Please wait a moment and try again."
            );
          }
          if (response.status >= 500) {
            throw new Error("Server error. Please try again later.");
          }
          throw new Error("Failed to fetch user data. Please try again.");
        }

        const userData = await response.json();
        if (!userData || !userData.id) {
          throw new Error(
            "Invalid user data received. Please try logging in again."
          );
        }

        setUser(userData);
        // On successful authentication, redirect to the main dashboard
        navigate("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        navigate(`/login?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  // Show loading spinner while processing the callback
  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;

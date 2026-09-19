// Handles the redirect back from Supabase after Google OAuth.
// Supabase's client parses the session out of the redirect URL itself
// (detectSessionInUrl) and AuthContext picks it up via onAuthStateChange,
// then fetches the app profile. We wait for AuthContext's isAuthenticated
// (not just the raw Supabase session) so we don't navigate to "/" before
// the profile has loaded — doing so would bounce through the isAuthenticated
// guard on "/" and strand the user on the public landing page.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const errorMessage =
        params.get("error_description") ||
        params.get("error") ||
        "Authentication failed";
      navigate(`/home?error=${encodeURIComponent(errorMessage)}`);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, navigate]);

  // Show loading spinner while processing the callback
  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;

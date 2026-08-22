// Handles the redirect back from Supabase after Google OAuth.
// Supabase's client parses the session out of the redirect URL itself
// (detectSessionInUrl) and fires onAuthStateChange shortly after — we just
// wait for that, with a timeout fallback in case the provider returned an error.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let settled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (settled || !session) return;
      settled = true;
      navigate("/");
    });

    const timeout = setTimeout(async () => {
      if (settled) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      settled = true;

      if (session) {
        navigate("/");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const errorMessage =
        params.get("error_description") ||
        params.get("error") ||
        "Authentication failed";
      navigate(`/login?error=${encodeURIComponent(errorMessage)}`);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  // Show loading spinner while processing the callback
  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;

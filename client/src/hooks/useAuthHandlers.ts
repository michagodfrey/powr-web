import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export const useAuthHandlers = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login({ provider: "google" });
      // no navigation here — signInWithOAuth redirects the whole page away
    } catch (error) {
      console.error("Google auth error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to initiate Google authentication. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleAuth,
    isLoading,
    setIsLoading,
    error,
    setError,
  };
};

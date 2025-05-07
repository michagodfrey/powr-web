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

  const handleAppleAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login({ provider: "apple" });
    } catch (error) {
      console.error("Apple auth error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to initiate Apple authentication. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleAuth,
    handleAppleAuth,
    isLoading,
    setIsLoading,
    error,
    setError,
  };
};

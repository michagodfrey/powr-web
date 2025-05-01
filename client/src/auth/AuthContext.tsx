// Authentication context provider that manages user authentication state and related functions
// Handles Google OAuth and JWT-based authentication, token management, and user data

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  setStoredTokens,
  removeStoredTokens,
  hasStoredTokens,
} from "../utils/tokenUtils";
import { api } from "../utils/api";

// User data structure returned from the API
interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
  preferredUnit: "kg" | "lb";
}

// Authentication context shape with all available methods and state
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  login: (params?: {
    email?: string;
    password?: string;
    provider?: "google" | "apple";
  }) => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Custom hook to use auth context, throws if used outside AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Main auth provider component that wraps the app and provides authentication state
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!hasStoredTokens()) {
        setUser(null);
        return;
      }

      const response = await api.get("/api/auth/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Auth status check error:", error);
      setUser(null);
      removeStoredTokens();
      if (error instanceof Error && error.message.includes("fetch")) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Authentication error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      if (location.pathname === "/auth/callback") {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");

        if (accessToken && refreshToken) {
          setStoredTokens(accessToken, refreshToken);
          await checkAuthStatus();
          navigate("/");
        } else {
          setError("Authentication failed");
          navigate("/login");
        }
      }
    };

    handleCallback();
  }, [location, navigate, checkAuthStatus]);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(
    async (params?: {
      email?: string;
      password?: string;
      provider?: "google" | "apple";
    }) => {
      try {
        if (params?.provider === "google") {
          window.location.href = `${API_URL}/api/auth/google`;
          return;
        } else if (params?.provider === "apple") {
          window.location.href = `${API_URL}/api/auth/apple`;
          return;
        } else if (params?.email && params?.password) {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: params.email,
              password: params.password,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Login failed");
          }

          const { accessToken, refreshToken, user } = await response.json();
          setStoredTokens(accessToken, refreshToken);
          setUser(user);
          navigate("/");
        } else {
          throw new Error("Invalid login parameters");
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(error instanceof Error ? error.message : "Login failed");
        throw error;
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      removeStoredTokens();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error.message : "Logout failed");
      throw error;
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        login,
        isAuthenticated: !!user,
        error,
        clearError,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Authentication context provider that manages user authentication state and related functions
// Handles Google OAuth authentication flow, session management, and user data

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";

// User data structure returned from the API
interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
}

// Authentication context shape with all available methods and state
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  login: () => Promise<void>;
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const checkAuthStatusRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  // Check if user is authenticated by calling the /me endpoint
  const checkAuthStatus = async () => {
    if (isCheckingAuth) return; // Prevent concurrent checks

    try {
      setIsCheckingAuth(true);
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          // Only redirect if we were previously authenticated and enough time has passed
          if (user !== null && Date.now() - lastCheckTime > 1000) {
            navigate("/login?error=Session expired. Please log in again.");
          }
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
      setLastCheckTime(Date.now());
    } catch (error) {
      console.error("Auth status check error:", error);
      setUser(null);
      if (error instanceof Error && error.message.includes("fetch")) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Authentication error. Please try again.");
      }
    } finally {
      setIsCheckingAuth(false);
      setIsLoading(false);
    }
  };

  // Check auth status every 5 minutes
  useEffect(() => {
    // Initial check
    checkAuthStatus();

    // Set up interval
    checkAuthStatusRef.current = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => {
      if (checkAuthStatusRef.current) {
        clearInterval(checkAuthStatusRef.current);
      }
    };
  }, []); // Remove user dependency to prevent reset

  // Additional check when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      // Only check if last check was more than 1 minute ago
      if (Date.now() - lastCheckTime > 60 * 1000) {
        checkAuthStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [lastCheckTime]);

  // Redirect to Google OAuth login
  const login = async () => {
    try {
      window.location.href = `${API_URL}/api/auth/google`;
    } catch (error) {
      console.error("Login redirect error:", error);
      setError(
        "Failed to initiate login. Please check your internet connection and try again."
      );
      throw error;
    }
  };

  // Handle user logout by calling logout endpoint and clearing state
  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    }
  };

  // Utility function to clear any auth errors
  const clearError = () => {
    setError(null);
  };

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

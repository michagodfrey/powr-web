import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
}

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          // If we were authenticated before but now we're not, session expired
          if (user !== null) {
            navigate("/login?error=Session expired. Please log in again.");
          }
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Auth status check error:", error);
      setUser(null);
      setError("Something broke!");
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status periodically to handle session expiration
  useEffect(() => {
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [user]);

  // Initial auth check
  useEffect(() => {
    checkAuthStatus();
  }, []);

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

// Authentication context provider that manages user authentication state and related functions
// Backed by Supabase Auth (Google OAuth only) — Supabase manages session
// storage and token refresh itself; this just tracks the resulting
// app-specific profile (fetched from the API) and exposes sign-in/out actions.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { api } from "../utils/api";

// User data structure returned from the API
interface User {
  id: string;
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
  login: () => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Supabase user id whose profile is loaded (or loading), and the in-flight
  // request for it. Right after an OAuth redirect Supabase emits both
  // INITIAL_SESSION and SIGNED_IN; without de-duping, the concurrent /me
  // calls race to create the profile row on first login.
  const profileUserIdRef = useRef<string | null>(null);
  const profileRequestRef = useRef<Promise<void> | null>(null);

  // Fetch the app-specific profile for the given Supabase user (once per user)
  const loadProfile = useCallback((supabaseUserId: string) => {
    if (profileUserIdRef.current === supabaseUserId && profileRequestRef.current) {
      return profileRequestRef.current;
    }
    profileUserIdRef.current = supabaseUserId;

    const request = (async () => {
      try {
        const response = await api.get("/api/auth/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        setUser(await response.json());
      } catch (err) {
        console.error("Failed to load profile:", err);
        setUser(null);
        // Allow a later auth event to retry
        profileUserIdRef.current = null;
        profileRequestRef.current = null;
      }
    })();
    profileRequestRef.current = request;
    return request;
  }, []);

  // onAuthStateChange emits INITIAL_SESSION on subscribe (after any OAuth
  // redirect in the URL has been processed), so it covers the existing-session
  // case as well as later sign-in/out.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        profileUserIdRef.current = null;
        profileRequestRef.current = null;
        setUser(null);
        setIsLoading(false);
        return;
      }
      // Deferred: supabase-js advises against calling its own methods (which
      // api.get does, via getSession) from inside this callback.
      setTimeout(() => {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async () => {
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) throw oauthError;
      // No navigation here — signInWithOAuth redirects the whole page away,
      // and AuthCallback handles navigating to "/" once isAuthenticated
      // flips true after the profile loads.
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/home");
    } catch (err) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err.message : "Logout failed");
      throw err;
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

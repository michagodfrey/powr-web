// Authentication context provider that manages user authentication state and related functions
// Backed by Supabase Auth (Google OAuth + email/password) — Supabase manages
// session storage and token refresh itself; this just tracks the resulting
// app-specific profile (fetched from the API) and exposes sign-in/out actions.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
  login: (params?: {
    email?: string;
    password?: string;
    provider?: "google";
  }) => Promise<void>;
  signUp: (params: { email: string; password: string }) => Promise<void>;
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

  // Fetch the app-specific profile for the current Supabase session
  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get("/api/auth/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      setUser(await response.json());
    } catch (err) {
      console.error("Failed to load profile:", err);
      setUser(null);
    }
  }, []);

  // On mount: pick up any existing Supabase session, then react to sign-in/out
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        loadProfile().finally(() => isMounted && setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadProfile();
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(
    async (params?: {
      email?: string;
      password?: string;
      provider?: "google";
    }) => {
      try {
        if (params?.provider === "google") {
          const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
          });
          if (oauthError) throw oauthError;
          return;
        }

        if (params?.email && params?.password) {
          const { error: signInError } = await supabase.auth.signInWithPassword(
            { email: params.email, password: params.password }
          );
          if (signInError) throw signInError;
          navigate("/");
          return;
        }

        throw new Error("Invalid login parameters");
      } catch (err) {
        console.error("Login error:", err);
        setError(err instanceof Error ? err.message : "Login failed");
        throw err;
      }
    },
    [navigate]
  );

  const signUp = useCallback(
    async (params: { email: string; password: string }) => {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          navigate("/");
        } else {
          // Project has "Confirm email" enabled — no session until they click the link
          setError("Check your email to confirm your account, then log in.");
        }
      } catch (err) {
        console.error("Sign up error:", err);
        setError(err instanceof Error ? err.message : "Failed to sign up.");
        throw err;
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
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
        signUp,
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

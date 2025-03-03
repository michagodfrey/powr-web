import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL search params instead of hash
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const refreshToken = params.get("refreshToken");
        const error = params.get("error");

        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!token || !refreshToken) {
          throw new Error("No tokens received");
        }

        // Store tokens
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        // Fetch user data
        const response = await fetch("http://localhost:4000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const { data } = await response.json();

        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // Redirect to dashboard
        navigate("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;

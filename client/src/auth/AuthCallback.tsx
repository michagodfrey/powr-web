import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get error from URL search params
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");

        if (error) {
          let errorMessage = "Authentication failed";
          switch (error) {
            case "auth_failed":
              errorMessage = "Google authentication failed. Please try again.";
              break;
            case "no_user":
              errorMessage = "Failed to create or find user account.";
              break;
            case "login_failed":
              errorMessage = "Failed to complete login. Please try again.";
              break;
            default:
              errorMessage = decodeURIComponent(error);
          }
          throw new Error(errorMessage);
        }

        // Fetch user data
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:4000"
          }/api/auth/me`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Authentication failed. Please try logging in again."
            );
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);

        // Redirect to dashboard
        navigate("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        navigate(`/login?error=${encodeURIComponent(errorMessage)}`);
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

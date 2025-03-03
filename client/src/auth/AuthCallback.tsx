import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ErrorToast from "../components/ErrorToast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        try {
          // Store the token
          localStorage.setItem("token", token);

          // Fetch user data
          await fetchUser(token);

          // Redirect to dashboard after successful authentication
          navigate("/", { replace: true });
        } catch (error) {
          console.error("Authentication error:", error);
          localStorage.removeItem("token");
          setError("Failed to authenticate. Please try again.");
          setTimeout(() => navigate("/login", { replace: true }), 5000);
        }
      } else {
        // Handle error case
        console.error("No token received");
        setError("No authentication token received. Please try again.");
        setTimeout(() => navigate("/login", { replace: true }), 5000);
      }
      setIsLoading(false);
    };

    handleCallback();
  }, [navigate, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Authenticating...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">Authentication failed</p>
          <p className="text-gray-600 dark:text-gray-300">
            Redirecting to login page...
          </p>
        </div>
      ) : null}

      {error && (
        <ErrorToast
          message={error}
          onClose={() => setError(null)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default AuthCallback;

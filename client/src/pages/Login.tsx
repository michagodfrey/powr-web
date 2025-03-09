import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ErrorToast from "../components/ErrorToast";

const Login = () => {
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check for error in URL parameters
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
      // Clear the error from URL
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [authError, clearError]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login();
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to initiate login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-secondary border-4 border-black dark:border-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary dark:text-white mb-2">
            POWR
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Progressive Overload Workout Recorder
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-8 py-4 border-4 border-black dark:border-white bg-white hover:bg-gray-50 dark:bg-secondary dark:hover:bg-gray-700 text-secondary dark:text-white font-bold text-lg transition-colors duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Sign in with Google"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current mr-3"></div>
                Connecting to Google...
              </div>
            ) : (
              <>
                <img
                  src="https://www.google.com/favicon.ico"
                  alt=""
                  className="w-6 h-6 mr-4"
                  aria-hidden="true"
                />
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Track your progress. Break your records.
          </p>
        </div>
      </div>

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

export default Login;

// Authentication page that handles multiple login methods (Email, Google)
// Provides a clean interface for authentication and handles error states
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAuthHandlers } from "../hooks/useAuthHandlers";
import ErrorToast from "../components/ErrorToast";

const Login = () => {
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  const { handleGoogleAuth, isLoading, setIsLoading, error, setError } =
    useAuthHandlers();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailMode, setIsEmailMode] = useState(false);
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
  }, [location, navigate, setError]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [authError, clearError, setError]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await login({ email, password });
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to login. Please try again."
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

        <div className="mt-8 space-y-4">
          {isEmailMode ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 border-4 border-black dark:border-white bg-white dark:bg-secondary text-secondary dark:text-white placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border-4 border-black dark:border-white bg-white dark:bg-secondary text-secondary dark:text-white placeholder-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-8 border-4 border-black dark:border-white bg-primary hover:bg-primary-dark text-white font-bold text-lg transition-colors duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Logging in...
                  </div>
                ) : (
                  "Login with Email"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEmailMode(false)}
                className="w-full text-secondary dark:text-white underline mt-4"
              >
                Back to all login options
              </button>
            </form>
          ) : (
            <>
              <button
                onClick={() => setIsEmailMode(true)}
                className="w-full py-4 px-8 border-4 border-black dark:border-white bg-primary hover:bg-primary-dark text-white font-bold text-lg transition-colors duration-200"
              >
                Login with Email
              </button>

              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-8 py-4 border-4 border-black dark:border-white bg-white hover:bg-gray-50 dark:bg-secondary dark:hover:bg-gray-700 text-secondary dark:text-white font-bold text-lg transition-colors duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt=""
                  className="w-6 h-6 mr-4"
                  aria-hidden="true"
                />
                Login with Google
              </button>
            </>
          )}
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

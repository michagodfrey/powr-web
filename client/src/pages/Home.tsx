import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAuthHandlers } from "../hooks/useAuthHandlers";
import ErrorToast from "../components/ErrorToast";
import InstallBanner from "../components/InstallBanner";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { handleGoogleAuth, isLoading, error, setError } = useAuthHandlers();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // AuthCallback redirects here with ?error= when Google sign-in fails
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
      navigate("/home", { replace: true });
    }
  }, [location, navigate, setError]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-light-bg dark:bg-dark-bg shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex-shrink-0 leading-tight">
              <span className="block text-2xl font-bold text-secondary dark:text-white">
                POWR
              </span>
              <span className="block text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Progressive Overload Workout Recorder
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#how-it-works"
                className="text-secondary dark:text-white hover:text-primary"
              >
                How It Works
              </a>
              {isAuthenticated ? (
                <Link
                  to="/"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark flex items-center justify-center"
                >
                  <img
                    src="/google-icon.svg"
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4 mr-2"
                  />
                  Sign in with Google
                </button>
              )}
            </div>
            <div className="flex md:hidden items-center">
              {isAuthenticated ? (
                <Link
                  to="/"
                  className="bg-primary text-white px-3 py-2 rounded-md hover:bg-primary-dark text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  aria-label="Sign in with Google"
                  title="Sign in with Google"
                  className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <img
                    src="/google-icon.svg"
                    alt=""
                    aria-hidden="true"
                    className="w-5 h-5"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="lg:mt-0">
              <img
                src="/powr-logo.jpg"
                alt="POWR - Progressive Overload Workout Recorder"
                className="w-full rounded-lg shadow-md"
              />
            </div>
            <div className="mt-12 lg:mt-0 lg:ml-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-secondary dark:text-white mb-6">
                Elevate Your Strength
              </h1>
              <p className="text-xl text-secondary dark:text-white mb-6">
                Track your progress, overload your workouts, and progress with
                ease.
              </p>
              <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">
                  The Principle of Progressive Overload
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Muscles adapt to the demands placed on them. To keep
                  getting stronger, you need to gradually increase the
                  weight, reps, or volume of your lifts over time — pushing
                  just beyond what your body is used to. POWR logs every set
                  so you can see that progression clearly and know exactly
                  when it's time to add more.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-white dark:bg-dark-bg text-secondary dark:text-white border border-secondary dark:border-white px-8 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  <img
                    src="/google-icon.svg"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                  />
                  Sign In with Google
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary dark:text-white mb-4">
            A Minimal Way to Record Your Lifts
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            POWR strips workout logging down to the essentials: say your sets
            out loud or type them in, and watch your progress take shape on
            the graph.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Log Sets by Voice",
                description:
                  "Mid-set and don't want to fumble with your phone? Just speak your weight and reps — POWR records them instantly.",
              },
              {
                title: "Track Sets & Reps",
                description:
                  "Every exercise, weight, and rep is captured in a clean, no-friction log — nothing to fill in that isn't essential.",
              },
              {
                title: "Graph Your Volume Over Time",
                description:
                  "See weight x reps charted per session, so progressive overload is something you can see, not just feel.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-bg p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold text-secondary dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary dark:text-white mb-8">
            Start Training Smarter Today
          </h2>
          <div className="space-y-4 max-w-md mx-auto">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full bg-white dark:bg-dark-bg text-secondary dark:text-white border border-secondary dark:border-white px-8 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
            >
              <img
                src="/google-icon.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Sign In with Google
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
          <a
            href="https://github.com/michagodfrey/powr-web"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="POWR on GitHub"
            className="text-white hover:text-primary transition-colors"
          >
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.48 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .32.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <p className="text-sm text-gray-300">
            © 2026 POWR. All Rights Reserved.
          </p>
        </div>
      </footer>

      {error && (
        <ErrorToast
          message={error}
          onClose={() => setError(null)}
          duration={5000}
        />
      )}

      <InstallBanner />
    </div>
  );
};

export default Home;

import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { useAuthHandlers } from "../hooks/useAuthHandlers";
import ErrorToast from "../components/ErrorToast";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const { handleGoogleAuth, handleAppleAuth, isLoading, error, setError } =
    useAuthHandlers();

  const toggleTheme = () => {
    updatePreferences({
      darkMode: !preferences.darkMode,
      useDeviceTheme: false,
    });
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-light-bg dark:bg-dark-bg shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-secondary dark:text-white">
                POWR
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="#features"
                className="text-secondary dark:text-white hover:text-primary"
              >
                Features
              </Link>
              <Link
                to="#how-it-works"
                className="text-secondary dark:text-white hover:text-primary"
              >
                How It Works
              </Link>
              <Link
                to="#testimonials"
                className="text-secondary dark:text-white hover:text-primary"
              >
                Testimonials
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {preferences.darkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              {isAuthenticated ? (
                <Link
                  to="/"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-secondary dark:text-white border border-secondary dark:border-white px-4 py-2 rounded-md hover:bg-secondary hover:text-white dark:hover:bg-white dark:hover:text-secondary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark flex items-center justify-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-secondary dark:text-white mb-6">
                Elevate Your Strength
              </h1>
              <p className="text-xl text-secondary dark:text-white mb-8">
                Track your progress, overload your workouts, and progress with
                ease.
              </p>
              <div className="space-y-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-dark border border-secondary flex items-center justify-center"
                >
                  Sign Up with Email
                </Link>
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
                  Sign Up with Google
                </button>
                <button
                  onClick={handleAppleAuth}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-white dark:bg-dark-bg text-secondary dark:text-white border border-secondary dark:border-white px-8 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  <img
                    src="/apple-icon.svg"
                    alt="Apple"
                    className="w-5 h-5 mr-2"
                  />
                  Sign Up with Apple
                </button>
                <p className="text-center text-secondary dark:text-white">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                {/* Placeholder for app UI mockup */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary dark:text-white mb-12">
            Why Choose POWR?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Track Your Progress",
                description:
                  "Monitor sets, reps, and weights to capture every strength gain.",
              },
              {
                title: "Auto Progressive Overload",
                description:
                  "Benefit from data-driven recommendations to gradually boost workout intensity.",
              },
              {
                title: "Minimalist & Intuitive UI",
                description:
                  "Experience a clean, clutter-free design focused on essential strength tracking.",
              },
              {
                title: "Custom Reminders & Insights",
                description:
                  "Receive personalized reminders and actionable analytics to stay on track.",
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary dark:text-white mb-12">
            Simple & Effective
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Workout Plan",
                description:
                  "Select key strength exercises and customize your routine to meet your fitness goals.",
              },
              {
                step: "2",
                title: "Log Your Workouts",
                description:
                  "Record weights, reps, and sets effortlessly with our streamlined system.",
              },
              {
                step: "3",
                title: "Track Progress & Improve",
                description:
                  "View real-time analytics and smart recommendations to ensure steady improvement.",
              },
              {
                step: "4",
                title: "Crush Your Fitness Goals",
                description:
                  "Stay consistent, build strength, and achieve the results you've aimed for!",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-dark-bg p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="text-4xl font-bold text-primary mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary dark:text-white mb-12">
            What Lifters & Athletes Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "POWR made tracking my workouts seamless and effective!",
                author: "Alex R.",
              },
              {
                quote:
                  "The auto progressive overload feature keeps me consistently improving!",
                author: "Jess M.",
              },
              {
                quote:
                  "Finally, a no-nonsense app for serious strength training!",
                author: "Mike D.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-bg p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <p className="text-lg text-secondary dark:text-white mb-4">
                  "{testimonial.quote}"
                </p>
                <p className="text-primary font-semibold">
                  - {testimonial.author}
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
            <Link
              to="/signup"
              className="w-full bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-dark border border-secondary inline-block text-center"
            >
              Sign Up with Email
            </Link>
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
              Sign Up with Google
            </button>
            <button
              onClick={handleAppleAuth}
              disabled={isLoading}
              className="w-full bg-white dark:bg-dark-bg text-secondary dark:text-white border border-secondary dark:border-white px-8 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
            >
              <img src="/apple-icon.svg" alt="Apple" className="w-5 h-5 mr-2" />
              Sign Up with Apple
            </button>
            <p className="text-secondary dark:text-white">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/" className="block hover:text-primary">
                  Home
                </Link>
                <Link to="#features" className="block hover:text-primary">
                  Features
                </Link>
                <Link to="#how-it-works" className="block hover:text-primary">
                  How It Works
                </Link>
                <Link to="#testimonials" className="block hover:text-primary">
                  Testimonials
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="hover:text-primary">support@powr.app</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to="/terms" className="block hover:text-primary">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="block hover:text-primary">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>© 2025 POWR. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

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

export default Home;

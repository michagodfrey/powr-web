// User preferences page for managing application settings
// Handles theme selection and unit preferences (kg/lb)
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";

const Settings = () => {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = usePreferences();

  const handleUnitChange = (unit: "kg" | "lb") => {
    updatePreferences({ preferredUnit: unit });
  };

  const handleThemeChange = (isDark: boolean) => {
    updatePreferences({
      darkMode: isDark,
      useDeviceTheme: false,
    });
  };

  const handleDeviceThemeChange = (useDevice: boolean) => {
    updatePreferences({ useDeviceTheme: useDevice });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6 text-secondary dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-secondary dark:text-white">
          Settings
        </h1>
      </div>

      <div className="card max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Unit Preference</h2>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-md ${
                preferences.preferredUnit === "kg"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => handleUnitChange("kg")}
            >
              Kilograms (kg)
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                preferences.preferredUnit === "lb"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => handleUnitChange("lb")}
            >
              Pounds (lb)
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useDeviceTheme"
                checked={preferences.useDeviceTheme ?? true}
                onChange={(e) => handleDeviceThemeChange(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label
                htmlFor="useDeviceTheme"
                className="ml-2 text-sm font-medium"
              >
                Use device theme
              </label>
            </div>

            <div
              className={`flex gap-4 ${
                preferences.useDeviceTheme ? "opacity-50" : ""
              }`}
            >
              <button
                className={`px-4 py-2 rounded-md ${
                  !preferences.darkMode && !preferences.useDeviceTheme
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                onClick={() => handleThemeChange(false)}
                disabled={preferences.useDeviceTheme}
              >
                Light Mode
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  preferences.darkMode && !preferences.useDeviceTheme
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                onClick={() => handleThemeChange(true)}
                disabled={preferences.useDeviceTheme}
              >
                Dark Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

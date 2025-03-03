import { useState } from "react";
import { UserPreferences } from "../types";

const Settings = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredUnit: "kg",
    darkMode: false,
  });

  const handleUnitChange = (unit: "kg" | "lb") => {
    setPreferences((prev) => ({ ...prev, preferredUnit: unit }));
  };

  const handleThemeChange = (isDark: boolean) => {
    setPreferences((prev) => ({ ...prev, darkMode: isDark }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary dark:text-white mb-8">
        Settings
      </h1>

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
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-md ${
                !preferences.darkMode
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => handleThemeChange(false)}
            >
              Light Mode
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                preferences.darkMode
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => handleThemeChange(true)}
            >
              Dark Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

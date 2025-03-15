import React, { createContext, useContext, useState, useEffect } from "react";

interface UserPreferences {
  preferredUnit: "kg" | "lb";
  darkMode: boolean;
  useDeviceTheme: boolean;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  preferredUnit: "kg",
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  useDeviceTheme: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem("userPreferences");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all required fields are present
      return {
        ...defaultPreferences,
        ...parsed,
      };
    }
    return defaultPreferences;
  });

  // Effect for handling system theme changes
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (preferences.useDeviceTheme) {
        setPreferences((prev) => ({ ...prev, darkMode: e.matches }));
      }
    };

    // Set up system theme change listener
    darkModeMediaQuery.addEventListener("change", handleThemeChange);

    // Initial sync with system theme if using device theme
    if (preferences.useDeviceTheme) {
      const isDarkMode = darkModeMediaQuery.matches;
      if (preferences.darkMode !== isDarkMode) {
        setPreferences((prev) => ({ ...prev, darkMode: isDarkMode }));
      }
    }

    // Cleanup
    return () => {
      darkModeMediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [preferences.useDeviceTheme]);

  // Effect for applying theme and saving preferences
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("userPreferences", JSON.stringify(preferences));

    // Apply theme class based on dark mode setting
    if (preferences.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Remove any media query based classes that might interfere
    document.documentElement.classList.remove("dark:media");
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPreferences };

      // If enabling device theme, immediately sync with system preference
      if (newPreferences.useDeviceTheme) {
        const isDarkMode = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        return { ...updated, darkMode: isDarkMode };
      }

      return updated;
    });
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

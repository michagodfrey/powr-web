import React, { createContext, useContext, useState, useEffect } from "react";

interface UserPreferences {
  preferredUnit: "kg" | "lb";
  darkMode: boolean;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  preferredUnit: "kg",
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem("userPreferences");
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));

    // Apply dark mode
    if (preferences.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
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

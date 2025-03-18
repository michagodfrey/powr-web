/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Custom POWR color scheme from PRD
        primary: "#e8772e", // Orange
        secondary: "#001f3f", // Dark Blue
        "light-bg": "#ffffff", // Light mode background
        "dark-bg": "#1a1a1a", // Dark mode background
        "primary-dark": "#0e7490",
      },
    },
  },
  plugins: [],
  utilities: {
    ".overflow-wrap-anywhere": {
      "overflow-wrap": "anywhere",
    },
  },
};

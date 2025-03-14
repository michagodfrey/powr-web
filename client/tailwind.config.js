/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom POWR color scheme from PRD
        primary: "#e8772e", // Orange
        secondary: "#001f3f", // Dark Blue
        "light-bg": "#ffffff", // Light mode background
        "dark-bg": "#1a1a1a", // Dark mode background
      },
    },
  },
  plugins: [],
};

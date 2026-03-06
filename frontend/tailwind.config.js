/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate900: "#0b1020",
        slate800: "#101729",
        slate700: "#1a2238",
        slate600: "#263250",
        accent: "#2dd4bf",
      },
      boxShadow: {
        panel: "0 8px 24px rgba(2, 6, 23, 0.35)",
      },
    },
  },
  plugins: [],
};

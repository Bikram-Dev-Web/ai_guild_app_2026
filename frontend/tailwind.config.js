export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ec4899",
        secondary: "#f472b6",
        accent: "#fbcfe8",
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda29b",
          400: "#f87171",
          500: "#f43f5e",
          600: "#e11d48",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
      },
    },
  },
  plugins: [],
};

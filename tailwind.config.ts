import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0B1210",
          900: "#0F1A17",
          800: "#16241F",
        },
        crate: {
          50: "#F4F7F3",
          100: "#E4ECE3",
          200: "#C7D6C4",
          300: "#9FB79A",
          400: "#6F9469",
          500: "#4C7546",
          600: "#0F6E56",
          700: "#0B5445",
          800: "#093F35",
          900: "#062A24",
        },
        rust: {
          50: "#FDF3EC",
          100: "#FAE0CC",
          200: "#F2B989",
          300: "#E89A4F",
          400: "#D97D2E",
          500: "#B25F1E",
          600: "#8A4816",
        },
        signal: {
          50: "#FCEBEB",
          200: "#F09595",
          500: "#C23B3B",
          600: "#A32D2D",
        },
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 26, 23, 0.06), 0 1px 0 rgba(15, 26, 23, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;

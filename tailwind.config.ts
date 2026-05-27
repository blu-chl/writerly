import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f8f7f4", 100: "#f0ede6", 200: "#ddd8cc", 300: "#c4bdb0",
          400: "#a89d8e", 500: "#8c7f6e", 600: "#726656", 700: "#5c5244",
          800: "#3d3730", 900: "#201e19",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
    },
  },
  plugins: [],
} satisfies Config;

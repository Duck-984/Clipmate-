/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        surface: "#141414",
        surfaceLight: "#1E1E1E",
        border: "#2A2A2A",
        gold: "#D4AF37",
        goldLight: "#F0D060",
        accent: "#3B82F6",
        success: "#22C55E",
        danger: "#EF4444",
        text: "#F5F5F5",
        textMuted: "#9CA3AF",
      },
    },
  },
  plugins: [],
};

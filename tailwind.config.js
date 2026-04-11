/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#111111",
          800: "#181825",
          700: "#1e1e2e",
          600: "#2a2a3a",
        },
        accent: {
          DEFAULT: "#7c3aed",
          bright: "#8b5cf6",
          deep: "#5b21b6",
        },
      },
      fontFamily: {
        sans: [
          '"DM Sans"',
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      padding: {
        safe: "env(safe-area-inset-bottom)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
        "message-in": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.6" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.5" },
          "40%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.5s ease-in-out",
        "message-in":
          "message-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "bounce-dot": "bounce-dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

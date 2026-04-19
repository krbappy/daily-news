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
        "float-up": {
          "0%": {
            transform: "translateY(110vh) translateX(0) rotate(0deg)",
            opacity: "0",
          },
          "10%": { opacity: "0.9" },
          "90%": { opacity: "0.9" },
          "100%": {
            transform:
              "translateY(-15vh) translateX(var(--drift, 30px)) rotate(var(--spin, 360deg))",
            opacity: "0",
          },
        },
        "fall-down": {
          "0%": {
            transform: "translateY(-15vh) translateX(0) rotate(0deg)",
            opacity: "0",
          },
          "10%": { opacity: "0.85" },
          "90%": { opacity: "0.85" },
          "100%": {
            transform:
              "translateY(110vh) translateX(var(--drift, 40px)) rotate(var(--spin, 540deg))",
            opacity: "0",
          },
        },
        "soft-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.18" },
          "50%": { transform: "scale(1.08)", opacity: "0.32" },
        },
        twinkle: {
          "0%, 100%": { transform: "scale(0.6)", opacity: "0.3" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
        },
        "heart-beat": {
          "0%, 100%": { transform: "scale(1)" },
          "20%": { transform: "scale(1.15)" },
          "40%": { transform: "scale(0.95)" },
          "60%": { transform: "scale(1.1)" },
        },
        "wobble-y": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-6px) rotate(2deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shake: "shake 0.5s ease-in-out",
        "message-in":
          "message-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "bounce-dot": "bounce-dot 1.2s ease-in-out infinite",
        "float-up": "float-up var(--dur, 9s) linear infinite",
        "fall-down": "fall-down var(--dur, 11s) linear infinite",
        "soft-pulse": "soft-pulse 3.5s ease-in-out infinite",
        twinkle: "twinkle var(--dur, 2.4s) ease-in-out infinite",
        "heart-beat": "heart-beat 1.6s ease-in-out infinite",
        "wobble-y": "wobble-y 3.2s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
}

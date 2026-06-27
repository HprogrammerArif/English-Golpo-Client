/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── English Golpo Brand ─────────────────────────────
        primary: {
          DEFAULT: "#10B981",  // Emerald — main brand identity
          light:   "#34D399",
          dark:    "#059669",
        },
        secondary: {
          DEFAULT: "#F59E0B",  // Warm Amber — XP, streaks, achievements
          light:   "#FBBF24",
          dark:    "#D97706",
        },
        accent: {
          blue:    "#2563EB",  // Links and info
          purple:  "#7C3AED",  // League badges
          pink:    "#DB2777",  // Admission path
          red:     "#EF4444",  // Lives, alerts, Nagad
          cyan:    "#0891B2",  // Vocab path
        },
        // ── Neutrals ────────────────────────────────────────
        gray: {
          50:  "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        // ── Surface tokens ───────────────────────────────────
        surface: "#FFFFFF",
        background: "#F0FDF4",  // Very light green tint for bg
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
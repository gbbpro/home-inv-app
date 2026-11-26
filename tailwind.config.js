/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Colors that change in dark mode read CSS variables (see globals.css).
        stone: {
          50: "rgb(var(--stone-50) / <alpha-value>)",
          100: "rgb(var(--stone-100) / <alpha-value>)",
          200: "rgb(var(--stone-200) / <alpha-value>)",
          300: "rgb(var(--stone-300) / <alpha-value>)",
          400: "rgb(var(--stone-400) / <alpha-value>)",
          500: "rgb(var(--stone-500) / <alpha-value>)",
          600: "rgb(var(--stone-600) / <alpha-value>)",
          700: "rgb(var(--stone-700) / <alpha-value>)",
          800: "rgb(var(--stone-800) / <alpha-value>)",
          900: "rgb(var(--stone-900) / <alpha-value>)",
          950: "rgb(var(--stone-950) / <alpha-value>)",
        },
        surface: "rgb(var(--surface) / <alpha-value>)",
        red: { 50: "rgb(var(--red-50) / <alpha-value>)", 700: "rgb(var(--red-700) / <alpha-value>)" },
        brand: {
          ink: "rgb(var(--brand-ink) / <alpha-value>)",
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          500: "#12b76a",
          600: "#039855",
          700: "#027a48",
          800: "#05603a",
          900: "#054f31",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgb(28 25 23 / 0.04), 0 1px 3px rgb(28 25 23 / 0.06)",
        sheet: "0 -8px 30px rgb(28 25 23 / 0.12)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": { from: { transform: "translateY(16px)", opacity: 0 }, to: { transform: "none", opacity: 1 } },
        "drop-in": { from: { transform: "translateY(-12px)", opacity: 0 }, to: { transform: "none", opacity: 1 } },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        "drop-in": "drop-in 180ms ease-out",
      },
    },
  },
  plugins: [],
};

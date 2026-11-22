/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf3",
          100: "#d1fadf",
          200: "#a6f4c5",
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
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
      },
    },
  },
  plugins: [],
};

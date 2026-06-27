/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lumora light theme — warm espresso + burnt orange + cream
        cream: {
          50: "#FDF8F3",   // page background (lightest)
          100: "#FDF1E8",  // soft section background
          200: "#FBE3D2",  // peach tint / hover
          300: "#F3D9C4",  // borders on cream
        },
        espresso: {
          900: "#2B2520",  // primary text (darkest)
          800: "#3A332C",
          700: "#6E6258",  // secondary text
          600: "#9A7B63",  // muted / taupe
        },
        ember: {
          400: "#E8743B",  // bright orange accent
          500: "#C7531E",  // burnt orange (primary)
        },
        amber: {
          300: "#F2B179",  // warm amber (orb highlight)
          400: "#E89A5B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.65", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "fade-up": "fade-up 0.7s ease-out forwards",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface scale for the dark glass UI
        ink: {
          950: "#05070d",
          900: "#0a0e1a",
          850: "#0e1424",
          800: "#131b2e",
          700: "#1b2540",
          600: "#26334f",
        },
        // ESG pillar accents
        env: {
          DEFAULT: "#34d399",
          soft: "#6ee7b7",
          deep: "#059669",
        },
        social: {
          DEFAULT: "#38bdf8",
          soft: "#7dd3fc",
          deep: "#0284c7",
        },
        gov: {
          DEFAULT: "#a78bfa",
          soft: "#c4b5fd",
          deep: "#7c3aed",
        },
        gold: {
          DEFAULT: "#fbbf24",
          soft: "#fcd34d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(52, 211, 153, 0.35)",
        "glow-social": "0 0 40px -12px rgba(56, 189, 248, 0.35)",
        "glow-gov": "0 0 40px -12px rgba(167, 139, 250, 0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(52,211,153,0.08), transparent 60%)",
        "aurora":
          "linear-gradient(120deg, rgba(52,211,153,0.15), rgba(56,189,248,0.12) 40%, rgba(167,139,250,0.15) 80%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "80%,100%": { transform: "scale(1.4)", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

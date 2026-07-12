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
        "glow-lg": "0 0 60px -12px rgba(52, 211, 153, 0.45)",
        "glow-social": "0 0 40px -12px rgba(56, 189, 248, 0.35)",
        "glow-gov": "0 0 40px -12px rgba(167, 139, 250, 0.35)",
        "glow-gold": "0 0 40px -12px rgba(251, 191, 36, 0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
        "card-hover": "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 56px -12px rgba(0,0,0,0.7), 0 0 80px -20px rgba(52,211,153,0.08)",
        "inner-glow": "inset 0 0 40px 0 rgba(255,255,255,0.02)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(52,211,153,0.08), transparent 60%)",
        aurora:
          "linear-gradient(120deg, rgba(52,211,153,0.15), rgba(56,189,248,0.12) 40%, rgba(167,139,250,0.15) 80%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backdropBlur: {
        "2xl": "32px",
        "3xl": "48px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
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
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%,100%": { opacity: "0.2", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(1.08)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        breathing: {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "particle-float": {
          "0%,100%": { transform: "translateY(0) translateX(0)", opacity: "0.3" },
          "25%": { transform: "translateY(-14px) translateX(6px)", opacity: "0.6" },
          "50%": { transform: "translateY(-8px) translateX(-5px)", opacity: "0.4" },
          "75%": { transform: "translateY(-18px) translateX(4px)", opacity: "0.5" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(var(--orbit-r, 40px)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(var(--orbit-r, 40px)) rotate(-360deg)" },
        },
        "progress-shine": {
          "0%": { left: "-40%" },
          "100%": { left: "140%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 6s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out both",
        "scale-in": "scale-in 0.4s ease-out both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.4s ease-out both",
        "slide-in-left": "slide-in-left 0.4s ease-out both",
        breathing: "breathing 3s ease-in-out infinite",
        "particle-float": "particle-float 8s ease-in-out infinite",
        orbit: "orbit 8s linear infinite",
        "progress-shine": "progress-shine 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

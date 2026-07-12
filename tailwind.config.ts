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
        // === Organic Earth: warm charcoal surface scale (browns, not blue-black) ===
        ink: {
          950: "#12100A",
          900: "#191509",
          850: "#201B10",
          800: "#292318",
          700: "#362F21",
          600: "#473E2C",
        },
        // Warm "paper" text scale - overrides Tailwind's cool slate everywhere.
        slate: {
          50: "#FBF8F1",
          100: "#F3EEE1",
          200: "#E9E0CE",
          300: "#D6C9B0",
          400: "#AC9E82",
          500: "#8A7C63",
          600: "#6B5E48",
          700: "#4F4534",
          800: "#372F23",
          900: "#241E15",
          950: "#161109",
        },
        // === Pillar accents (earthy, tactile) ===
        env: {
          DEFAULT: "#9CB84A", // moss / olive
          soft: "#C6DA83",
          deep: "#5F7330",
        },
        social: {
          DEFAULT: "#5BA894", // sage teal
          soft: "#93CDBD",
          deep: "#396E5E",
        },
        gov: {
          DEFAULT: "#CB7A4E", // terracotta / clay
          soft: "#E7A97C",
          deep: "#9A5730",
        },
        gold: {
          DEFAULT: "#E0A838", // honey
          soft: "#F1CB6E",
        },
        clay: {
          DEFAULT: "#B08556",
          soft: "#D9C09A",
        },
        sand: {
          DEFAULT: "#D9C9A3",
          soft: "#E7DcC0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 44px -14px rgba(156, 184, 74, 0.4)",
        "glow-social": "0 0 44px -14px rgba(91, 168, 148, 0.4)",
        "glow-gov": "0 0 44px -14px rgba(203, 122, 78, 0.4)",
        // Soft, warm, tactile card shadow.
        card: "0 1px 0 0 rgba(255,247,230,0.05) inset, 0 24px 48px -30px rgba(0,0,0,0.75)",
        lift: "0 20px 50px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "aurora-warm":
          "linear-gradient(120deg, rgba(156,184,74,0.16), rgba(203,122,78,0.12) 45%, rgba(91,168,148,0.14) 85%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "80%,100%": { transform: "scale(1.5)", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        breathing: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "aurora-shift": {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(3%,-2%) scale(1.06)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up": "slide-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 7s ease-in-out infinite",
        breathing: "breathing 3s ease-in-out infinite",
        "aurora-shift": "aurora-shift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

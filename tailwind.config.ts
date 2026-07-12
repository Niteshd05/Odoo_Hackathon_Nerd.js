import type { Config } from "tailwindcss";

// Colors are driven by CSS variables (see globals.css) so the same class names
// work in both the dark (black) and light (paper) maximalist themes. Variables
// are stored as "R G B" triplets so Tailwind's /opacity modifiers work.
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface scale (flips per theme)
        ink: {
          950: v("--bg"),
          900: v("--surface-1"),
          850: v("--surface-1"),
          800: v("--surface-2"),
          700: v("--surface-3"),
          600: v("--surface-3"),
        },
        // Text/neutral ramp (flips per theme). Kept as `slate` so existing
        // text-slate-* usage recolors automatically.
        slate: {
          50: v("--fg-strong"),
          100: v("--fg"),
          200: v("--fg"),
          300: v("--fg-dim"),
          400: v("--muted"),
          500: v("--faint"),
          600: v("--faint-2"),
          700: v("--faint-2"),
          800: v("--faint-2"),
          900: v("--fg-strong"),
          950: v("--fg-strong"),
        },
        fg: v("--fg-strong"),
        line: v("--line"),
        sand: {
          DEFAULT: v("--line"),
          soft: v("--line"),
        },
        // Brand accent = acid yellow (both themes). env + gold both map to it.
        env: {
          DEFAULT: v("--accent"),
          soft: v("--accent-soft"),
          deep: v("--accent-deep"),
        },
        gold: {
          DEFAULT: v("--accent"),
          soft: v("--accent-soft"),
        },
        accent: {
          DEFAULT: v("--accent"),
          ink: v("--accent-ink"),
        },
        // Secondary pillar tones (neutral, theme-aware)
        social: {
          DEFAULT: v("--pillar-2"),
          soft: v("--pillar-2"),
          deep: v("--pillar-2"),
        },
        gov: {
          DEFAULT: v("--pillar-3"),
          soft: v("--pillar-3"),
          deep: v("--pillar-3"),
        },
        clay: { DEFAULT: v("--pillar-3"), soft: v("--pillar-2") },
        danger: v("--danger"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Maximalist display sizes
        mega: ["clamp(3rem, 8vw, 6rem)", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        giant: ["clamp(2.2rem, 5vw, 3.75rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--accent) / 0.35), 0 12px 40px -14px rgb(var(--accent) / 0.4)",
        "glow-social": "0 10px 40px -18px rgb(var(--pillar-2) / 0.5)",
        "glow-gov": "0 10px 40px -18px rgb(var(--pillar-3) / 0.5)",
        card: "0 1px 0 0 rgb(var(--line) / 0.06) inset, 0 24px 48px -30px rgb(0 0 0 / 0.6)",
        hard: "4px 4px 0 0 rgb(var(--fg-strong) / 1)",
        "hard-accent": "4px 4px 0 0 rgb(var(--accent) / 1)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.94)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "pulse-ring": { "0%": { transform: "scale(0.9)", opacity: "0.7" }, "80%,100%": { transform: "scale(1.5)", opacity: "0" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        breathing: { "0%,100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up": "slide-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 7s ease-in-out infinite",
        breathing: "breathing 3s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

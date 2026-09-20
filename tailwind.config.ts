import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claymorphism palette (from .cursor/skills/claymorphism/SKILL.md)
        clay: {
          primary: "#3B82F6",
          primaryLight: "#60A5FA",
          primaryDark: "#2563EB",
          surface: "#FFFFFF",
          text: "#1C398E",
          success: "#16A34A",
          successLight: "#DCFCE7",
          warning: "#D97706",
          warningLight: "#FEF3C7",
          danger: "#DC2626",
          dangerLight: "#FEE2E2",
          bg: "#F0F4FF",
        },
      },
      fontFamily: {
        // Loaded via next/font/google in layout.tsx
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        clay: "1.5rem",        // 24px — the signature clay radius
        "clay-sm": "1rem",     // 16px — smaller elements
        "clay-xs": "0.75rem",  // 12px — tiny elements (badges, buttons)
      },
    },
  },
  plugins: [],
};
export default config;

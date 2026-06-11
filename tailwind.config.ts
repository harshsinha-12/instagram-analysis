import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a", // slate-900 (deep navy/charcoal for text)
        muted: "#475569", // slate-600
        paper: "#F8F7F3", // off-white
        surface: "#FFFFFF",
        line: "#cbd5e1", // slate-300
        leaf: "#0F766E", // primary deep emerald/teal
        coral: "#ea580c", // strategic orange
        gold: "#b6842c",
        navy: "#1e293b", // slate-800
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 118, 110, 0.08)",
        floating: "0 20px 40px -10px rgba(15, 118, 110, 0.15)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
    }
  },
  plugins: [tailwindcssAnimate],
};

export default config;

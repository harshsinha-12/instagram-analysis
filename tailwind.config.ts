import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        muted: "#667085",
        paper: "#f7f6f2",
        line: "#d8d5cc",
        leaf: "#176b5d",
        coral: "#bf5b45",
        gold: "#b6842c"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 38, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

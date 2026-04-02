import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#06070a",
        surface: "#0b0f17",
        border: "rgba(255, 255, 255, 0.1)",
        accent: "#7c3aed",
        electric: "#38bdf8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124, 58, 237, 0.15), 0 18px 60px rgba(10, 14, 25, 0.55)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseLine: "pulseLine 3.5s ease-in-out infinite",
        drift: "drift 18s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.45", transform: "scaleY(0.65)" },
          "50%": { opacity: "1", transform: "scaleY(1)" },
        },
        drift: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(30px, -20px, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

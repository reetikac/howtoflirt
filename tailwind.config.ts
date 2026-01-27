import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon GenZ palette
        neon: {
          purple: "#B794F6",
          pink: "#F72585",
          blue: "#4CC9F0",
        },
        dark: {
          bg: "#000000",
          card: "#1C1C1E",
          border: "#2C2C2E",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        bubble: ["Quicksand", "Rounded", "Comic Sans MS", "cursive"],
      },
      backgroundImage: {
        // Neon gradients
        "gradient-neon": "linear-gradient(135deg, #F72585 0%, #B794F6 50%, #4CC9F0 100%)",
        "gradient-neon-subtle": "linear-gradient(135deg, rgba(247, 37, 133, 0.6) 0%, rgba(183, 148, 246, 0.6) 100%)",
        "gradient-dark": "linear-gradient(180deg, #000000 0%, #0a0a0a 100%)",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
      boxShadow: {
        neon: "0 4px 24px rgba(247, 37, 133, 0.3)",
        "neon-lg": "0 8px 32px rgba(247, 37, 133, 0.4)",
        "neon-glow": "0 0 30px rgba(183, 148, 246, 0.5)",
        focus: "0 0 0 3px rgba(183, 148, 246, 0.3)",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

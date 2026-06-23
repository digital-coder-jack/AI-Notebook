import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "#171717",
        sidebarHover: "#212121",
        chatbg: "#212121",
        userbubble: "#2f2f2f",
        border: "#2a2a2a",
        accent: "#10a37f",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.3s ease-out",
        blink: "blink 1s step-end infinite",
        slideIn: "slideIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;

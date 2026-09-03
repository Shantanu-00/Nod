import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F7F5F0",
          surface: "#FFFFFF",
          "surface-elevated": "#FAF8F5",
          border: "rgba(0, 0, 0, 0.08)",
          "border-warm": "#EAE5DB",
          text: "#1E2024",
          muted: "#666D79",
          green: "#78A82A",
          "green-hover": "#689423",
          "green-muted": "#EAF5ED",
          dark: "#14161A",
          "dark-surface": "#1F2228",
        },
        pillar: {
          read: "#257A3A",
          "read-bg": "#EAF5ED",
          write: "#1E70D5",
          "write-bg": "#EBF2FB",
          publish: "#C02674",
          "publish-bg": "#F9EBF4",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        lexend: ["var(--font-lexend)", "Lexend", "sans-serif"],
        atkinson: ["var(--font-atkinson)", "Atkinson Hyperlegible", "sans-serif"],
        dyslexic: ["var(--font-dyslexic)", "OpenDyslexic", "sans-serif"],
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#bfd6ff",
          300: "#93bbff",
          400: "#6099f7",
          500: "#417ae9",
          600: "#2152d1",
          700: "#1c46b3",
          800: "#173b96",
          900: "#132f78",
          950: "#0f265f",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        "page-enter": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in-soft": {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "page-enter": "page-enter 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fade-in 0.22s ease-out forwards",
        "scale-in-soft": "scale-in-soft 0.26s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      transitionTimingFunction: {
        "smooth-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;


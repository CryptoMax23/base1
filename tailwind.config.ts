import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./public/**/*.svg"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Source Sans Pro", "Public Sans", "Helvetica Neue", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))"
      },
      animation: {
        "fade-out": "fadeOut 1s ease-out forwards"
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clay: {
          50: "#fdf5f1",
          100: "#fbe8de",
          200: "#f5cdb8",
          300: "#eeac8c",
          400: "#e3805a",
          500: "#d15f38",
          600: "#b8482a",
          700: "#963824",
          800: "#792f21",
          900: "#63291f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    "#0D0D0F",
          surface: "#141416",
          card:    "#1C1C20",
          hover:   "#242428",
        },
        border: {
          subtle:  "#1E1E24",
          DEFAULT: "#2A2A30",
          strong:  "#3A3A44",
        },
        text: {
          muted:   "#52525E",
          subtle:  "#6B6B7A",
          body:    "#C8C8D4",
          primary: "#F0F0F4",
        },
        accent: {
          purple:  "#7C6AF7",
          purple2: "#9D8FFF",
          amber:   "#F0904D",
          teal:    "#3ECFAD",
          red:     "#E05C5C",
          green:   "#4DB87A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

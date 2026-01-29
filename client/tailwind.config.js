/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#3b82f6",
          secondary: "#1e293b",
          accent: "#3b82f6",
          neutral: "#1a1d29",
          "base-100": "#1a1d29",
          "base-200": "#252836",
          "base-300": "#2d3142",
        },
      },
    ],
    darkTheme: "dark",
  },
}
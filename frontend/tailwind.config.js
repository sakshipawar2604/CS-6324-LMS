/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,jsx}"],
  theme: {
    extend: {
      keyframes: {
        "gradient-slow": {
          "0%, 100%": {
            opacity: "0.6",
          },
          "50%": {
            opacity: "0.85",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "gradient-slow": "gradient-slow 10s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
    },
  },
  plugins: [],
};

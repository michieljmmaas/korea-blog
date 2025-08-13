import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Location-based background colors
    'bg-indigo-600',   // work
    'bg-purple-600',   // japan
    'bg-blue-600',     // seoul
    'bg-red-600',      // busan
    'bg-green-600',    // taiwan
    'bg-emerald-600',  // hong kong
    'bg-orange-600',   // netherlands
    'bg-gray-600',     // default
    'bg-yellow-500',   // featured
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "accent-1": "#FAFAFA",
        "accent-2": "#EAEAEA",
        "accent-7": "#333",
        success: "#0070f3",
        cyan: "#79FFE1",
      },
      spacing: {
        28: "7rem",
      },
      letterSpacing: {
        tighter: "-.04em",
      },
      fontSize: {
        "5xl": "2.5rem",
        "6xl": "2.75rem",
        "7xl": "4.5rem",
        "8xl": "6.25rem",
      },
      boxShadow: {
        sm: "0 5px 10px rgba(0, 0, 0, 0.12)",
        md: "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
      container: {
        center: true,
        padding: '1.25rem', // px-5
        screens: {
          sm: '640px',
          md: '800px',   // wider than default
          lg: '1200px',
          xl: '1400px',
          '2xl': '1600px',
        },
      },
    },
  },
  plugins: [],
};
export default config;
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vyomPrimary: '#0369a1',   // sky-700 (Corporate & Trust)
        vyomSecondary: '#10b981', // emerald-500 (Green-tech & Solar)
        vyomAccent: '#f59e0b',    // amber-500 (Energy & Earnings)
        vyomBase: '#f1f5f9',      // slate-100 (Clean Background)
      }
    },
  },
  plugins: [],
}
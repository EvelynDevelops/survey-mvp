/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#16252d',      // Deep navy blue (dark backgrounds, text)
        'mint': '#23dba7',      // Bright mint green (primary accent, CTAs)
        'soft-mint':'#d8f6f0',
        'purple': '#743bfc',    // Vibrant purple (secondary accent, highlights)
        'amber': '#fff8e6',     // Warm amber yellow (warnings, highlights)
        'lavender': '#f1ebff',  // Light lavender purple (subtle backgrounds)
      },
    },
  },
  plugins: [],
}

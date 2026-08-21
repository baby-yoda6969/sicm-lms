/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Crimson Pro"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // SICM Official Brand Palette: Royal Sapphire & Deep Navy Blue
        crimson: {
          50: '#F0F6FF',
          100: '#E0EEFE',
          200: '#BAE0FD',
          300: '#7CC4FA',
          400: '#38A4F6',
          500: '#0F84E8',
          600: '#0267C7',
          700: '#0352A1',
          800: '#0D2F6B', // Official SICM Royal Blue
          900: '#0A2352', // Official SICM Deep Navy
          950: '#061533', // Official SICM Midnight Navy
        },
        // Refined Celestial Azure & Platinum Silver (Replaced harsh mustard gold)
        gold: {
          50: '#F0F7FF',
          100: '#E0F0FE',
          200: '#BAE0FD',
          300: '#7CC4FA',
          400: '#38BDF8', // Celestial Azure
          500: '#0284C7', // Refined Sapphire
          600: '#0369A1',
          700: '#075985',
          800: '#0C4A6E',
          900: '#082F49',
          950: '#051926',
        },
        // SICM Royal Navy Aliases
        royal: {
          50: '#F0F6FF',
          100: '#E0EEFE',
          200: '#BAE0FD',
          300: '#7CC4FA',
          400: '#38A4F6',
          500: '#0F84E8',
          600: '#0267C7',
          700: '#0352A1',
          800: '#0D2F6B',
          900: '#0A2352',
          950: '#061533',
        },
        // Ivy Green
        ivy: {
          50: '#F2FAF5',
          100: '#E1F4E8',
          500: '#22C55E',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Editorial Light Alabaster Parchment
        parchment: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Backwards compatibility for existing sicm classes
        sicm: {
          50: '#F0F6FF',
          100: '#E0EEFE',
          200: '#BAE0FD',
          300: '#7CC4FA',
          400: '#38A4F6',
          500: '#0F84E8',
          600: '#0267C7',
          700: '#0352A1',
          800: '#0D2F6B',
          900: '#0A2352',
          950: '#061533',
        },
        accent: {
          azure: '#38BDF8',
          sapphire: '#0284C7',
          emerald: '#15803D',
          blue: '#0D2F6B',
        }
      },
      boxShadow: {
        'sicm': '0 4px 20px -2px rgba(13, 47, 107, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'sicm-lg': '0 10px 30px -4px rgba(13, 47, 107, 0.18), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'azure-glow': '0 0 18px rgba(56, 189, 248, 0.35)',
        'royal-glow': '0 0 20px rgba(13, 47, 107, 0.35)',
      }
    },
  },
  plugins: [],
};

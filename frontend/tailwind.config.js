/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colorful pixel art palette
        cream: '#FFF8E7',
        peach: '#FFD4B2',
        'warm-brown': '#8B5A2B',
        'warm-gray': '#A0826D',
        coral: '#FF6B6B',
        mint: '#4ECDC4',
        purple: '#9B59B6',
        blue: '#3498DB',
        yellow: '#F1C40F',
        orange: '#E67E22',
        pink: '#E91E63',
        green: '#2ECC71',
        dark: '#2C1810',
      },
      fontFamily: {
        pixel: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

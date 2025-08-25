/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'neon-purple': '#8b5cf6',
        'neon-blue': '#3b82f6',
        'neon-cyan': '#06b6d4',
        'neon-pink': '#ec4899',
        'neon-green': '#10b981',
        'neon-yellow': '#f59e0b',
        'dark-bg': '#0a0e27',
        'darker-bg': '#000000',
      },
      backgroundImage: {
        'futuristic-gradient': 'linear-gradient(135deg, #0a0e27 0%, #000000 100%)',
        'radial-purple': 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        'radial-blue': 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        'radial-cyan': 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
        'conic-gradient': 'conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'particle-float': 'particle-float 20s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
        'particle-float': {
          '0%': {
            transform: 'translateY(100vh) rotate(0deg)',
          },
          '100%': {
            transform: 'translateY(-100vh) rotate(360deg)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
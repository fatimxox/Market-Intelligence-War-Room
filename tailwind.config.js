
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0C10',
        panel: '#11151C',
        'panel-border': '#2A303C',
        'primary-text': '#EAEAEA',
        accent: '#FDE047',
        'accent-hover': '#FACC15',
        secondary: '#1A222C',
        'secondary-hover': '#242F3D',
        disabled: 'rgba(234, 234, 234, 0.5)',
        'team-alpha': '#38BDF8', // light-blue-400
        'team-beta': '#F87171', // red-400
        success: '#4ADE80', // green-400
        danger: '#F87171', // red-400
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace', 'ui-monospace']
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.02)' },
        },
        'glow-border': {
          '0%, 100%': { borderColor: 'rgba(253, 224, 71, 0.2)', boxShadow: '0 0 10px rgba(253, 224, 71, 0.1)' },
          '50%': { borderColor: 'rgba(253, 224, 71, 0.6)', boxShadow: '0 0 25px rgba(253, 224, 71, 0.3)' },
        },
        subtlePulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(253, 224, 71, 0.4)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 0 10px 5px rgba(253, 224, 71, 0)' }
        }
      },
      animation: {
        glow: 'glow 3s ease-in-out infinite',
        'glow-border': 'glow-border 3s ease-in-out infinite',
        'subtle-pulse': 'subtlePulse 2.5s ease-in-out infinite'
      },
    }
  },
  plugins: [],
}

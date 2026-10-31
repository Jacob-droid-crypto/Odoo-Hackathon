/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F7F5',
        ink: {
          DEFAULT: '#111111',
          light: '#2A2A2A',
          subtle: '#3E3E3E'
        },
        dot: '#0D0D0D',
        muted: '#9A9A9A',
        secondary: '#7B7B7B',
        terracotta: {
          DEFAULT: '#D14836',
          hover: '#BA3F2E',
          light: '#FBEBE8'
        },
        surface: '#FFFFFF',
        border: '#E6E4DF',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        editorial: '-0.025em',
        widest: '0.12em',
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '5px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
}

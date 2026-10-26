/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: '#F7F5F0',
        softwhite: '#FFFEFC',
        espresso: {
          DEFAULT: '#302729',
          light: '#4A3E40',
          dark: '#1C1617',
        },
        cherry: {
          DEFAULT: '#E53945',
          dark: '#BF232E',
          light: '#FCEBEC',
          glow: 'rgba(229, 57, 69, 0.25)',
        },
        blossom: {
          DEFAULT: '#E8C9DA',
          light: '#F6EBF1',
          dark: '#D4A8C2',
        },
        lavender: {
          DEFAULT: '#BDA9D5',
          light: '#E6DEEF',
          dark: '#9F88C0',
        },
        sage: {
          DEFAULT: '#92AA7B',
          light: '#DFE8D7',
          dark: '#6F845A',
        },
        muted: {
          DEFAULT: '#A6A1A0',
          light: '#D3CFCE',
          dark: '#736E6D',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        pixel: ['"Silkscreen"', '"Press Start 2P"', 'monospace'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(48, 39, 41, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(48, 39, 41, 0.05) 1px, transparent 1px)",
        'grid-pattern-dark': "linear-gradient(to right, rgba(255, 254, 252, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 254, 252, 0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-24': '24px 24px',
        'grid-32': '32px 32px',
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(48, 39, 41, 0.06), 0 2px 6px -1px rgba(48, 39, 41, 0.03)',
        'editorial-hover': '0 12px 30px -4px rgba(48, 39, 41, 0.1), 0 4px 10px -2px rgba(48, 39, 41, 0.05)',
        'pixel-sm': '2px 2px 0px #302729',
        'pixel': '3px 3px 0px #302729',
        'pixel-lg': '4px 4px 0px #302729',
        'crt-glow': '0 0 25px rgba(189, 169, 213, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}

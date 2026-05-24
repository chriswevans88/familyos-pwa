import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ]
      },
      colors: {
        ink: {
          950: '#05070b',
          900: '#090b10',
          850: '#10131b',
          800: '#171b25'
        },
        aurora: {
          mint: '#6ee7b7',
          cyan: '#22d3ee',
          gold: '#f5c542',
          rose: '#fb7185',
          violet: '#a78bfa'
        }
      },
      boxShadow: {
        glass: '0 24px 80px rgba(0, 0, 0, 0.28)',
        glow: '0 0 50px rgba(34, 211, 238, 0.18)'
      },
      backgroundImage: {
        'app-radial':
          'radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.2), transparent 34%), linear-gradient(135deg, #05070b 0%, #10131b 52%, #121019 100%)',
        'card-sheen':
          'linear-gradient(145deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.09))'
      }
    }
  },
  plugins: []
} satisfies Config;

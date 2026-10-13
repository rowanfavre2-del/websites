/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        tall: { raw: '(min-height: 860px)' },
      },
      colors: {
        ink: { DEFAULT: '#0B1B2B', soft: '#3A4856', muted: '#5A6672' },
        ivory: { DEFAULT: '#FAF7F0', deep: '#F2EDE2' },
        accent: { DEFAULT: '#F26B3A', dark: '#B0441A', tint: '#FDE6DC' },
        verified: { DEFAULT: '#1F7A6D', tint: '#DDEFEB' },
        amber: { text: '#7A4E00', tint: '#FCEFD2' },
        rule: '#E3DCCD',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,27,43,0.06), 0 4px 16px rgba(11,27,43,0.06)',
        paper: '0 1px 1px rgba(11,27,43,0.08), 0 8px 24px rgba(11,27,43,0.10)',
      },
    },
  },
  plugins: [],
};

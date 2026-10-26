// Chiếu Hới — Tailwind preset. Dùng: presets: [require('./design/tokens/tailwind.preset')]
import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: { primary: 'var(--bg-primary)', secondary: 'var(--bg-secondary)', raised: 'var(--bg-raised)', inverse: 'var(--bg-inverse)', deep: 'var(--bg-deep)', ink: 'var(--bg-ink)' },
        text: { primary: 'var(--text-primary)', secondary: 'var(--text-secondary)', muted: 'var(--text-muted)', meta: 'var(--text-meta)', 'on-dark': 'var(--text-on-dark)', 'on-dark-muted': 'var(--text-on-dark-muted)' },
        accent: { DEFAULT: 'var(--accent)', hover: 'var(--accent-hover)', press: 'var(--accent-press)', 'on-dark': 'var(--accent-on-dark)' },
        straw: 'var(--decor-straw)',
      },
      fontFamily: {
        display: ['var(--font-noto-serif-display)', 'Georgia', 'serif'],
        serif: ['var(--font-noto-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-be-vietnam-pro)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // [desktop, mobile] — dùng clamp hoặc breakpoint
        display: ['clamp(2.375rem, 1.6rem + 3.4vw, 4.375rem)', { lineHeight: '1.12' }], // 38 → 70
        h2: ['clamp(2.25rem, 1.7rem + 2.4vw, 3.75rem)', { lineHeight: '1.1' }],          // 36 → 60
        h3: ['clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem)', { lineHeight: '1.15' }],         // 28 → 44
        h4: ['clamp(1.5rem, 1.3rem + .9vw, 2rem)', { lineHeight: '1.2' }],               // 24 → 32
        lead: ['clamp(1.125rem, 1rem + .6vw, 1.375rem)', { lineHeight: '1.7' }],         // 18 → 22
        'body-lg': ['clamp(1rem, .95rem + .3vw, 1.1875rem)', { lineHeight: '1.65' }],    // 16 → 19
        eyebrow: ['0.75rem', { lineHeight: '1.4', letterSpacing: '.24em', fontWeight: '600' }],
      },
      maxWidth: { content: '1440px', prose: '68ch' },
      spacing: { 18: '4.5rem', 30: '7.5rem', 32: '8rem', 40: '10rem' },
      borderRadius: { none: '0' },
      transitionTimingFunction: { weave: 'cubic-bezier(.2,.7,.2,1)' },
      transitionDuration: { micro: '150ms', ui: '250ms', reveal: '600ms' },
      screens: { sm: '390px', md: '768px', lg: '1024px', xl: '1440px', '2xl': '1920px' },
    },
  },
};
export default preset;

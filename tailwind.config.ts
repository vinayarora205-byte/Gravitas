import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6A2A',
        dark: '#0F0F0F',
        light: '#F6F1EB',
        card: '#FFFFFF',
        mint: '#CFE8E5',
        muted: '#6B7280',
        
        // Retaining old variables if they are used elsewhere
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        accent: {
          DEFAULT: "#FF6B3D",
          hover: "#FF8C5A",
        },
        orange: { DEFAULT: '#FF6A2A', light: '#FFF0EB', dark: '#E5512A' },
        gold: '#FFD166',
        glass: 'rgba(255,255,255,0.25)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        glass: '24px'
      },
      maxWidth: {
        container: '1280px'
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceCustom: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 200ms ease forwards',
        'typing-dot': 'bounceCustom 600ms infinite',
      }
    },
  },
  plugins: [],
};
export default config;

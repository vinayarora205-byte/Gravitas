import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        border: "var(--border)",
        accent: {
          DEFAULT: "#FF6B3D",
          hover: "#FF8C5A",
        },
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        success: "var(--success)",
        error: "var(--error)",
        warning: "var(--warning)",
        
        // Brand Colors
        orange: { DEFAULT: '#FF6B3D', light: '#FFF0EB', dark: '#E5512A' },
        gold: '#FFD166',
        glass: 'rgba(255,255,255,0.25)',
        dark: { bg: '#0F0F1A', surface: '#1A1A2E', card: '#252540' }
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        glass: '24px'
      },
      fontSize: {
        "h1": ["40px", { lineHeight: "1.2", fontWeight: "600" }],
        "h2": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "h3": ["24px", { lineHeight: "1.2", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "1.5", fontWeight: "400" }],
        "body": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "small": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px",
        "3xl": "64px",
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

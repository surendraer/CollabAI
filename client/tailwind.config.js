/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        // === Core semantic — mapped to CSS variables (light/dark toggle) ===
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",

        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },

        // === Primary (Electric Blue) ===
        primary: {
          DEFAULT: "var(--primary)",
          bright: "var(--primary-bright)",
          deep: "var(--primary-deep)",
          soft: "var(--primary-soft)",
          dark: "var(--primary-deep)", // alias for primary-dark used in LandingPage
        },
        "on-primary": "#ffffff",

        // === Ink / text scale ===
        ink: {
          DEFAULT: "var(--ink)",
          deep: "var(--ink-deep)",
          soft: "var(--ink-soft)",
          muted: "var(--ink-muted)",
          secondary: "var(--ink-secondary)",
          faint: "var(--ink-faint)",
        },
        "on-ink": "#ffffff",

        // === Surface scale ===
        canvas: {
          DEFAULT: "var(--canvas)",
          soft: "var(--canvas-soft)",
        },
        paper: "var(--paper)",
        surface: "var(--surface)",
        cloud: "var(--cloud)",
        fog: "var(--fog)",
        steel: "var(--steel)",
        graphite: "var(--graphite)",
        charcoal: "var(--charcoal)",
        hairline: {
          DEFAULT: "var(--hairline)",
          strong: "var(--hairline-strong)",
        },

        // === Secondary / dark hero band ===
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },

        // === Accent colors ===
        "accent-green": "var(--accent-green)",
        "accent-purple": "var(--accent-purple)",
        "accent-sky": "var(--accent-sky)",

        // === Semantic / status ===
        "bloom-coral": "#ff5050",
        "bloom-rose": "var(--bloom-rose)",
        "bloom-deep": "#b3262b",
        "bloom-wine": "#5a1313",
        "storm-mist": "#8ebdce",
        "storm-sea": "#7fadbe",
        "storm-deep": "#356373",
      },
      borderRadius: {
        none: "0px",
        xs: "2px",
        sm: "3px",
        md: "4px",
        lg: "8px",
        xl: "16px",
        "2xl": "20px",
        pill: "9999px",
        full: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        xxl: "32px",
        section: "80px",
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "soft-lift": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "elevated": "0 8px 24px rgba(0, 0, 0, 0.12)",
        "floating-modal": "0 8px 24px rgba(0, 0, 0, 0.10)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

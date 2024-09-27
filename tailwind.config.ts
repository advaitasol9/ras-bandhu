/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgb(var(--border))", // Border color from CSS
        input: "rgb(var(--inputff))", // Input field background color
        "input-placeholder": "rgb(var(--input-placeholder))",
        ring: "rgb(var(--ring))", // Ring/focus color
        background: "rgb(var(--background))", // Background color
        foreground: "rgb(var(--foreground))", // Text color on the background

        primary: {
          DEFAULT: "rgb(var(--primary))", // Primary color (for buttons, links)
          foreground: "rgb(var(--primary-foreground))", // Text color on primary elements
        },

        secondary: {
          DEFAULT: "rgb(var(--secondary))", // Secondary color
          foreground: "rgb(var(--secondary-text))", // Text color for secondary
        },

        destructive: {
          DEFAULT: "rgb(var(--destructive))", // Destructive action color (e.g., delete button)
          foreground: "rgb(var(--destructive-foreground))", // Text color for destructive actions
        },

        muted: {
          DEFAULT: "rgb(var(--muted))", // Muted background color
          foreground: "rgb(var(--muted-foreground))", // Text color on muted backgrounds
        },

        accent: {
          DEFAULT: "rgb(var(--accent))", // Accent color
          foreground: "rgb(var(--accent-foreground))", // Text color on accent elements
        },

        popover: {
          DEFAULT: "rgb(var(--popover))", // Background color for popovers
          foreground: "rgb(var(--primary-text))", // Text color inside popovers
        },

        card: {
          DEFAULT: "rgb(var(--card))", // Background color for cards
          foreground: "rgb(var(--card-foreground))", // Text color inside cards
        },

        // Additional text colors if needed
        "primary-text": "rgb(var(--primary-text))", // Primary text color
        "secondary-text": "rgb(var(--secondary-text))", // Secondary text color
        "button-text": "rgb(var(--button-text))", // Text color for buttons
      },
      borderRadius: {
        lg: "var(--radius)", // Large border radius
        md: "calc(var(--radius) - 2px)", // Medium border radius
        sm: "calc(var(--radius) - 4px)", // Small border radius
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

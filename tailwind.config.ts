import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        secondary: "var(--color-secondary)",
        "secondary-hover": "var(--color-secondary-hover)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        babyblue: "var(--color-babyblue)",
        "babyblue-hover": "var(--color-babyblue-hover)",
        "dropzone-bg": "var(--dropzone-background)",
        "dropzone-bd": "var(--dropzone-border)",
        "textarea-bg": "var(--textarea-background)",
        "textarea-bd": "var(--textarea-border)",
      },
      fontFamily: {
       sans: ["Poppins", "system-ui", "sans-serif"],
       heading: ["Ubuntu", "sans-serif"],
      },
     
    },
  },
  plugins: [],
} satisfies Config;

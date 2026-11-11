import { Inter as DisplayFont, JetBrains_Mono, Pixelify_Sans } from "next/font/google";

export const displayFont = DisplayFont({
  variable: "--font-display",
  subsets: ["latin"],
  fallback: ["Hanken Grotesk", "system-ui", "sans-serif"],
});

export const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  fallback: ["ui-monospace", "monospace"],
});

export const pixelFont = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
  fallback: ["ui-monospace", "monospace"],
});

export const fontVariables = [displayFont.variable, monoFont.variable, pixelFont.variable].join(" ");

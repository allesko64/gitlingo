import type { Metadata } from "next";
import { ProgressSync } from "@/components/auth/ProgressSync";
import { fontVariables } from "@/lib/landing/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Git Lingo",
    template: "%s · Git Lingo",
  },
  description: "Learn git by actually using it. Type real commands and watch your files move.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const DebugGrid = process.env.NODE_ENV === "development"
    ? (await import("@/components/layout/DebugGrid")).DebugGrid
    : null;

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-white">
        {children}
        <ProgressSync />
        {DebugGrid !== null && <DebugGrid />}
        <div aria-hidden="true" className="grain" />
      </body>
    </html>
  );
}

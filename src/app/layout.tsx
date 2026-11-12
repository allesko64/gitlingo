import type { Metadata } from "next";
import { ProgressSync } from "@/components/auth/ProgressSync";
import { copy } from "@/lib/landing/copy";
import { fontVariables } from "@/lib/landing/fonts";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const site = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: site,
  title: {
    default: "Git Lingo",
    template: "%s · Git Lingo",
  },
  description: copy.meta.description,
  applicationName: "Git Lingo",
  keywords: ["git", "learn git", "git tutorial", "interactive", "coding", "version control"],
  authors: [{ name: "Aks", url: "https://x.com/ayush__64" }],
  creator: "Aks",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site,
    siteName: "Git Lingo",
    title: copy.meta.title,
    description: copy.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: copy.meta.title,
    description: copy.meta.description,
    creator: "@ayush__64",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const DebugGrid =
    process.env.NODE_ENV === "development"
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

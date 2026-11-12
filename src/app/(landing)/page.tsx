import type { Metadata } from "next";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LevelsPreview } from "@/components/landing/LevelsPreview";
import { Navbar } from "@/components/landing/Navbar";
import { FourZonesSection } from "@/components/landing/zones/FourZonesSection";
import { SectionDivider } from "@/components/layout/SectionDivider";
import { copy } from "@/lib/landing/copy";
import { getSiteUrl } from "@/lib/site";

const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Git Lingo — Learn git by actually using it",
} as const;

export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: copy.meta.title,
    description: copy.meta.description,
    siteName: "Git Lingo",
    type: "website",
    url: "/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: copy.meta.title,
    description: copy.meta.description,
    images: ["/og.png"],
  },
};

export default function LandingPage() {
  const site = getSiteUrl().origin;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Git Lingo",
    url: site,
    description: copy.meta.description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SectionDivider />
        <FourZonesSection />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <LevelsPreview />
        <SectionDivider />
        <FinalCta />
      </main>
      <SectionDivider />
      <Footer />
    </>
  );
}

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

export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
  openGraph: {
    title: copy.meta.title,
    description: copy.meta.description,
    siteName: "Git Lingo",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: copy.meta.title,
    description: copy.meta.description,
  },
};

export default function LandingPage() {
  return (
    <>
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

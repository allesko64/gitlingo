import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Footer } from "@/components/landing/Footer";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { AppTopBar } from "@/components/lesson/AppTopBar";
import { LevelsList } from "@/components/lesson/LevelsList";
import { lessonCopy } from "@/lib/lessonCopy";

export const metadata: Metadata = {
  title: "Levels",
  description: "Six short levels that take you from your first repository to merging branches.",
  alternates: { canonical: "/lessons" },
  openGraph: {
    title: "Levels · Git Lingo",
    description: "Six short levels that take you from your first repository to merging branches.",
    url: "/lessons",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Git Lingo — Learn git by actually using it",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function LessonsPage() {
  const text = lessonCopy.levelsPage;

  return (
    <>
      <AppTopBar />
      <main className="flex-1 pt-32 pb-24">
        <Container>
          <SectionHeader
            as="h1"
            id="levels-page-title"
            label={text.label}
            title={text.title}
            sub={text.sub}
            align="start"
          />
          <div className="mt-12">
            <LevelsList />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

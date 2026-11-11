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

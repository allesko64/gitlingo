import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Footer } from "@/components/landing/Footer";
import { AppTopBar } from "@/components/lesson/AppTopBar";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { LessonSkeleton } from "@/components/lesson/LessonSkeleton";
import { getLesson, lessons } from "@/lessons/lessons";
import { levelNumber } from "@/lib/progress";

type Params = PageProps<"/lessons/[id]">["params"];

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: lesson.id }));
}

export async function generateMetadata({ params }: PageProps<"/lessons/[id]">): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);
  if (lesson === undefined) {
    return { title: "Level not found", robots: { index: false, follow: true } };
  }
  return {
    title: `Level ${levelNumber(id)}: ${lesson.title}`,
    description: lesson.intro,
  };
}

async function Lesson({ params }: { params: Params }) {
  const { id } = await params;
  if (getLesson(id) === undefined) {
    notFound();
  }
  return <LessonPlayer key={id} id={id} />;
}

export default function LessonPage({ params }: PageProps<"/lessons/[id]">) {
  return (
    <>
      <AppTopBar />
      <main className="lesson-main flex-1">
        <Container>
          <Suspense fallback={<LessonSkeleton />}>
            <Lesson params={params} />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/layout/Container";
import { AppTopBar } from "@/components/lesson/AppTopBar";
import { Button } from "@/components/ui/Button";
import { lessons } from "@/lessons/lessons";
import { requireUser } from "@/lib/dal";
import { lessonCopy } from "@/lib/lessonCopy";
import { getCompletedIds } from "@/lib/progressDb";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

const text = lessonCopy.profile;

async function ProfileContent() {
  await connection();
  const user = await requireUser("/profile");
  const completed = await getCompletedIds(user.id);
  const next = lessons.find((lesson) => !completed.includes(lesson.id));

  return (
    <>
      <h1 className="mt-3 text-[32px] font-normal leading-[1.1] tracking-[-0.02em] text-white lg:text-[40px]">
        {user.name}
      </h1>
      <p className="mt-2 text-white/70">{user.email}</p>

      <p aria-live="polite" className="mt-8 text-base text-white/70">
        {lessonCopy.levelsPage.progress(completed.length, lessons.length)}
      </p>
      <ol className="mt-4 flex flex-col gap-3">
        {lessons.map((lesson, i) => {
          const done = completed.includes(lesson.id);
          return (
            <li
              key={lesson.id}
              className="card-surface flex items-center justify-between gap-4 rounded-card border border-white/10 px-5 py-4"
            >
              <span className={done ? "text-white" : "text-white/50"}>
                {i + 1}. {lesson.title}
              </span>
              <span className="font-pixel text-[10px] tracking-wide text-white/60">
                {done ? lessonCopy.done : lesson.id === next?.id ? text.next : lessonCopy.locked}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        <Button href={next === undefined ? "/lessons" : `/lessons/${next.id}`}>
          {next === undefined ? lessonCopy.seeAll : text.continue}
        </Button>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <>
      <AppTopBar />
      <main className="flex-1 pt-32 pb-24">
        <Container>
          <p className="font-pixel text-xs tracking-wide text-white/50">{text.label}</p>
          <Suspense fallback={<p className="mt-3 text-white/50">{text.loading}</p>}>
            <ProfileContent />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </>
  );
}

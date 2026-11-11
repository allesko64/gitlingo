import { Container } from "@/components/layout/Container";
import { Footer } from "@/components/landing/Footer";
import { AppTopBar } from "@/components/lesson/AppTopBar";
import { Button } from "@/components/ui/Button";
import { lessonCopy } from "@/lib/lessonCopy";

export default function NotFound() {
  const text = lessonCopy.notFound;

  return (
    <>
      <AppTopBar />
      <main className="flex flex-1 flex-col justify-center pt-32 pb-24">
              <Container className="flex flex-col items-start gap-6">
        <p className="font-pixel text-xs tracking-wide text-white/50">{text.label}</p>
        <h1 className="text-balance text-[32px] font-normal leading-[1.1] tracking-[-0.02em] text-white lg:text-[44px]">
          {text.title}
        </h1>
        <p className="text-lg text-white/70">{text.body}</p>
        <div className="flex flex-wrap gap-3">
          <Button href="/lessons">{lessonCopy.allLevels}</Button>
          <Button href="/" variant="secondary">
            {text.home}
          </Button>
        </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

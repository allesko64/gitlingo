import { copy, FIRST_LEVEL_HREF } from "@/lib/landing/copy";
import { Container } from "../layout/Container";
import { Button } from "../ui/Button";
import { LazyPixelScene } from "./HeroClientParts";
import { SceneFallback } from "./SceneFallback";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="landing-section relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <SceneFallback />
        <LazyPixelScene mode="compact" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/45" />

      <Container className="flex flex-col items-center justify-center gap-12 text-center">
        <h2
          id="final-cta-title"
          className="max-w-heading text-balance text-[32px] font-normal leading-[1.08] tracking-[-0.02em] text-white lg:text-[48px]"
        >
          {copy.finalCta.title}
        </h2>
        <Button href={FIRST_LEVEL_HREF}>{copy.finalCta.button}</Button>
      </Container>
    </section>
  );
}

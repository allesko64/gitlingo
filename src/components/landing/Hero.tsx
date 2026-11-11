import { copy, FIRST_LEVEL_HREF } from "@/lib/landing/copy";
import { Container } from "../layout/Container";
import { Grid } from "../layout/Grid";
import { Button } from "../ui/Button";
import { LazyHeroTerminal, LazyPixelScene } from "./HeroClientParts";
import { LearnerCounter } from "./LearnerCounter";
import { ArrowDownIcon } from "./PixelIcons";
import { SceneFallback } from "./SceneFallback";
import { FloatingStatusCards } from "./StatusCard";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="landing-section relative isolate flex items-center overflow-hidden lg:min-h-[max(100svh,640px)]"
    >
      <div className="absolute inset-0 -z-10">
        <SceneFallback />
        <LazyPixelScene />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-navy/40 lg:bg-transparent lg:bg-linear-to-r lg:from-navy/85 lg:via-navy/45 lg:to-transparent"
      />

      <Container>
        <Grid className="items-center" style={{ rowGap: 48 }}>
          <div className="col-span-12 min-w-0 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-3">
              <LearnerCounter />
              <p className="inline-flex rounded-ui border border-white/10 bg-navy/40 px-3 py-1 font-pixel text-xs text-white/70">
                {copy.hero.label}
              </p>
            </div>
            <h1
              id="hero-heading"
              className="mt-6 text-[40px] font-normal leading-[1.08] tracking-[-0.02em] text-white sm:text-[56px] lg:text-[68px]"
            >
              {copy.hero.headline}
            </h1>
            <p className="mt-6 max-w-[520px] text-base text-white/70 sm:text-lg">{copy.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={FIRST_LEVEL_HREF}>{copy.hero.primary}</Button>
              <Button
                href={copy.hero.secondaryHref}
                variant="secondary"
                icon={<ArrowDownIcon className="size-4" />}
              >
                {copy.hero.secondary}
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/50">{copy.hero.note}</p>
          </div>

          <div className="relative col-span-12 min-w-0 w-full scroll-mt-24 lg:col-span-6">
            <LazyHeroTerminal />
            <FloatingStatusCards />
          </div>
        </Grid>
      </Container>
    </section>
  );
}

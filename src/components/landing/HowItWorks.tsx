import type { ReactNode } from "react";
import { copy } from "@/lib/landing/copy";
import { Container } from "../layout/Container";
import { Grid } from "../layout/Grid";
import { SectionHeader } from "./SectionHeader";

const DEMO = "relative h-32 overflow-hidden rounded-ui border border-white/10 bg-navy";

function StoryDemo() {
  return (
    <div aria-hidden="true" className={`${DEMO} flex flex-col justify-center gap-3 px-4`}>
      {["w-5/6", "w-full", "w-2/3", "w-3/4"].map((width, i) => (
        <span
          key={width}
          className={`h-2 origin-left animate-story rounded-[3px] bg-white/30 motion-reduce:animate-none ${width}`}
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </div>
  );
}

function TypeDemo() {
  return (
    <div aria-hidden="true" className={`${DEMO} flex items-center px-4 font-mono text-sm`}>
      <span className="text-white/70">$&nbsp;</span>
      <span className="relative text-white">
        {copy.howItWorks.demoCommand}
        <span className="absolute inset-y-0 left-0 w-full translate-x-full animate-reveal bg-navy motion-reduce:animate-none">
          <span className="absolute top-1/2 left-0 h-4 w-2 -translate-y-1/2 animate-blink bg-white" />
        </span>
      </span>
    </div>
  );
}

function MoveDemo() {
  return (
    <div aria-hidden="true" className={`${DEMO} p-3`}>
      <div className="grid h-full grid-cols-2 gap-2">
        {["Working", "Staging"].map((zone) => (
          <div key={zone} className="flex justify-center rounded-[8px] border border-white/10 pt-2">
            <span className="text-[11px] leading-none text-white/70">{zone}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 bottom-6">
        <div className="flex w-1/2 animate-hop justify-center motion-reduce:animate-none">
          <span className="rounded-[6px] border border-white/20 bg-white/10 px-2 py-1 font-mono text-[11px] leading-none text-white">
            README.md
          </span>
        </div>
      </div>
    </div>
  );
}

const DEMOS: ReactNode[] = [<StoryDemo key="story" />, <TypeDemo key="type" />, <MoveDemo key="move" />];

export function HowItWorks() {
  const text = copy.howItWorks;

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="landing-section scroll-mt-24 bg-navy-deep">
      <Container>
        <SectionHeader id="how-it-works-title" label={text.label} title={text.title} sub={text.sub} />
        <Grid as="ol" className="mt-12 auto-rows-fr">
          {text.cards.map((card, i) => (
            <li key={card.title} className="card-surface col-span-12 flex min-w-0 flex-col gap-6 rounded-card border border-white/10 p-6 md:col-span-4">
              {DEMOS[i]}
              <div>
                <p className="font-pixel text-xs tracking-wide text-white/50">{`0${i + 1}`}</p>
                <h3 className="mt-2 text-xl font-medium tracking-[-0.01em] text-white">{card.title}</h3>
                <p className="mt-2 text-base text-white/70">{card.body}</p>
              </div>
            </li>
          ))}
        </Grid>
      </Container>
    </section>
  );
}

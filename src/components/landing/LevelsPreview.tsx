import { copy, FIRST_LEVEL_HREF } from "@/lib/landing/copy";
import { cn } from "@/lib/utils";
import { Container } from "../layout/Container";
import { Grid } from "../layout/Grid";
import { Button } from "../ui/Button";
import { PadlockIcon } from "./PixelIcons";
import { SectionHeader } from "./SectionHeader";

export function LevelsPreview() {
  const text = copy.levels;

  return (
    <section id="levels" aria-labelledby="levels-title" className="landing-section scroll-mt-24 bg-navy">
      <Container>
        <SectionHeader id="levels-title" label={text.label} title={text.title} sub={text.sub} />

        <Grid as="ol" className="mt-12 auto-rows-fr">
          {text.list.map((level, i) => {
            const number = i + 1;
            const open = number === 1;

            return (
              <li
                key={level.title}
                className={cn(
                  "card-surface col-span-12 flex min-w-0 flex-col rounded-card border p-6 md:col-span-6 lg:col-span-4",
                  open ? "border-white/30 bg-white/5" : "border-white/10",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("font-pixel text-xs tracking-wide", open ? "text-white/70" : "text-white/50")}>
                    {`LEVEL ${String(number).padStart(2, "0")}`}
                  </p>
                  {!open && (
                    <span className="inline-flex items-center gap-2 text-white/50">
                      <PadlockIcon className="size-3" />
                      <span className="font-pixel text-[10px] tracking-wide">{text.locked.toUpperCase()}</span>
                    </span>
                  )}
                </div>

                <h3 className={cn("mt-3 text-xl font-medium tracking-[-0.01em]", open ? "text-white" : "text-white/70")}>
                  {level.title}
                </h3>
                <p className="mt-1 text-base text-white/70">{level.line}</p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <code className="rounded-[6px] border border-white/10 px-2 py-1 font-mono text-[13px] text-white/70">
                    {level.command}
                  </code>
                  {open ? (
                    <Button href={FIRST_LEVEL_HREF} size="nav">
                      {text.start}
                      <span className="sr-only">{` level 1: ${level.title}`}</span>
                    </Button>
                  ) : (
                    <span className="text-sm text-white/50">{text.unlocksAfter(number - 1)}</span>
                  )}
                </div>
              </li>
            );
          })}
        </Grid>

        <p className="mt-8 text-base text-white/70">{text.more}</p>
      </Container>
    </section>
  );
}

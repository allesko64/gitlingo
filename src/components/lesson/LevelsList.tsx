"use client";

import { lessons } from "@/lessons/lessons";
import { chapterLabel, groupByChapter } from "@/lib/chapters";
import { copy } from "@/lib/landing/copy";
import { lessonCopy } from "@/lib/lessonCopy";
import { isDone, isUnlocked } from "@/lib/progress";
import { resetProgress, useProgress } from "@/lib/useProgress";
import { cn } from "@/lib/utils";
import { CheckIcon, PadlockIcon } from "../landing/PixelIcons";
import { Button } from "../ui/Button";
import { Grid } from "../layout/Grid";

const text = lessonCopy.levelsPage;

export function LevelsList() {
  const { progress } = useProgress();
  const doneCount = lessons.filter((lesson) => isDone(progress, lesson.id)).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p aria-live="polite" className="text-base text-white/70">
          {text.progress(doneCount, lessons.length)}
        </p>
        {doneCount > 0 && (
          <Button
            variant="secondary"
            size="nav"
            onClick={() => {
              if (window.confirm(text.confirmReset)) {
                resetProgress();
              }
            }}
          >
            {text.reset}
          </Button>
        )}
      </div>

      {groupByChapter(lessons).map((chapter) => (
        <section key={chapter.title} aria-labelledby={`chapter-${chapter.number}`} className="mt-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-pixel text-xs tracking-wide text-white/50">{chapterLabel(chapter.number)}</p>
            <h2 id={`chapter-${chapter.number}`} className="text-2xl font-medium tracking-[-0.01em] text-white">
              {chapter.title}
            </h2>
            <p className="text-base text-white/70">{chapter.line}</p>
          </div>

          <Grid as="ol" className="mt-6 auto-rows-fr">
            {chapter.items.map((lesson, i) => {
              const number = chapter.firstLevel + i;
              const done = isDone(progress, lesson.id);
              const open = done || isUnlocked(progress, lesson.id);
              const current = open && !done;
              const preview = copy.levels.list[number - 1];

              return (
                <li
                  key={lesson.id}
                  className={cn(
                    "card-surface col-span-12 flex min-w-0 flex-col rounded-card border p-6 md:col-span-6 lg:col-span-4",
                    current ? "border-white/30 bg-white/5" : "border-white/10",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className={cn("font-pixel text-xs tracking-wide", current ? "text-white/70" : "text-white/50")}>
                      {lessonCopy.levelLabel(number)}
                    </p>
                    {done && (
                      <span className="inline-flex items-center gap-2 text-white">
                        <CheckIcon className="size-3" />
                        <span className="font-pixel text-[10px] tracking-wide">{lessonCopy.done}</span>
                      </span>
                    )}
                    {!open && (
                      <span className="inline-flex items-center gap-2 text-white/50">
                        <PadlockIcon className="size-3" />
                        <span className="font-pixel text-[10px] tracking-wide">{lessonCopy.locked}</span>
                      </span>
                    )}
                  </div>

                  <h3 className={cn("mt-3 text-xl font-medium tracking-[-0.01em]", open ? "text-white" : "text-white/70")}>
                    {lesson.title}
                  </h3>
                  <p className="mt-1 text-base text-white/70">{preview.line}</p>

                  <div className="mt-auto flex items-center justify-between flex-wrap gap-3 pt-6">
                    <code className="rounded-[6px] border border-white/10 px-2 py-1 font-mono text-[13px] text-white/70">
                      {preview.command}
                    </code>
                    {open ? (
                      <Button href={`/lessons/${lesson.id}`} size="nav" variant={done ? "secondary" : "primary"}>
                        {done ? text.replay : number === 1 && doneCount === 0 ? text.start : text.continue}
                        <span className="sr-only">{` level ${number}: ${lesson.title}`}</span>
                      </Button>
                    ) : (
                      <span className="text-sm text-white/50">{text.unlocksAfter(number - 1)}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </Grid>
        </section>
      ))}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { LessonStep } from "@/lessons/types";
import { lessonCopy } from "@/lib/lessonCopy";
import { cn } from "@/lib/utils";
import { CheckIcon } from "../landing/PixelIcons";
import { Instruction } from "./Instruction";

type Props = {
  steps: LessonStep[];
  completed: number;
};

export function StepList({ steps, completed }: Props) {
  const [hintFor, setHintFor] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const item = listRef.current?.children[completed];
    const box = listRef.current?.parentElement;
    if (item === undefined || box === null || box === undefined) {
      return;
    }
    const itemRect = item.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    if (itemRect.top < boxRect.top) {
      box.scrollTop -= boxRect.top - itemRect.top;
    } else if (itemRect.bottom > boxRect.bottom) {
      box.scrollTop += itemRect.bottom - boxRect.bottom;
    }
  }, [completed]);

  return (
    <div className="lesson-steps mt-8">
      <h2 className="sr-only">{lessonCopy.stepsLabel}</h2>
      <p className="sr-only" aria-live="polite">
        {completed > 0 ? lessonCopy.stepCount(completed, steps.length) : ""}
      </p>
      <ol ref={listRef} aria-label={lessonCopy.stepsLabel} className="grid auto-rows-fr gap-3">
        {steps.map((step, i) => {
          const done = i < completed;
          const current = i === completed;

          return (
            <li
              key={step.instruction}
              aria-current={current ? "step" : undefined}
              className={cn(
                "card-surface flex gap-3 rounded-ui border border-l-2 p-4",
                current ? "border-white/20 border-l-periwinkle/60" : "border-white/10",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 grid size-6 shrink-0 place-items-center rounded-[6px] border font-mono text-xs",
                  done ? "border-mint/50 bg-mint/10 text-mint" : current ? "border-white text-white" : "border-white/20 text-white/50",
                )}
              >
                {done ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              <div className="min-w-0">
                <p className={cn("text-base leading-relaxed", done ? "text-white/70" : current ? "text-white" : "text-white/50")}>
                  <Instruction text={step.instruction} />
                  {done && <span className="sr-only"> Done.</span>}
                </p>
                <div className={current ? undefined : "invisible"} aria-hidden={!current}>
                  {hintFor === i ? (
                    <p className="mt-2 text-sm text-white/70">{step.hint}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHintFor(i)}
                      tabIndex={current ? 0 : -1}
                      className="mt-2 rounded-[6px] py-1 text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
                    >
                      {lessonCopy.showHint}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

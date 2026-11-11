"use client";

import { useState } from "react";
import { getLesson, lessons } from "@/lessons/lessons";
import { advance, isFinished, startRepo } from "@/lessons/progress";
import { lessonCopy } from "@/lib/lessonCopy";
import { currentLevelId, isDone, isUnlocked, levelNumber, nextLessonId } from "@/lib/progress";
import { completeLesson, useProgress } from "@/lib/useProgress";
import { Grid } from "../layout/Grid";

import { GraphPanel } from "../graph/GraphPanel";
import { PadlockIcon } from "../landing/PixelIcons";
import { Terminal, type CommandEvent } from "../terminal/Terminal";
import { TerminalChrome } from "../terminal/TerminalChrome";
import { Button } from "../ui/Button";
import { Instruction } from "./Instruction";
import { StepList } from "./StepList";

function Locked({ number }: { number: number }) {
  const { progress } = useProgress();
  const previous = lessons[number - 2];
  const target = currentLevelId(progress);

  return (
    <div className="mx-auto flex max-w-heading flex-col items-start gap-6 py-16">
      <span className="grid size-12 place-items-center rounded-ui border border-white/20 text-white/70">
        <PadlockIcon className="size-5" />
      </span>
      <h1 className="text-[32px] font-normal leading-[1.1] tracking-[-0.02em] text-white">
        {lessonCopy.lockedTitle(number)}
      </h1>
      <p className="text-lg text-white/70">{lessonCopy.lockedBody(number - 1, previous.title)}</p>
      <div className="flex flex-wrap gap-3">
        <Button href={`/lessons/${target}`}>{lessonCopy.goTo(levelNumber(target))}</Button>
        <Button href="/lessons" variant="secondary">
          {lessonCopy.seeAll}
        </Button>
      </div>
    </div>
  );
}

export function LessonPlayer({ id }: { id: string }) {
  const lesson = getLesson(id) ?? lessons[0];
  const number = levelNumber(lesson.id);
  const next = nextLessonId(lesson.id);
  const { progress, hydrated } = useProgress();

  const [attempt, setAttempt] = useState(0);
  const [repo, setRepo] = useState(() => startRepo(lesson));
  const [completed, setCompleted] = useState(0);
  const finished = isFinished(lesson, completed);
  const doneBefore = isDone(progress, lesson.id);
  const [saved, setSaved] = useState(false);
  const progressSaved = saved || doneBefore;

  if (hydrated && !isUnlocked(progress, lesson.id) && !doneBefore) {
    return <Locked number={number} />;
  }

  const onCommand = (event: CommandEvent) => {
    const reached = advance(lesson, completed, { repo: event.repo, input: event.input });
    if (reached !== completed) {
      setCompleted(reached);
    }
    if (!finished && isFinished(lesson, reached)) {
      void completeLesson(lesson.id).then(() => setSaved(true));
    }
  };

  const replay = () => {
    setAttempt((a) => a + 1);
    setRepo(startRepo(lesson));
    setCompleted(0);
  };

  const currentStep = lesson.steps[completed];

  return (
    <Grid className="lesson-layout">
      <section aria-labelledby="lesson-title" className="lesson-column lesson-story col-span-12 lg:col-span-6">
        <div className="lesson-intro">
          <p className="font-pixel text-xs tracking-wide text-white/50">
            {lessonCopy.levelLabel(number)}
            {doneBefore && ` · ${lessonCopy.done}`}
          </p>
          <h1
            id="lesson-title"
            className="mt-3 text-balance text-[32px] font-normal leading-[1.1] tracking-[-0.02em] text-white lg:text-[40px]"
          >
            {lesson.title}
          </h1>
          <p className="mt-4 text-base text-white/70 sm:text-lg">{lesson.intro}</p>
        </div>

        <StepList key={attempt} steps={lesson.steps} completed={completed} />

        {finished && (
          <div
            aria-live="polite"
            data-lesson-saved={progressSaved ? "true" : "pending"}
            className="lesson-complete mt-6 flex flex-col gap-4 rounded-ui border border-white/30 bg-white/10 p-6"
          >
            <div>
              <p className="font-pixel text-xs tracking-wide text-white/70">{lessonCopy.complete.toUpperCase()}</p>
              <p className="mt-2 text-lg text-white">{lessonCopy.completeBody(number, lesson.title)}</p>
              {next === null && <p className="mt-1 text-base text-white/70">{lessonCopy.allDone}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href={next === null ? "/lessons" : `/lessons/${next}`}>
                {next === null ? lessonCopy.seeAll : lessonCopy.nextLevel}
              </Button>
              <Button variant="secondary" onClick={replay}>
                {lessonCopy.replay}
              </Button>
            </div>
          </div>
        )}
      </section>

      <div className="lesson-column lesson-workspace col-span-12 flex min-w-0 flex-col gap-4 lg:col-span-6">
        {currentStep !== undefined && (
          <p className="rounded-ui border border-white/10 bg-white/5 px-4 py-3 text-base text-white lg:hidden">
            <span className="mb-1 block font-pixel text-[10px] tracking-wide text-white/70">
              {lessonCopy.current.toUpperCase()}
            </span>
            <Instruction text={currentStep.instruction} />
          </p>
        )}
        <TerminalChrome title={`~/level-${number}`} className="lesson-terminal">
          <Terminal
            key={attempt}
            variant="full"
            repo={repo}
            onRepoChange={setRepo}
            label={lessonCopy.terminalLabel}
            helpText={lessonCopy.help}
            welcome={lessonCopy.welcome(number, lesson.title)}
            onCommand={onCommand}
            outputClassName="lesson-terminal-output"
          />
        </TerminalChrome>
        <GraphPanel key={attempt} repo={repo} />
      </div>
    </Grid>
  );
}

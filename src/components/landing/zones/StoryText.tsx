import { copy, FIRST_LEVEL_HREF } from "@/lib/landing/copy";
import type { Step } from "@/lib/landing/fourZonesScript";
import { Button } from "../../ui/Button";
import { CommandBar } from "./CommandBar";

export function Caption({ step }: { step: Step }) {
  const said = step.command ?? (step.comment !== undefined ? `# ${step.comment}` : null);

  return (
    <p aria-live="polite" className="mt-4 min-h-16 text-lg text-white sm:min-h-8">
      {said !== null && <span className="sr-only">{`${said}. `}</span>}
      {step.caption}
    </p>
  );
}

export function StoryText({ step, typed }: { step: Step; typed: string }) {
  return (
    <div>
      <CommandBar typed={typed} comment={step.comment} />
      <Caption step={step} />
    </div>
  );
}

export function EndCard({ onStart, onReplay }: { onStart?: () => void; onReplay?: () => void }) {
  return (
    <div className="flex min-h-32 flex-col items-start gap-6 rounded-ui border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-center lg:justify-between">
      <p aria-live="polite" className="max-w-[560px] text-lg text-white">
        {copy.fourZones.end}
      </p>
      <div className="flex shrink-0 gap-3">
        <Button href={FIRST_LEVEL_HREF} onClick={onStart}>
          {copy.fourZones.startLevel}
        </Button>
        <Button variant="secondary" onClick={onReplay} ariaLabel={copy.fourZones.replay}>
          {copy.fourZones.replay}
        </Button>
      </div>
    </div>
  );
}

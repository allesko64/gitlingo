import { copy } from "@/lib/landing/copy";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/Button";

type Props = {
  step: number;
  total: number;
  canBack: boolean;
  canNext: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onDot?: (step: number) => void;
};

export function Controls({ step, total, canBack, canNext, onBack, onNext, onDot }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} disabled={!canBack} ariaLabel={copy.fourZones.backLabel}>
          {copy.fourZones.back}
        </Button>
        <Button onClick={onNext} disabled={!canNext} ariaLabel={copy.fourZones.nextLabel}>
          {copy.fourZones.next}
        </Button>
      </div>
      <ol className="flex items-center gap-1" aria-label="Story steps">
        {Array.from({ length: total }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onDot?.(i)}
              aria-label={`Go to step ${i + 1} of ${total}`}
              aria-current={i === step ? "step" : undefined}
              className="grid size-6 place-items-center rounded-ui"
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  i === step ? "bg-white" : i < step ? "bg-white/50" : "bg-white/20",
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

import { copy } from "@/lib/landing/copy";
import { cn } from "@/lib/utils";
import { GLASS } from "../ui/glass";

type Status = "done" | "running" | "locked";

type Props = {
  label: string;
  name: string;
  status: Status;
  command: boolean;
  duration: number;
  delay: number;
  className?: string;
};

function StatusDot({ status }: { status: Status }) {
  if (status === "locked") {
    return <span className="size-1.5 shrink-0 rounded-full border border-white" />;
  }

  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full bg-white",
        status === "running" && "animate-[pulse_2.4s_ease-in-out_infinite] motion-reduce:animate-none",
      )}
    />
  );
}

export function StatusCard({ label, name, status, command, duration, delay, className }: Props) {
  return (
    <div
      className={cn("absolute z-10 animate-bob [perspective:1000px] motion-reduce:animate-none", className)}
      style={{ animationDuration: `${duration}s`, animationDelay: `-${delay}s` }}
    >
      <div
        className={cn(
          "flex items-center gap-2 whitespace-nowrap rounded-ui p-4 [transform:rotateY(-4deg)_rotateX(2deg)] [transform-style:preserve-3d] lg:[transform:rotateY(-10deg)_rotateX(4deg)]",
          GLASS,
        )}
      >
        <StatusDot status={status} />
        <span className="text-xs text-white/60 sm:text-[13px]">{label}</span>
        <span
          className={cn(
            "font-semibold text-white",
            command ? "font-mono text-[13px] sm:text-sm" : "text-sm sm:text-[15px]",
          )}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

const PLACEMENT = [
  { duration: 6, delay: 0, position: "-top-12 right-4 lg:right-auto lg:-left-12" },
  { duration: 7, delay: 2.3, position: "right-4 bottom-1 lg:-top-6 lg:bottom-auto lg:right-4" },
  { duration: 5.5, delay: 4.1, position: "hidden lg:block lg:-bottom-8 lg:right-8" },
];

export function FloatingStatusCards() {
  return (
    <div aria-hidden="true">
      {copy.statusCards.map((card, i) => (
        <StatusCard
          key={card.name}
          label={card.label}
          name={card.name}
          status={card.status}
          command={card.command}
          duration={PLACEMENT[i].duration}
          delay={PLACEMENT[i].delay}
          className={PLACEMENT[i].position}
        />
      ))}
    </div>
  );
}

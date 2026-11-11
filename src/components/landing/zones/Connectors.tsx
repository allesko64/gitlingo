import { cn } from "@/lib/utils";
import { Pixels } from "../PixelIcons";

const HEAD_RIGHT = ["#......", "##.....", "###....", "####...", "###....", "##.....", "#......"];
const HEAD_DOWN = ["#######", ".#####.", "..###..", "...#...", ".......", ".......", "......."];

function Label({ text, active }: { text: string; active: boolean }) {
  return (
    <span className={cn("font-mono text-xs leading-none", active ? "text-white" : "text-white/50")}>{text}</span>
  );
}

function DashX({ active, thin }: { active: boolean; thin: boolean }) {
  return (
    <div className={cn("relative flex-1 overflow-hidden", thin ? "h-px" : "h-0.5")}>
      {active ? (
        <div className="absolute inset-y-0 -left-3 right-0 animate-dash-x bg-[repeating-linear-gradient(90deg,var(--color-white)_0_6px,transparent_6px_12px)] motion-reduce:animate-none" />
      ) : (
        <div className="absolute inset-0 bg-white/20" />
      )}
    </div>
  );
}

function DashY({ active, thin }: { active: boolean; thin: boolean }) {
  return (
    <div className={cn("relative flex-1 overflow-hidden", thin ? "w-px" : "w-0.5")}>
      {active ? (
        <div className="absolute inset-x-0 -top-3 bottom-0 animate-dash-y bg-[repeating-linear-gradient(180deg,var(--color-white)_0_6px,transparent_6px_12px)] motion-reduce:animate-none" />
      ) : (
        <div className="absolute inset-0 bg-white/20" />
      )}
    </div>
  );
}

function ArrowX({ active, reverse = false, thin = false }: { active: boolean; reverse?: boolean; thin?: boolean }) {
  return (
    <div className={cn("flex w-full items-center", reverse && "-scale-x-100")}>
      <DashX active={active} thin={thin} />
      <Pixels cells={HEAD_RIGHT} size={7} className={cn("size-2 shrink-0", active ? "text-white" : "text-white/20")} />
    </div>
  );
}

function ArrowY({ active, reverse = false, thin = false }: { active: boolean; reverse?: boolean; thin?: boolean }) {
  return (
    <div className={cn("flex h-10 flex-col items-center", reverse && "-scale-y-100")}>
      <DashY active={active} thin={thin} />
      <Pixels cells={HEAD_DOWN} size={7} className={cn("size-2 shrink-0", active ? "text-white" : "text-white/20")} />
    </div>
  );
}

export function Connector({ label, active }: { label: string; active: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center justify-center py-1 lg:py-0">
      <div className="hidden w-full flex-col items-center gap-2 lg:flex">
        <Label text={label} active={active} />
        <ArrowX active={active} />
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        <ArrowY active={active} />
        <Label text={label} active={active} />
      </div>
    </div>
  );
}

export function SyncConnector({
  pushActive,
  pullActive,
  onlineLabel,
}: {
  pushActive: boolean;
  pullActive: boolean;
  onlineLabel: string;
}) {
  return (
    <div aria-hidden="true" className="flex items-center justify-center">
      <div className="hidden h-full w-full flex-col items-center lg:flex">
        <span className="flex-1 border-l border-dashed border-white/20" />
        <div className="flex w-full flex-col items-center gap-2 py-3">
          <Label text="push" active={pushActive} />
          <ArrowX active={pushActive} />
          <ArrowX active={pullActive} reverse thin />
          <Label text="pull" active={pullActive} />
        </div>
        <span className="flex-1 border-l border-dashed border-white/20" />
      </div>

      <div className="flex w-full flex-col gap-3 py-1 lg:hidden">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <ArrowY active={pushActive} />
            <Label text="push" active={pushActive} />
          </div>
          <div className="flex items-center gap-2">
            <ArrowY active={pullActive} reverse thin />
            <Label text="pull" active={pullActive} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-1 border-t border-dashed border-white/20" />
          <span className="font-pixel text-[10px] tracking-wide text-white/50">{onlineLabel}</span>
          <span className="flex-1 border-t border-dashed border-white/20" />
        </div>
      </div>
    </div>
  );
}

export function Bracket({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <span className="font-pixel text-[10px] leading-none tracking-wide text-white/50">{label}</span>
      <span className="h-2 w-full rounded-t-[4px] border-x border-t border-white/20" />
    </div>
  );
}

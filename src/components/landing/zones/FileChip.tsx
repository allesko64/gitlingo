import type { FileStatus } from "@/lib/landing/fourZonesScript";
import { cn } from "@/lib/utils";
import { FileIcon } from "./ZoneIcons";

type Props = {
  name: string;
  status: FileStatus;
  place?: string;
  as?: "li" | "div";
  hidden?: boolean;
  flyKey?: string;
};

const LOOK: Record<FileStatus, string> = {
  new: "border-dashed border-white/40 text-white/70",
  modified: "border-white/40 text-white",
  staged: "border-white/20 bg-navy text-white",
  saved: "border-white bg-white text-navy",
  updated: "border-white bg-white text-navy animate-chip-pulse motion-reduce:animate-none",
};

const TAG: Record<FileStatus, string> = {
  new: "NEW",
  modified: "MODIFIED",
  staged: "STAGED",
  saved: "SAVED",
  updated: "UPDATED",
};

export function FileChip({ name, status, place, as = "li", hidden = false, flyKey }: Props) {
  const Tag = as;

  return (
    <Tag
      data-fly={flyKey}
      aria-label={place ? `${name}, ${status}, in ${place}` : undefined}
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-2 whitespace-nowrap rounded-[6px] border px-2 py-1 transition-opacity duration-150",
        LOOK[status],
        hidden && "opacity-0",
      )}
    >
      <FileIcon className="size-3 shrink-0" />
      <span aria-hidden="true" className="min-w-0 truncate font-mono text-[13px] leading-none">
        {name}
      </span>
      <span
        key={status}
        aria-hidden="true"
        className="animate-fade-in font-pixel text-[10px] leading-none tracking-wide motion-reduce:animate-none"
      >
        {TAG[status]}
      </span>
    </Tag>
  );
}

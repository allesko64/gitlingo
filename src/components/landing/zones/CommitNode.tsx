import type { Commit } from "@/lib/landing/fourZonesScript";
import { cn } from "@/lib/utils";

type Props = {
  commit: Commit;
  place?: string;
  as?: "li" | "div";
  hidden?: boolean;
  popping?: boolean;
  flyKey?: string;
};

export function CommitNode({ commit, place, as = "li", hidden = false, popping = false, flyKey }: Props) {
  const Tag = as;
  const teammate = commit.author === "teammate";

  return (
    <Tag
      data-fly={flyKey}
      aria-label={
        place
          ? `commit ${commit.hash}, ${commit.message}, by ${teammate ? "a teammate" : "you"}, in ${place}`
          : undefined
      }
      className={cn(
        "flex w-[88px] flex-col items-center gap-1 text-center transition-opacity duration-150",
        hidden && "opacity-0",
        popping && "animate-pop motion-reduce:animate-none",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-3.5 rounded-full", teammate ? "border-2 border-white" : "bg-white")}
      />
      <span aria-hidden="true" className="font-mono text-xs text-white">
        {commit.hash}
      </span>
      <span aria-hidden="true" className="text-xs leading-tight text-white/70">
        {commit.message}
      </span>
      {teammate && (
        <span aria-hidden="true" className="font-pixel text-[10px] leading-none text-white/50">
          teammate
        </span>
      )}
    </Tag>
  );
}

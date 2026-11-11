import type { CSSProperties, ReactNode } from "react";
import type { ZoneName } from "@/lib/landing/fourZonesScript";
import { cn } from "@/lib/utils";

export const ZONE_TINT: Record<ZoneName, string> = {
  working: "var(--color-sand)",
  staging: "var(--color-mint)",
  local: "var(--color-periwinkle)",
  remote: "var(--color-lavender)",
};

type Props = {
  zone: ZoneName;
  icon: ReactNode;
  title: string;
  shortTitle?: string;
  description: string;
  highlighted?: boolean;
  compact?: boolean;
  children: ReactNode;
  className?: string;
};

export function ZoneCard({
  zone,
  icon,
  title,
  shortTitle,
  description,
  highlighted = false,
  compact = false,
  children,
  className,
}: Props) {
  const tipId = `zone-tip-${zone}`;

  return (
    <div
      role="group"
      aria-label={title}
      style={{ "--zone": ZONE_TINT[zone] } as CSSProperties}
      className={cn(
        "zone-surface relative flex min-w-0 flex-col rounded-card border border-white/10",
        compact ? "min-h-0 gap-2 p-4" : "min-h-32 gap-3 p-6",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-4 top-0 h-0.5 rounded-b-[2px] opacity-50"
        style={{ background: "var(--zone)" }}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-px rounded-card border border-white/40 shadow-[0_0_28px_rgba(255,255,255,0.10)] transition-opacity duration-300",
          highlighted ? "opacity-100" : "opacity-0",
        )}
      />

      {compact ? (
        <div className="group relative flex items-center gap-2">
          <span className="shrink-0" style={{ color: "var(--zone)" }}>
            {icon}
          </span>
          <h3 className="min-w-0 flex-1 truncate text-sm font-medium leading-tight text-white">
            {shortTitle ?? title}
            {shortTitle !== undefined && <span className="sr-only">{` (${title})`}</span>}
          </h3>
          <button
            type="button"
            aria-label={`About ${title}`}
            aria-describedby={tipId}
            className="grid size-6 shrink-0 place-items-center rounded-[6px] font-mono text-xs text-white/50 transition-colors hover:text-white"
          >
            i
          </button>
          <span
            id={tipId}
            role="tooltip"
            className="pointer-events-none absolute top-full right-0 z-30 mt-2 w-56 rounded-[8px] border border-white/10 bg-navy-lift px-3 py-2 text-xs leading-snug text-white/80 opacity-0 shadow-[0_8px_24px_rgba(5,10,30,0.4)] transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
          >
            {description}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 lg:flex-col lg:items-start">
          <span className="shrink-0" style={{ color: "var(--zone)" }}>
            {icon}
          </span>
          <div>
            <h3 className="text-base font-medium leading-tight text-white">{title}</h3>
            <p className="mt-1 text-sm text-white/70">{description}</p>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 break-words">{children}</div>
    </div>
  );
}

import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function TerminalChrome({ title, children, className = "" }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-card border border-white/10 bg-navy/80 shadow-[0_24px_60px_-12px_var(--color-navy)] backdrop-blur focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pink ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <p className="flex-1 pr-12 text-center font-mono text-xs text-white/50">{title}</p>
      </div>
      {children}
    </div>
  );
}

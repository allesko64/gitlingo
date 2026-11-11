import { copy } from "@/lib/landing/copy";
import { TerminalChrome } from "../terminal/TerminalChrome";
import { ZoneStrip } from "../terminal/ZoneStrip";

export const HERO_OUTPUT_HEIGHT = "h-44 sm:h-52";

export function HeroTerminalSkeleton() {
  return (
    <div>
      <TerminalChrome title={copy.terminal.title}>
        <div className="font-mono text-[13px] sm:text-sm">
          <div className={`${HERO_OUTPUT_HEIGHT} overflow-hidden px-4 pt-3 leading-relaxed`}>
            <p className="whitespace-pre-wrap text-white/80">{copy.terminal.welcome}</p>
          </div>
          <div className="flex h-11 items-center gap-2 px-4 text-base sm:text-sm">
            <span aria-hidden="true" className="text-white">
              $
            </span>
          </div>
        </div>
        <ZoneStrip zone="working" fileName={copy.terminal.fileName} />
      </TerminalChrome>
      <div className="mt-3 h-6" />
    </div>
  );
}

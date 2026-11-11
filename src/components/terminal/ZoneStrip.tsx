import { copy } from "@/lib/landing/copy";
import { ZONE_ORDER, type Zone } from "./zones";

type Props = {
  zone: Zone;
  fileName: string;
};

export function ZoneStrip({ zone, fileName }: Props) {
  const index = ZONE_ORDER.indexOf(zone);

  return (
    <div className="border-t border-white/10 px-2.5 pt-2.5 pb-3">
      <div className="relative grid grid-cols-4">
        {ZONE_ORDER.map((name) => (
          <div key={name} className="px-0.5">
            <div
              className={`flex h-14 justify-center rounded-md border pt-1.5 transition-colors duration-500 ${
                name === "remote" ? "border-dashed border-white/10" : "border-white/10"
              } ${name === zone ? "bg-white/5" : ""}`}
            >
              <span className="text-[11px] leading-none text-white/70">{copy.zones[name]}</span>
            </div>
          </div>
        ))}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-0 flex w-1/4 justify-center transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(${index * 100}%)` }}
        >
          <span className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] leading-tight text-white">
            {fileName}
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`${fileName} is in ${copy.zones[zone]}`}
      </p>
    </div>
  );
}

import { Fragment } from "react";

export function Instruction({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/);

  return (
    <>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={i}
            className="rounded-[4px] border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[0.9em] text-white"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

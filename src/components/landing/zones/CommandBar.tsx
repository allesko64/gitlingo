type Props = {
  typed: string;
  comment?: string;
};

export function CommandBar({ typed, comment }: Props) {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-12 items-center overflow-hidden rounded-ui border border-white/10 bg-white/5 px-4 font-mono text-sm"
    >
      {comment !== undefined ? (
        <span className="truncate text-white/50"># {comment}</span>
      ) : (
        <>
          <span className="text-white/70">$&nbsp;</span>
          <span className="truncate whitespace-pre text-white">{typed}</span>
          <span className="ml-0.5 inline-block h-4 w-2 shrink-0 animate-blink bg-white motion-reduce:animate-none" />
        </>
      )}
    </div>
  );
}

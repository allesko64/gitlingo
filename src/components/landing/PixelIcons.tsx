type IconProps = { className?: string };

export function Pixels({ cells, size, className }: { cells: string[]; size: number; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {cells.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null,
        ),
      )}
    </svg>
  );
}

const BRANCH = [
  "........",
  ".##..##.",
  ".##..##.",
  "..#..#..",
  "..#.#...",
  "..##....",
  ".##.....",
  ".##.....",
];

const PADLOCK = [
  "..###...",
  ".#...#..",
  ".#...#..",
  "#######.",
  "###.###.",
  "###.###.",
  "#######.",
  "........",
];

const ARROW_DOWN = [
  "...##...",
  "...##...",
  "...##...",
  "...##...",
  "#..##..#",
  ".#.##.#.",
  "..####..",
  "...##...",
];

const CHECK = [
  "........",
  ".......#",
  "......##",
  "#....##.",
  "##..##..",
  ".####...",
  "..##....",
  "........",
];

export function CheckIcon({ className }: IconProps) {
  return <Pixels cells={CHECK} size={8} className={className} />;
}

export function ArrowDownIcon({ className }: IconProps) {
  return <Pixels cells={ARROW_DOWN} size={8} className={className} />;
}

export function BranchIcon({ className }: IconProps) {
  return <Pixels cells={BRANCH} size={8} className={className} />;
}

export function PadlockIcon({ className }: IconProps) {
  return <Pixels cells={PADLOCK} size={8} className={className} />;
}

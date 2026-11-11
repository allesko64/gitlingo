import { ancestors } from "@/engine/git/helpers";
import type { Repo } from "@/engine/types";
import {
  DISPLAY_AUTHOR,
  HEAD_SEG_WIDTH,
  PILL_DIVIDER,
  REF_PILL_GAP,
  STEM_LENGTH,
  UNBORN_WIDTH,
  refPillWidth,
  resolveLayout,
  type GraphLayout,
} from "./layoutConstants";

export type GNode = {
  hash: string;
  short: string;
  message: string;
  author: string;
  parents: string[];
  gen: number;
  lane: number;
  x: number;
  y: number;
  isHead: boolean;
  isLatest: boolean;
};

export type GEdge = {
  id: string;
  from: string;
  to: string;
  lane: number;
  kind: "straight" | "curve";
  isMerge: boolean;
  path: string;
};

export type GLabel = {
  name: string;
  tip: string | null;
  lane: number;
  isCurrent: boolean;
  color: string;
  /** Left edge of the joined ref pill. */
  x: number;
  y: number;
  width: number;
  /** Left edge of the branch-name segment (after HEAD when current). */
  branchX: number;
  stem: string | null;
};

export type GraphModel = {
  initialized: boolean;
  nodes: GNode[];
  edges: GEdge[];
  labels: GLabel[];
  laneCount: number;
  headTip: string | null;
  head: { x: number; y: number } | null;
  width: number;
  height: number;
  summary: string;
  layout: GraphLayout;
};

/** @deprecated Prefer importing from layoutConstants — kept for existing imports. */
export { GRAPH } from "./layoutConstants";

const LANE_COLORS = ["#ffffff", "#7c93ff", "#6fe0c2", "#f2c98a", "#b79cff"];

export function laneColor(lane: number): string {
  return lane === 0 ? LANE_COLORS[0] : LANE_COLORS[((lane - 1) % 4) + 1];
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function branchOrder(repo: Repo): string[] {
  const names = Object.keys(repo.branches);
  const main = names.includes("main") ? "main" : names[0];
  return main === undefined ? [] : [main, ...names.filter((name) => name !== main)];
}

function summarize(repo: Repo, main: string | undefined): string {
  if (!repo.initialized) {
    return "Commit graph. No repository yet.";
  }
  if (main === undefined) {
    return `Commit graph. No commits yet. HEAD is on ${repo.head}.`;
  }
  const onMain = new Set(ancestors(repo, repo.branches[main]));
  const parts = [`Commit graph. ${plural(onMain.size, "commit")} on ${main}.`];
  for (const name of Object.keys(repo.branches)) {
    if (name === main) continue;
    const ahead = ancestors(repo, repo.branches[name]).filter((hash) => !onMain.has(hash)).length;
    if (ahead > 0) {
      parts.push(`Branch ${name} is ${plural(ahead, "commit")} ahead.`);
    }
  }
  parts.push(`HEAD is on ${repo.head}.`);
  return parts.join(" ");
}

export type BuildGraphOptions = {
  panelWidth?: number;
  viewportWidth?: number;
};

export function buildGraph(repo: Repo, options: BuildGraphOptions = {}): GraphModel {
  const panelWidth = options.panelWidth ?? 1280;
  const viewportWidth = options.viewportWidth ?? panelWidth;
  const order = branchOrder(repo);

  if (!repo.initialized) {
    const layout = resolveLayout(panelWidth, 0, viewportWidth);
    return {
      initialized: false,
      nodes: [],
      edges: [],
      labels: [],
      laneCount: 1,
      headTip: null,
      head: null,
      width: UNBORN_WIDTH,
      height: layout.padY * 2 + layout.textBelow,
      summary: summarize(repo, undefined),
      layout,
    };
  }

  const commits = Object.values(repo.commits).sort((a, b) => a.order - b.order);

  if (commits.length === 0) {
    const layout = resolveLayout(panelWidth, 0, viewportWidth);
    const pillX = layout.padX + layout.nodeRadius + REF_PILL_GAP;
    const width = refPillWidth(repo.head, true);
    const label: GLabel = {
      name: repo.head,
      tip: null,
      lane: 0,
      isCurrent: true,
      color: laneColor(0),
      x: pillX,
      y: layout.padY,
      width,
      branchX: pillX + HEAD_SEG_WIDTH + PILL_DIVIDER,
      stem: null,
    };
    return {
      initialized: true,
      nodes: [],
      edges: [],
      labels: [label],
      laneCount: 1,
      headTip: null,
      head: { x: pillX, y: layout.padY },
      width: UNBORN_WIDTH,
      height: layout.padY * 2 + layout.textBelow,
      summary: summarize(repo, undefined),
      layout,
    };
  }

  const gen = new Map<string, number>();
  for (const commit of commits) {
    gen.set(commit.hash, commit.parents.length === 0 ? 0 : Math.max(...commit.parents.map((p) => gen.get(p) ?? 0)) + 1);
  }

  const maxGen = Math.max(0, ...gen.values());
  const layout = resolveLayout(panelWidth, maxGen, viewportWidth);

  const lane = new Map<string, number>();
  let nextLane = 0;
  const claim = (start: string | undefined): number | null => {
    let hash = start;
    let own: number | null = null;
    while (hash !== undefined && !lane.has(hash)) {
      if (own === null) own = nextLane++;
      lane.set(hash, own);
      hash = repo.commits[hash].parents[0];
    }
    return own;
  };
  // A branch whose tip already sits on another branch's lane gets a lane of
  // its own, so the two branches never share one line.
  const labelLane = new Map<string, number>();
  const stemmed = new Set<string>();
  for (const name of order) {
    const own = claim(repo.branches[name]);
    if (own === null) {
      stemmed.add(name);
      labelLane.set(name, nextLane++);
    } else {
      labelLane.set(name, own);
    }
  }
  for (const commit of [...commits].reverse()) claim(commit.hash);

  const headTip = repo.branches[repo.head] ?? null;
  const latest = commits[commits.length - 1].hash;
  const pos = (hash: string) => ({
    x: layout.padX + (gen.get(hash) ?? 0) * layout.xStep,
    y: layout.padY + (lane.get(hash) ?? 0) * layout.laneStep,
  });

  const nodes: GNode[] = commits.map((commit) => ({
    hash: commit.hash,
    short: commit.hash.slice(0, 7),
    message: commit.message,
    author: DISPLAY_AUTHOR,
    parents: commit.parents,
    gen: gen.get(commit.hash) ?? 0,
    lane: lane.get(commit.hash) ?? 0,
    ...pos(commit.hash),
    isHead: commit.hash === headTip,
    isLatest: commit.hash === latest,
  }));

  const edges: GEdge[] = commits.flatMap((commit) =>
    commit.parents.map((parent, i) => {
      const a = pos(parent);
      const b = pos(commit.hash);
      const fromLane = lane.get(parent) ?? 0;
      const toLane = lane.get(commit.hash) ?? 0;
      const straight = fromLane === toLane;
      return {
        id: `${parent}>${commit.hash}`,
        from: parent,
        to: commit.hash,
        lane: i === 1 ? fromLane : toLane,
        kind: straight ? "straight" : "curve",
        isMerge: i === 1,
        path: straight
          ? `M ${a.x} ${a.y} L ${b.x} ${b.y}`
          : `M ${a.x} ${a.y} C ${a.x + 24} ${a.y}, ${b.x - 24} ${b.y}, ${b.x} ${b.y}`,
      } satisfies GEdge;
    }),
  );

  const labels: GLabel[] = [];
  let head: GraphModel["head"] = null;
  for (const name of order) {
    const tip = repo.branches[name];
    const { x: tipX, y: tipY } = pos(tip);
    const labelLaneIndex = labelLane.get(name) ?? 0;
    const y = layout.padY + labelLaneIndex * layout.laneStep;
    const isStemmed = stemmed.has(name);
    const isCurrent = name === repo.head;
    const width = refPillWidth(name, isCurrent);

    let pillX: number;
    let stem: string | null = null;
    if (isStemmed) {
      const stemEnd = tipX + STEM_LENGTH;
      pillX = stemEnd;
      stem = `M ${tipX} ${tipY} C ${tipX + 16} ${tipY}, ${tipX + 10} ${y}, ${stemEnd - 2} ${y}`;
    } else {
      pillX = tipX + layout.nodeRadius + REF_PILL_GAP;
    }

    const branchX = isCurrent ? pillX + HEAD_SEG_WIDTH + PILL_DIVIDER : pillX;
    if (isCurrent) {
      head = { x: pillX, y };
    }

    labels.push({
      name,
      tip,
      lane: labelLaneIndex,
      isCurrent,
      color: laneColor(labelLaneIndex),
      x: pillX,
      y,
      width,
      branchX,
      stem,
    });
  }

  const rightmost = Math.max(
    ...nodes.map((node) => node.x + (node.isLatest ? 80 : 30)),
    ...labels.map((label) => label.x + label.width),
  );

  return {
    initialized: true,
    nodes,
    edges,
    labels,
    laneCount: Math.max(1, nextLane),
    headTip,
    head,
    width: Math.max(rightmost + layout.rightSpace, 320),
    height: layout.padY + (Math.max(1, nextLane) - 1) * layout.laneStep + layout.textBelow + 8,
    summary: summarize(repo, order[0]),
    layout,
  };
}

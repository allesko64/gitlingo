import type { GraphModel } from "./buildGraph";

export type GraphDiff = {
  addedNodes: string[];
  addedEdges: string[];
  addedLabels: string[];
  movedLabels: string[];
  headMoved: boolean;
  empty: boolean;
};

export function diffGraph(prev: GraphModel, next: GraphModel): GraphDiff {
  const oldNodes = new Set(prev.nodes.map((node) => node.hash));
  const oldEdges = new Set(prev.edges.map((edge) => edge.id));
  const oldTips = new Map(prev.labels.map((label) => [label.name, label.tip]));

  const addedNodes = next.nodes.filter((node) => !oldNodes.has(node.hash)).map((node) => node.hash);
  const addedEdges = next.edges.filter((edge) => !oldEdges.has(edge.id)).map((edge) => edge.id);
  const addedLabels = next.labels.filter((label) => !oldTips.has(label.name)).map((label) => label.name);
  const movedLabels = next.labels
    .filter((label) => oldTips.has(label.name) && oldTips.get(label.name) !== label.tip)
    .map((label) => label.name);

  const prevCurrent = prev.labels.find((label) => label.isCurrent)?.name ?? null;
  const nextCurrent = next.labels.find((label) => label.isCurrent)?.name ?? null;
  const headMoved = prevCurrent !== nextCurrent || prev.headTip !== next.headTip;

  return {
    addedNodes,
    addedEdges,
    addedLabels,
    movedLabels,
    headMoved,
    empty:
      addedNodes.length === 0 &&
      addedEdges.length === 0 &&
      addedLabels.length === 0 &&
      movedLabels.length === 0 &&
      !headMoved,
  };
}

import { describe, expect, it } from "vitest";
import { execute } from "@/engine/execute";
import { runAll } from "@/engine/test-utils";
import type { Repo } from "@/engine/types";
import { buildGraph, laneColor } from "./buildGraph";
import { diffGraph } from "./diffGraph";
import { GRAPH, HEAD_SEG_WIDTH, PILL_DIVIDER } from "./layoutConstants";

const commit = (n: number) => [`echo ${n} > f${n}.txt`, `git add f${n}.txt`, `git commit -m "c${n}"`];
const LINEAR = ["git init", ...commit(1), ...commit(2), ...commit(3)];
const BRANCHED = [
  "git init",
  ...commit(1),
  "git branch feature",
  "git switch feature",
  ...commit(2),
  "git switch main",
  ...commit(3),
];

function then(repo: Repo, commands: string[]): Repo {
  let next = repo;
  for (const command of commands) next = execute(next, command).repo;
  return next;
}

const byMessage = (repo: Repo) => {
  const model = buildGraph(repo);
  return (message: string) => model.nodes.find((node) => node.message === message)!;
};

describe("buildGraph", () => {
  it("puts a linear history on lane 0 with increasing x", () => {
    const model = buildGraph(runAll(LINEAR).repo);

    expect(model.nodes.map((n) => n.lane)).toEqual([0, 0, 0]);
    expect(model.nodes.map((n) => n.x)).toEqual([
      GRAPH.padX,
      GRAPH.padX + GRAPH.xStep,
      GRAPH.padX + GRAPH.xStep * 2,
    ]);
    expect(model.edges.every((edge) => edge.kind === "straight")).toBe(true);
  });

  it("gives a diverging branch lane 1 and curves its first commit from the right parent", () => {
    const repo = runAll(BRANCHED).repo;
    const model = buildGraph(repo);
    const node = byMessage(repo);

    expect(node("c1").lane).toBe(0);
    expect(node("c2").lane).toBe(1);
    expect(node("c3").lane).toBe(0);
    const edge = model.edges.find((e) => e.to === node("c2").hash)!;
    expect(edge.from).toBe(node("c1").hash);
    expect(edge.kind).toBe("curve");
    expect(model.laneCount).toBe(2);
  });

  it("gives a merge commit two incoming edges and a later generation", () => {
    const repo = then(runAll(BRANCHED).repo, ["git merge feature"]);
    const model = buildGraph(repo);
    const merge = model.nodes.find((n) => n.parents.length === 2)!;
    const incoming = model.edges.filter((e) => e.to === merge.hash);

    expect(incoming).toHaveLength(2);
    expect(incoming.filter((e) => e.isMerge)).toHaveLength(1);
    const parentGens = merge.parents.map((p) => model.nodes.find((n) => n.hash === p)!.gen);
    expect(merge.gen).toBeGreaterThan(Math.max(...parentGens));
    expect(incoming.find((e) => e.isMerge)!.lane).toBe(1);
  });

  it("points labels at the right tip and follows HEAD", () => {
    const repo = runAll(BRANCHED).repo;
    const node = byMessage(repo);
    const onMain = buildGraph(repo).labels;

    expect(onMain.find((l) => l.name === "main")).toMatchObject({ tip: node("c3").hash, isCurrent: true, lane: 0 });
    expect(onMain.find((l) => l.name === "feature")).toMatchObject({ tip: node("c2").hash, isCurrent: false, lane: 1, color: laneColor(1) });

    const switched = buildGraph(then(repo, ["git switch feature"])).labels;
    expect(switched.find((l) => l.name === "feature")!.isCurrent).toBe(true);
    expect(switched.find((l) => l.name === "main")!.isCurrent).toBe(false);
  });

  it("puts a branch that shares a tip on its own lane and joins HEAD into the current ref pill", () => {
    const repo = runAll(["git init", ...commit(1), "git branch feature"]).repo;
    const onMain = buildGraph(repo);
    const [main, feature] = onMain.labels;

    expect([main.name, feature.name]).toEqual(["main", "feature"]);
    expect(main).toMatchObject({ lane: 0, stem: null });
    expect(feature.lane).toBe(1);
    expect(feature.stem).not.toBeNull();
    expect(feature.y).toBeGreaterThan(main.y);
    expect(feature.tip).toBe(main.tip);
    expect(onMain.laneCount).toBe(2);
    expect(onMain.head!.x).toBe(main.x);
    expect(onMain.head!.y).toBe(main.y);
    expect(main.branchX).toBe(main.x + HEAD_SEG_WIDTH + PILL_DIVIDER);

    const onFeature = buildGraph(then(repo, ["git switch feature"]));
    const feature2 = onFeature.labels.find((l) => l.name === "feature")!;
    expect(onFeature.head!.y).toBe(feature2.y);
    expect(onFeature.head!.x).toBe(feature2.x);
  });

  it("returns one main label and no nodes when there are no commits yet", () => {
    const model = buildGraph(runAll(["git init"]).repo);

    expect(model.nodes).toEqual([]);
    expect(model.labels).toHaveLength(1);
    expect(model.labels[0]).toMatchObject({ name: "main", tip: null, isCurrent: true });
  });

  it("knows when there is no repository yet", () => {
    expect(buildGraph(runAll([]).repo).initialized).toBe(false);
  });

  it("describes the graph for screen readers", () => {
    const repo = then(runAll(BRANCHED).repo, ["git switch feature"]);

    expect(buildGraph(repo).summary).toBe(
      "Commit graph. 2 commits on main. Branch feature is 1 commit ahead. HEAD is on feature.",
    );
  });

  it("colors lanes white, periwinkle, mint, sand, lavender, then repeats", () => {
    expect([0, 1, 2, 3, 4, 5].map(laneColor)).toEqual([
      "#ffffff",
      "#7c93ff",
      "#6fe0c2",
      "#f2c98a",
      "#b79cff",
      "#7c93ff",
    ]);
  });
});

describe("diffGraph", () => {
  const step = (before: string[], after: string[]) => {
    const a = runAll(before).repo;
    return diffGraph(buildGraph(a), buildGraph(then(a, after)));
  };

  it("finds a new commit, its edge and the moved label", () => {
    const diff = step(["git init", ...commit(1)], commit(2));

    expect(diff.addedNodes).toHaveLength(1);
    expect(diff.addedEdges).toHaveLength(1);
    expect(diff.movedLabels).toEqual(["main"]);
    expect(diff.headMoved).toBe(true);
  });

  it("finds a new branch label", () => {
    const diff = step(["git init", ...commit(1)], ["git branch feature"]);

    expect(diff).toMatchObject({ addedNodes: [], addedEdges: [], addedLabels: ["feature"], movedLabels: [], headMoved: false });
  });

  it("finds a switch as a HEAD move only", () => {
    const diff = step(["git init", ...commit(1), "git branch feature"], ["git switch feature"]);

    expect(diff).toMatchObject({ addedNodes: [], addedEdges: [], addedLabels: [], movedLabels: [], headMoved: true });
  });

  it("finds a merge as one node, two edges and a moved label", () => {
    const diff = step(BRANCHED, ["git merge feature"]);

    expect(diff.addedNodes).toHaveLength(1);
    expect(diff.addedEdges).toHaveLength(2);
    expect(diff.movedLabels).toEqual(["main"]);
  });

  it("is empty for identical states", () => {
    const repo = runAll(BRANCHED).repo;
    expect(diffGraph(buildGraph(repo), buildGraph(repo)).empty).toBe(true);
    expect(diffGraph(buildGraph(repo), buildGraph(then(repo, ["git status", "git log"]))).empty).toBe(true);
  });
});

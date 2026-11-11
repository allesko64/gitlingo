import type { CommandResult, FilePath, FileTree, Repo } from "../types";
import { allPaths, ancestors, fileIn, moveFiles, makeCommit } from "./helpers";
import { findBlockers } from "./switch";

function threeWayMerge(
  base: FileTree,
  ours: FileTree,
  theirs: FileTree,
): { tree: FileTree; conflicts: FilePath[] } {
  const tree: FileTree = {};
  const conflicts: FilePath[] = [];

  for (const path of allPaths(base, ours, theirs)) {
    const b = fileIn(base, path);
    const o = fileIn(ours, path);
    const t = fileIn(theirs, path);

    let result: string | undefined;
    if (o === t || t === b) {
      result = o;
    } else if (o === b) {
      result = t;
    } else {
      conflicts.push(path);
      continue;
    }

    if (result !== undefined) {
      tree[path] = result;
    }
  }

  return { tree, conflicts };
}

function countChanged(before: FileTree, after: FileTree): string {
  const count = allPaths(before, after).filter(
    (path) => fileIn(before, path) !== fileIn(after, path),
  ).length;
  return count === 1 ? "1 file changed" : `${count} files changed`;
}

export function merge(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) {
    return { repo, output: "fatal: no branch specified (try: git merge <branch>)" };
  }
  if (args[0].startsWith("-")) {
    return { repo, output: `git merge: option '${args[0]}' is not supported yet` };
  }
  if (args.length > 1) {
    return { repo, output: "git merge: only one branch at a time" };
  }

  const name = args[0];
  if (!Object.hasOwn(repo.branches, name)) {
    return { repo, output: `merge: ${name} - not something we can merge` };
  }

  const ours = repo.branches[repo.head];
  const theirs = repo.branches[name];
  const ourHistory = ancestors(repo, ours);

  if (ourHistory.includes(theirs)) {
    return { repo, output: "Already up to date." };
  }

  const theirHistory = ancestors(repo, theirs);
  const ourTree = repo.commits[ours].tree;
  const theirTree = repo.commits[theirs].tree;

  if (theirHistory.includes(ours)) {
    const blocked = findBlockers(repo, theirTree, "merge");
    if (blocked !== null) {
      return { repo, output: blocked };
    }

    return {
      repo: {
        ...repo,
        ...moveFiles(repo, ourTree, theirTree),
        branches: { ...repo.branches, [repo.head]: theirs },
      },
      output: `Updating ${ours}..${theirs}\nFast-forward\n ${countChanged(ourTree, theirTree)}`,
    };
  }

  const base = theirHistory.find((hash) => ourHistory.includes(hash));
  const baseTree = base === undefined ? {} : repo.commits[base].tree;
  const { tree, conflicts } = threeWayMerge(baseTree, ourTree, theirTree);

  if (conflicts.length > 0) {
    return {
      repo,
      output: [
        ...conflicts.map((path) => `CONFLICT: both branches changed ${path} in different ways`),
        "Resolving merge conflicts is coming soon to Git Lingo.",
        "The merge was cancelled and nothing was changed.",
      ].join("\n"),
    };
  }

  const blocked = findBlockers(repo, tree, "merge");
  if (blocked !== null) {
    return { repo, output: blocked };
  }

  const mergeCommit = makeCommit(repo, `Merge branch '${name}'`, [ours, theirs], tree);

  return {
    repo: {
      ...repo,
      ...moveFiles(repo, ourTree, tree),
      commits: { ...repo.commits, [mergeCommit.hash]: mergeCommit },
      branches: { ...repo.branches, [repo.head]: mergeCommit.hash },
    },
    output: `Merge made by the 'ort' strategy.\n ${countChanged(ourTree, tree)}`,
  };
}

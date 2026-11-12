import { makeHash } from "../hash";
import type { Commit, CommitHash, FilePath, FileTree, Repo } from "../types";

export function isUnborn(repo: Repo): boolean {
  return !Object.hasOwn(repo.branches, repo.head);
}

export function headTree(repo: Repo): FileTree {
  if (isUnborn(repo)) {
    return {};
  }

  return repo.commits[repo.branches[repo.head]].tree;
}

export function fileIn(tree: FileTree, path: FilePath): string | undefined {
  return Object.hasOwn(tree, path) ? tree[path] : undefined;
}

export function allPaths(...trees: FileTree[]): FilePath[] {
  return [...new Set(trees.flatMap((tree) => Object.keys(tree)))].sort();
}

export function ancestors(repo: Repo, start: CommitHash): CommitHash[] {
  const found: CommitHash[] = [start];

  for (let i = 0; i < found.length; i++) {
    for (const parent of repo.commits[found[i]].parents) {
      if (!found.includes(parent)) {
        found.push(parent);
      }
    }
  }

  return found;
}

export function resolveRef(repo: Repo, ref: string): CommitHash | null {
  const headMatch = /^HEAD(?:~(\d+))?$/.exec(ref);

  if (headMatch !== null) {
    if (isUnborn(repo)) {
      return null;
    }

    let hash = repo.branches[repo.head];
    for (let steps = Number(headMatch[1] ?? 0); steps > 0; steps--) {
      const parent = repo.commits[hash].parents[0];
      if (parent === undefined) {
        return null;
      }
      hash = parent;
    }
    return hash;
  }

  if (Object.hasOwn(repo.branches, ref)) {
    return repo.branches[ref];
  }
  if (Object.hasOwn(repo.remoteRefs, ref)) {
    return repo.remoteRefs[ref];
  }
  if (Object.hasOwn(repo.commits, ref)) {
    return ref;
  }

  return null;
}

export function makeCommit(
  repo: Repo,
  message: string,
  parents: CommitHash[],
  tree: FileTree,
): Commit {
  const order = Object.keys(repo.commits).length + 1;
  const hash = makeHash(JSON.stringify({ order, message, parents, tree }));
  return { hash, order, message, parents, tree };
}

export function moveFiles(
  repo: Repo,
  from: FileTree,
  to: FileTree,
): Pick<Repo, "workingDir" | "index"> {
  const workingDir = { ...repo.workingDir };
  const index = { ...repo.index };

  for (const path of allPaths(from, to)) {
    const target = fileIn(to, path);
    if (fileIn(from, path) === target) {
      continue;
    }

    if (target === undefined) {
      delete workingDir[path];
      delete index[path];
    } else {
      workingDir[path] = target;
      index[path] = target;
    }
  }

  return { workingDir, index };
}

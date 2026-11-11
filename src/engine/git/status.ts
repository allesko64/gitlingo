import type { CommandResult, FilePath, FileTree, Repo } from "../types";
import { allPaths, headTree, isUnborn } from "./helpers";

export type ChangeKind = "new file" | "modified" | "deleted";

export interface FileChange {
  path: FilePath;
  kind: ChangeKind;
}

export interface RepoStatus {
  staged: FileChange[];
  unstaged: FileChange[];
  untracked: FilePath[];
}

function diffTrees(before: FileTree, after: FileTree): FileChange[] {
  const changes: FileChange[] = [];

  for (const path of allPaths(before, after)) {
    const wasThere = Object.hasOwn(before, path);
    const isThere = Object.hasOwn(after, path);

    if (!wasThere) {
      changes.push({ path, kind: "new file" });
    } else if (!isThere) {
      changes.push({ path, kind: "deleted" });
    } else if (before[path] !== after[path]) {
      changes.push({ path, kind: "modified" });
    }
  }

  return changes;
}

export function computeStatus(repo: Repo): RepoStatus {
  const workingChanges = diffTrees(repo.index, repo.workingDir);

  return {
    staged: diffTrees(headTree(repo), repo.index),
    unstaged: workingChanges.filter((change) => change.kind !== "new file"),
    untracked: workingChanges
      .filter((change) => change.kind === "new file")
      .map((change) => change.path),
  };
}

function formatChange(change: FileChange): string {
  return `  ${`${change.kind}:`.padEnd(12)}${change.path}`;
}

function summary(repo: Repo, { staged, unstaged, untracked }: RepoStatus): string | null {
  if (staged.length > 0) {
    return null;
  }
  if (unstaged.length > 0) {
    return 'no changes added to commit (use "git add" to stage changes)';
  }
  if (untracked.length > 0) {
    return 'nothing added to commit but untracked files present (use "git add" to track)';
  }
  if (isUnborn(repo)) {
    return 'nothing to commit (create/copy files and use "git add" to track)';
  }
  return "nothing to commit, working tree clean";
}

export function status(repo: Repo, args: string[]): CommandResult {
  if (args.length > 0) {
    return { repo, output: "git status: options are not supported yet" };
  }

  const result = computeStatus(repo);
  const lines = [`On branch ${repo.head}`];

  if (isUnborn(repo)) {
    lines.push("", "No commits yet");
  }
  if (result.staged.length > 0) {
    lines.push("", "Changes to be committed:", ...result.staged.map(formatChange));
  }
  if (result.unstaged.length > 0) {
    lines.push("", "Changes not staged for commit:", ...result.unstaged.map(formatChange));
  }
  if (result.untracked.length > 0) {
    lines.push("", "Untracked files:", ...result.untracked.map((path) => `  ${path}`));
  }

  const closing = summary(repo, result);
  if (closing !== null) {
    lines.push("", closing);
  }

  return { repo, output: lines.join("\n") };
}

import type { CommandResult, FilePath, FileTree, Repo } from "../types";
import { allPaths, ancestors, headTree, isUnborn } from "./helpers";

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

export function trackingInfo(repo: Repo): { tracking: string; ahead: number; behind: number } | null {
  const tracking = repo.upstream[repo.head];
  if (tracking === undefined || isUnborn(repo) || !Object.hasOwn(repo.remoteRefs, tracking)) {
    return null;
  }

  const local = ancestors(repo, repo.branches[repo.head]);
  const remote = ancestors(repo, repo.remoteRefs[tracking]);

  return {
    tracking,
    ahead: local.filter((hash) => !remote.includes(hash)).length,
    behind: remote.filter((hash) => !local.includes(hash)).length,
  };
}

function trackingLine(repo: Repo): string | null {
  const info = trackingInfo(repo);
  if (info === null) {
    return null;
  }

  const { tracking, ahead, behind } = info;
  const plural = (n: number) => (n === 1 ? "1 commit" : `${n} commits`);

  if (ahead === 0 && behind === 0) {
    return `Your branch is up to date with '${tracking}'.`;
  }
  if (behind === 0) {
    return `Your branch is ahead of '${tracking}' by ${plural(ahead)}.\n  (use "git push" to publish your local commits)`;
  }
  if (ahead === 0) {
    return `Your branch is behind '${tracking}' by ${plural(behind)}, and can be fast-forwarded.\n  (use "git pull" to update your local branch)`;
  }
  return `Your branch and '${tracking}' have diverged,\nand have ${ahead} and ${behind} different commits each, respectively.\n  (use "git pull" to merge the remote branch into yours)`;
}

export function status(repo: Repo, args: string[]): CommandResult {
  if (args.length > 0) {
    return { repo, output: "git status: options are not supported yet" };
  }

  const result = computeStatus(repo);
  const lines = [`On branch ${repo.head}`];

  const tracking = trackingLine(repo);
  if (tracking !== null) {
    lines.push(tracking);
  }

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

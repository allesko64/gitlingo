import { ancestors, isUnborn } from "@/engine/git/helpers";
import { history } from "@/engine/git/log";
import { computeStatus, trackingInfo } from "@/engine/git/status";
import { tokenize } from "@/engine/parse";
import type { FilePath, Repo } from "@/engine/types";
import type { StepContext } from "./types";

export function ran(ctx: StepContext, command: string): boolean {
  const typed = tokenize(ctx.input);
  return tokenize(command).every((word, i) => typed[i] === word);
}

export function hasFile(repo: Repo, path: FilePath): boolean {
  return Object.hasOwn(repo.workingDir, path);
}

export function fileContent(repo: Repo, path: FilePath): string | undefined {
  return hasFile(repo, path) ? repo.workingDir[path] : undefined;
}

export function isStaged(repo: Repo, path: FilePath): boolean {
  return computeStatus(repo).staged.some((change) => change.path === path);
}

export function isChanged(repo: Repo, path: FilePath): boolean {
  const { staged, unstaged } = computeStatus(repo);
  return [...staged, ...unstaged].some((change) => change.path === path);
}

export function isClean(repo: Repo): boolean {
  const { staged, unstaged } = computeStatus(repo);
  return staged.length === 0 && unstaged.length === 0;
}

export function commitCount(repo: Repo): number {
  return history(repo).length;
}

export function headMessage(repo: Repo): string | undefined {
  return isUnborn(repo) ? undefined : repo.commits[repo.branches[repo.head]].message;
}

export function stashCount(repo: Repo): number {
  return repo.stash.length;
}

export function branchExists(repo: Repo, name: string): boolean {
  return Object.hasOwn(repo.branches, name);
}

export function branchContains(repo: Repo, branch: string, other: string): boolean {
  if (!branchExists(repo, branch) || !branchExists(repo, other)) {
    return false;
  }
  return ancestors(repo, repo.branches[branch]).includes(repo.branches[other]);
}

export function isMergeCommit(repo: Repo, branch: string): boolean {
  if (!branchExists(repo, branch)) {
    return false;
  }
  return repo.commits[repo.branches[branch]].parents.length === 2;
}

export function hasRemote(repo: Repo, name = "origin"): boolean {
  return repo.remote !== null && repo.remote.name === name;
}

export function isPushed(repo: Repo): boolean {
  if (repo.remote === null || isUnborn(repo)) {
    return false;
  }
  return repo.remote.branches[repo.head] === repo.branches[repo.head];
}

export function hasFetched(repo: Repo): boolean {
  if (repo.remote === null) {
    return false;
  }
  return Object.entries(repo.remote.branches).every(
    ([branch, hash]) => repo.remoteRefs[`${repo.remote?.name}/${branch}`] === hash,
  );
}

export function isBehind(repo: Repo): boolean {
  const info = trackingInfo(repo);
  return info !== null && info.behind > 0;
}

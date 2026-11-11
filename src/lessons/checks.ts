import { ancestors } from "@/engine/git/helpers";
import { history } from "@/engine/git/log";
import { computeStatus } from "@/engine/git/status";
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

export function isStaged(repo: Repo, path: FilePath): boolean {
  return computeStatus(repo).staged.some((change) => change.path === path);
}

export function isChanged(repo: Repo, path: FilePath): boolean {
  const { staged, unstaged } = computeStatus(repo);
  return [...staged, ...unstaged].some((change) => change.path === path);
}

export function commitCount(repo: Repo): number {
  return history(repo).length;
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

import { execute } from "@/engine/execute";
import { computeStatus } from "@/engine/git/status";
import { tokenize } from "@/engine/parse";
import { createEmptyRepo } from "@/engine/repo";
import type { Repo } from "@/engine/types";
import { copy } from "@/lib/landing/copy";

const ALLOWED: string[][] = [
  ["git", "init"],
  ["git", "status"],
  ["git", "add"],
  ["git", "commit"],
  ["git", "log"],
];

export const HERO_SCRIPT = [
  "git init",
  "git status",
  "git add .",
  'git commit -m "first commit"',
] as const;

export function heroStartRepo(): Repo {
  return execute(createEmptyRepo(), `echo "# My first repo" > ${copy.terminal.fileName}`).repo;
}

export function heroFilter(command: string): string | null {
  const words = tokenize(command);
  const allowed = ALLOWED.some((prefix) => prefix.every((word, i) => words[i] === word));
  return allowed ? null : copy.terminal.notSupported(command);
}

export function heroSuggestion(repo: Repo, history: string[]): string {
  if (!repo.initialized) {
    return "git init";
  }

  const { staged, unstaged, untracked } = computeStatus(repo);
  const ranStatus = history.some((command) => tokenize(command).join(" ") === "git status");

  if (!ranStatus && staged.length === 0 && Object.keys(repo.commits).length === 0) {
    return "git status";
  }
  if (untracked.length > 0 || unstaged.length > 0) {
    return "git add .";
  }
  if (staged.length > 0) {
    return 'git commit -m "first commit"';
  }
  return "git log";
}

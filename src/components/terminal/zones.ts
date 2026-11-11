import { isUnborn } from "@/engine/git/helpers";
import { computeStatus } from "@/engine/git/status";
import type { FilePath, Repo } from "@/engine/types";

export type Zone = "working" | "staging" | "local" | "remote";

export const ZONE_ORDER: Zone[] = ["working", "staging", "local", "remote"];

export function fileZone(repo: Repo, path: FilePath): Zone {
  if (!repo.initialized) {
    return "working";
  }

  const { staged, unstaged, untracked } = computeStatus(repo);

  if (untracked.includes(path) || unstaged.some((change) => change.path === path)) {
    return "working";
  }
  if (staged.some((change) => change.path === path)) {
    return "staging";
  }
  if (isUnborn(repo)) {
    return "working";
  }
  return "local";
}

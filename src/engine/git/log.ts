import type { Commit, CommitHash, CommandResult, Repo } from "../types";
import { ancestors, isUnborn } from "./helpers";

export function history(repo: Repo): Commit[] {
  if (isUnborn(repo)) {
    return [];
  }

  return ancestors(repo, repo.branches[repo.head])
    .map((hash) => repo.commits[hash])
    .sort((a, b) => b.order - a.order);
}

function decorate(repo: Repo, hash: CommitHash): string {
  const names = Object.keys(repo.branches)
    .filter((name) => repo.branches[name] === hash)
    .sort();
  const remoteNames = Object.keys(repo.remoteRefs)
    .filter((name) => repo.remoteRefs[name] === hash)
    .sort();
  const others = [...names.filter((name) => name !== repo.head), ...remoteNames];
  const labels = names.includes(repo.head) ? [`HEAD -> ${repo.head}`, ...others] : others;

  return labels.length > 0 ? ` (${labels.join(", ")})` : "";
}

export function log(repo: Repo, args: string[]): CommandResult {
  const oneline = args.length === 1 && args[0] === "--oneline";
  if (args.length > 0 && !oneline) {
    return { repo, output: "git log: only --oneline is supported" };
  }

  if (isUnborn(repo)) {
    return {
      repo,
      output: `fatal: your current branch '${repo.head}' does not have any commits yet`,
    };
  }

  const commits = history(repo);

  if (oneline) {
    const lines = commits.map((c) => `${c.hash}${decorate(repo, c.hash)} ${c.message}`);
    return { repo, output: lines.join("\n") };
  }

  const entries = commits.map(
    (c) => `commit ${c.hash}${decorate(repo, c.hash)}\n\n    ${c.message}`,
  );
  return { repo, output: entries.join("\n\n") };
}

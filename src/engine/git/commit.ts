import type { CommandResult, Repo } from "../types";
import { isUnborn, makeCommit } from "./helpers";
import { computeStatus, status } from "./status";

const ONLY_M = 'git commit: only git commit -m "message" is supported';

export function commit(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) {
    return { repo, output: `${ONLY_M} (the text editor is not available here)` };
  }
  if (args[0] !== "-m") {
    return { repo, output: ONLY_M };
  }
  if (args.length === 1) {
    return { repo, output: "error: switch `m' requires a value" };
  }
  if (args.length > 2) {
    return {
      repo,
      output: [
        `error: pathspec '${args[2]}' did not match any file(s) known to git`,
        `hint: put the message in quotes: git commit -m "${args.slice(1).join(" ")}"`,
      ].join("\n"),
    };
  }

  const staged = computeStatus(repo).staged;
  if (staged.length === 0) {
    return status(repo, []);
  }

  const message = args[1];
  const parents = isUnborn(repo) ? [] : [repo.branches[repo.head]];
  const newCommit = makeCommit(repo, message, parents, { ...repo.index });
  const { hash } = newCommit;

  const label = parents.length === 0 ? `${repo.head} (root-commit)` : repo.head;
  const files = staged.length === 1 ? "1 file changed" : `${staged.length} files changed`;

  return {
    repo: {
      ...repo,
      commits: { ...repo.commits, [hash]: newCommit },
      branches: { ...repo.branches, [repo.head]: hash },
    },
    output: `[${label} ${hash}] ${message}\n ${files}`,
  };
}
